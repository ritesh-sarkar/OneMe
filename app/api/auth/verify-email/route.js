import { NextResponse } from 'next/server';
import { z } from 'zod';
import { hash } from 'bcryptjs';
import { connectToDatabase } from '@/libs/db';
import { AuthToken } from '@/libs/models/AuthToken';
import { User } from '@/libs/models/User';
import { hashAuthToken } from '@/libs/auth-tokens';
import { consumeRateLimits } from '@/libs/rate-limit';
import { readJsonBody } from '@/libs/request-body';

export const runtime = 'nodejs';

const tokenSchema = z.object({
  token: z.string().min(40).max(128),
  password: z.string().min(12).max(72),
}).strict();

export async function POST(request) {
  const body = await readJsonBody(request);
  if (!body.ok) {
    return NextResponse.json({ error: 'Invalid verification link.' }, { status: body.status });
  }

  const parsed = tokenSchema.safeParse(body.value);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid or expired verification link.' }, { status: 400 });
  }

  const limit = await consumeRateLimits(request, [
    { name: 'verify-email', identity: hashAuthToken(parsed.data.token), windowSeconds: 900, limit: 5 },
  ]);
  if (!limit.ok) {
    if (limit.unavailable) {
      return NextResponse.json({ error: 'Email verification is temporarily unavailable.' }, { status: 503 });
    }
    return NextResponse.json(
      { error: 'Too many verification attempts. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } },
    );
  }

  try {
    await connectToDatabase();
    const passwordHash = await hash(parsed.data.password, 12);
    const authToken = await AuthToken.findOneAndDelete({
      tokenHash: hashAuthToken(parsed.data.token),
      purpose: 'verify-email',
      expiresAt: { $gt: new Date() },
    }).lean();
    if (!authToken) {
      return NextResponse.json({ error: 'Invalid or expired verification link.' }, { status: 400 });
    }

    const user = await User.findOneAndUpdate(
      { _id: authToken.userId, emailVerifiedAt: null },
      {
        $set: {
          emailVerifiedAt: new Date(),
          passwordHash,
        },
      },
      { new: true, projection: { _id: 1 } },
    ).lean();
    if (!user) {
      return NextResponse.json({ error: 'Invalid or expired verification link.' }, { status: 400 });
    }

    return NextResponse.json({ message: 'Email verified. You can now sign in.' });
  } catch {
    return NextResponse.json({ error: 'Email verification is temporarily unavailable.' }, { status: 503 });
  }
}
