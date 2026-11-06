import mongoose from 'mongoose';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/libs/auth-options';
import { ProfileData } from '@/libs/models/ProfileData';
import { User } from '@/libs/models/User';
import { consumeRateLimits, getTrustedClientIp } from '@/libs/rate-limit';

export async function authorizeNearbyRequest(request, action, limit = 120) {
  const session = await getServerSession(authOptions);
  const ownerId = session?.user?.id;
  if (!ownerId || !mongoose.isValidObjectId(ownerId)) {
    return {
      response: NextResponse.json({ error: 'Sign in to use OneMe Flow Nearby.' }, { status: 401 }),
    };
  }

  const ip = getTrustedClientIp(request);
  if (!ip) {
    return {
      response: NextResponse.json({ error: 'Nearby exchange is temporarily unavailable.' }, { status: 503 }),
    };
  }

  const result = await consumeRateLimits(request, [
    { name: `flow-nearby-${action}-ip`, identity: ip, windowSeconds: 60, limit },
    { name: `flow-nearby-${action}-user`, identity: ownerId, windowSeconds: 60, limit },
  ]);
  if (!result.ok) {
    return {
      response: NextResponse.json(
        { error: result.unavailable ? 'Nearby exchange is temporarily unavailable.' : 'Too many Nearby requests.' },
        result.unavailable
          ? { status: 503 }
          : { status: 429, headers: { 'Retry-After': String(result.retryAfter) } },
      ),
    };
  }

  return { ownerId };
}

export async function getEligibleNearbyMember(ownerId) {
  const [account, record] = await Promise.all([
    User.findOne({ _id: ownerId, emailVerifiedAt: { $ne: null } })
      .select('name username emailVerifiedAt')
      .lean(),
    ProfileData.findOne({ ownerId }).select('data.profile').lean(),
  ]);
  const profile = record?.data?.profile;
  if (
    !account
    || profile?.isPublished !== true
    || profile.privacy?.allowContactExchange !== true
  ) return null;

  return {
    id: account._id,
    card: {
      name: account.name,
      username: account.username,
      title: typeof profile.title === 'string' ? profile.title : '',
      avatar: typeof profile.avatar === 'string' ? profile.avatar : '',
    },
  };
}

export function privateNoStoreHeaders() {
  return { 'Cache-Control': 'private, no-store' };
}
