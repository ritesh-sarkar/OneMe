import { createHash, randomBytes } from 'node:crypto';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/libs/auth-options';
import { connectToDatabase } from '@/libs/db';
import { FlowQrSession } from '@/libs/models/FlowQrSession';
import { ProfileData } from '@/libs/models/ProfileData';
import { User } from '@/libs/models/User';
import { consumeRateLimits, getTrustedClientIp } from '@/libs/rate-limit';

export const runtime = 'nodejs';

export async function POST(request) {
  const session = await getServerSession(authOptions);
  const ownerId = session?.user?.id;
  if (!ownerId || !mongoose.isValidObjectId(ownerId)) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }
  const clientIp = getTrustedClientIp(request);
  if (!clientIp) {
    return NextResponse.json({ error: 'OneMe Flow is temporarily unavailable.' }, { status: 503 });
  }
  const limit = await consumeRateLimits(request, [
    { name: 'flow-qr-create-ip', identity: clientIp, windowSeconds: 60, limit: 10 },
    { name: 'flow-qr-create-user', identity: ownerId, windowSeconds: 60, limit: 5 },
  ]);
  if (!limit.ok) {
    return NextResponse.json(
      { error: limit.unavailable ? 'OneMe Flow is temporarily unavailable.' : 'Too many QR sessions. Try again shortly.' },
      { status: limit.unavailable ? 503 : 429 },
    );
  }

  try {
    await connectToDatabase();
    const [account, record] = await Promise.all([
      User.findById(ownerId).select('name username emailVerifiedAt').lean(),
      ProfileData.findOne({ ownerId }).select('data.profile').lean(),
    ]);
    const profile = record?.data?.profile;
    if (
      !account?.emailVerifiedAt
      || profile?.isPublished !== true
      || profile.privacy?.allowContactExchange !== true
    ) {
      return NextResponse.json({
        error: 'Publish your profile and enable OneMe Flow requests before creating a QR session.',
      }, { status: 403 });
    }

    const token = randomBytes(32).toString('base64url');
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await FlowQrSession.create({
      tokenHash: createHash('sha256').update(token).digest('hex'),
      ownerId,
      expiresAt,
    });
    return NextResponse.json({
      url: `/dashboard/exchange/qr/${token}`,
      expiresAt,
    }, {
      status: 201,
      headers: { 'Cache-Control': 'private, no-store' },
    });
  } catch (error) {
    console.error('Unable to create OneMe Flow QR session.', {
      error: error?.name || 'UnknownError',
      code: typeof error?.code === 'string' || typeof error?.code === 'number' ? error.code : undefined,
    });
    return NextResponse.json({ error: 'OneMe Flow QR session could not be created.' }, { status: 503 });
  }
}
