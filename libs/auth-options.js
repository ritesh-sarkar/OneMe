import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { connectToDatabase } from '@/libs/db';
import { loginSchema } from '@/libs/auth-validation';
import { User } from '@/libs/models/User';
import { consumeRateLimits, getTrustedClientIp } from '@/libs/rate-limit';

export const authOptions = {
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  useSecureCookies: process.env.NODE_ENV === 'production' || process.env.VERCEL === '1',
  session: { strategy: 'jwt', maxAge: 60 * 60 },
  pages: { signIn: '/login' },
  providers: [
    CredentialsProvider({
      name: 'Email and password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, request) {
        const parsed = loginSchema.safeParse({
          email: credentials?.email,
          password: credentials?.password,
        });
        if (!parsed.success) return null;

        const clientIp = getTrustedClientIp(request);
        if (!clientIp) return null;

        const limit = await consumeRateLimits(request, [
          { name: 'login-ip', identity: clientIp, windowSeconds: 900, limit: 15 },
          { name: 'login-email', identity: parsed.data.email, windowSeconds: 900, limit: 8 },
        ]);
        if (!limit.ok) return null;

        await connectToDatabase();
        const user = await User.findOne({ email: parsed.data.email })
          .select('+passwordHash')
          .lean();

        if (
          !user ||
          !user.emailVerifiedAt ||
          !(await compare(parsed.data.password, user.passwordHash))
        ) {
          return null;
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          username: user.username,
          sessionVersion: user.sessionVersion,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.username = user.username;
        token.sessionVersion = user.sessionVersion;
      }

      if (!token.sub) return { ...token, invalidSession: true };

      await connectToDatabase();
      const currentUser = await User.findById(token.sub)
        .select('_id username sessionVersion emailVerifiedAt')
        .lean();

      if (
        !currentUser ||
        !currentUser.emailVerifiedAt ||
        currentUser.sessionVersion !== token.sessionVersion
      ) {
        return { ...token, invalidSession: true };
      }

      token.username = currentUser.username;
      return token;
    },
    async session({ session, token }) {
      if (token.invalidSession || !token.sub || !session.user) return null;

      session.user.id = token.sub;
      session.user.username = token.username;
      return session;
    },
  },
};
