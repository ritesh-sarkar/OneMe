import { NextResponse } from 'next/server';
import { passwordResetSchema } from '@/libs/auth-validation';
import { connectToDatabase } from '@/libs/db';
import { AuthToken } from '@/libs/models/AuthToken';
import { User } from '@/libs/models/User';
import { hashAuthToken } from '@/libs/auth-tokens';
import { consumeRateLimits } from '@/libs/rate-limit';
import { hash } from 'bcryptjs';
import { readJsonBody } from '@/libs/request-body';

export const runtime = 'nodejs';

export async function POST(request) {
  const body = await readJsonBody(request);
  if (!body.ok) {
    return NextResponse.json({ error: 'Invalid password reset request.' }, { status: body.status });
  }

  const parsed = passwordResetSchema.safeParse(body.value);
  if (!parsed.success) {
    return NextResponse.json({
      error: parsed.error.issues[0]?.message || 'Check your password and try again.',
    }, { status: 400 });
  }

  const tokenHash = hashAuthToken(parsed.data.token);
  const limit = await consumeRateLimits(request, [
    { name: 'password-reset-confirm', identity: tokenHash, windowSeconds: 900, limit: 5 },
  ]);
  if (!limit.ok) {
    if (limit.unavailable) {
      return NextResponse.json({ error: 'Password reset is temporarily unavailable.' }, { status: 503 });
    }
    return NextResponse.json(
      { error: 'Too many reset attempts. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } },
    );
  }

  try {
    await connectToDatabase();
    const passwordHash = await hash(parsed.data.password, 12);
    const authToken = await AuthToken.findOneAndDelete({
      tokenHash,
      purpose: 'reset-password',
      expiresAt: { $gt: new Date() },
    }).lean();
    if (!authToken) {
      return NextResponse.json({ error: 'Invalid or expired reset link.' }, { status: 400 });
    }

    const user = await User.findByIdAndUpdate(
      authToken.userId,
      { $set: { passwordHash }, $inc: { sessionVersion: 1 } },
      { new: true, projection: { _id: 1 } },
    ).lean();
    if (!user) {
      return NextResponse.json({ error: 'Invalid or expired reset link.' }, { status: 400 });
    }

    await AuthToken.deleteMany({ userId: user._id, purpose: 'reset-password' });
    return NextResponse.json({ message: 'Password has been reset. Please sign in again.' });
  } catch {
    return NextResponse.json({ error: 'Password reset is temporarily unavailable.' }, { status: 503 });
  }
}
