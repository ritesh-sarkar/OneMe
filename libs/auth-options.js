import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { compare, hash } from 'bcryptjs';
import { randomBytes } from 'node:crypto';
import { connectToDatabase } from '@/libs/db';
import { loginSchema, normalizeUsername } from '@/libs/auth-validation';
import { getVerifiedGoogleIdentity } from '@/libs/google-auth';
import { AuthToken } from '@/libs/models/AuthToken';
import { User } from '@/libs/models/User';
import { consumeRateLimits, getTrustedClientIp } from '@/libs/rate-limit';

const providers = [
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
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  }));
}

async function ensureGoogleAccount(profile) {
  const identity = getVerifiedGoogleIdentity(profile);
  if (!identity) return false;

  await connectToDatabase();
  const existing = await User.findOne({ email: identity.email }).lean();
  if (existing) {
    if (!existing.emailVerifiedAt) {
      await User.updateOne(
        { _id: existing._id, emailVerifiedAt: null },
        { $set: { emailVerifiedAt: new Date() }, $inc: { sessionVersion: 1 } },
      );
      await AuthToken.deleteMany({ userId: existing._id, purpose: 'verify-email' });
    }
    return true;
  }

  const passwordHash = await hash(randomBytes(32).toString('base64url'), 12);
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const username = `${normalizeUsername(identity.name).slice(0, 22)}-${randomBytes(3).toString('hex')}`;
    try {
      await User.create({
        ...identity,
        username,
        passwordHash,
        emailVerifiedAt: new Date(),
      });
      return true;
    } catch (error) {
      if (error?.code !== 11000) throw error;
      const racedAccount = await User.findOne({ email: identity.email }).lean();
      if (racedAccount) {
        if (!racedAccount.emailVerifiedAt) {
          await User.updateOne(
            { _id: racedAccount._id, emailVerifiedAt: null },
            { $set: { emailVerifiedAt: new Date() }, $inc: { sessionVersion: 1 } },
          );
          await AuthToken.deleteMany({ userId: racedAccount._id, purpose: 'verify-email' });
        }
        return true;
      }
    }
  }

  throw new Error('Unable to allocate a unique Google account username.');
}

export const authOptions = {
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  useSecureCookies: process.env.NODE_ENV === 'production' || process.env.VERCEL === '1',
  session: { strategy: 'jwt', maxAge: 60 * 60 },
  pages: { signIn: '/login' },
  providers,
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider !== 'google') return true;
      try {
        return await ensureGoogleAccount(profile);
      } catch (error) {
        console.error('Google sign-in account sync failed.', error?.name || 'UnknownError');
        return false;
      }
    },
    async jwt({ token, user, account }) {
      if (user) {
        if (account?.provider === 'google') {
          await connectToDatabase();
          const googleEmail = user.email?.trim().toLowerCase();
          const googleUser = googleEmail
            ? await User.findOne({ email: googleEmail })
              .select('_id name email username sessionVersion emailVerifiedAt')
              .lean()
            : null;
          if (!googleUser?.emailVerifiedAt) return { ...token, invalidSession: true };
          token.sub = googleUser._id.toString();
          token.name = googleUser.name;
          token.email = googleUser.email;
          token.username = googleUser.username;
          token.sessionVersion = googleUser.sessionVersion;
        } else {
          token.sub = user.id;
          token.username = user.username;
          token.sessionVersion = user.sessionVersion;
        }
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
