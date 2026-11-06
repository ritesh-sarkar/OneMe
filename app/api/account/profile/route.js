import mongoose from 'mongoose';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { accountProfileUpdateSchema } from '@/libs/auth-validation';
import { authOptions } from '@/libs/auth-options';
import { connectToDatabase } from '@/libs/db';
import { User } from '@/libs/models/User';
import { consumeRateLimits, getTrustedClientIp } from '@/libs/rate-limit';
import { readJsonBody } from '@/libs/request-body';

export const runtime = 'nodejs';

export async function PUT(request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId || !mongoose.isValidObjectId(userId)) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  const clientIp = getTrustedClientIp(request);
  if (!clientIp) {
    return NextResponse.json({ error: 'Account profile is temporarily unavailable.' }, { status: 503 });
  }
  const limit = await consumeRateLimits(request, [
    { name: 'account-profile-ip', identity: clientIp, windowSeconds: 60, limit: 30 },
    { name: 'account-profile-user', identity: userId, windowSeconds: 60, limit: 15 },
  ]);
  if (!limit.ok) {
    return NextResponse.json(
      { error: limit.unavailable ? 'Account profile is temporarily unavailable.' : 'Too many account updates. Please try again later.' },
      limit.unavailable
        ? { status: 503 }
        : { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } },
    );
  }

  const body = await readJsonBody(request, 4 * 1024);
  if (!body.ok) {
    return NextResponse.json({ error: 'Invalid account profile request.' }, { status: body.status });
  }
  const parsed = accountProfileUpdateSchema.safeParse(body.value);
  if (!parsed.success) {
    return NextResponse.json({
      error: parsed.error.issues[0]?.message || 'Account profile information is invalid.',
    }, { status: 400 });
  }

  try {
    await connectToDatabase();
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: parsed.data },
      { runValidators: true, returnDocument: 'after' },
    ).select('_id name username').lean();

    if (!updatedUser) {
      return NextResponse.json({ error: 'Account not found.' }, { status: 404 });
    }

    return NextResponse.json({
      saved: true,
      user: {
        id: updatedUser._id.toString(),
        name: updatedUser.name,
        username: updatedUser.username,
      },
    }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    if (error?.code === 11000 && (error?.keyPattern?.username || error?.keyValue?.username)) {
      return NextResponse.json({ error: 'That username is already taken. Choose another one.' }, { status: 409 });
    }
    console.error('Unable to update account profile.', {
      error: error?.name || 'UnknownError',
      code: typeof error?.code === 'string' || typeof error?.code === 'number' ? error.code : undefined,
    });
    return NextResponse.json({ error: 'Account profile could not be saved right now.' }, { status: 503 });
  }
}
