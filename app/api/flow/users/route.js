import mongoose from 'mongoose';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/libs/auth-options';
import { connectToDatabase } from '@/libs/db';
import { escapeSearchTerm } from '@/libs/discovery';
import { ProfileData } from '@/libs/models/ProfileData';
import { User } from '@/libs/models/User';
import { consumeRateLimits, getTrustedClientIp } from '@/libs/rate-limit';
import { normalizePublicUsername } from '@/libs/public-username';

export const runtime = 'nodejs';

function failure(message, status) {
  return NextResponse.json({ error: message }, {
    status,
    headers: { 'Cache-Control': 'private, no-store' },
  });
}

export async function GET(request) {
  const session = await getServerSession(authOptions);
  const ownerId = session?.user?.id;
  if (!ownerId || !mongoose.isValidObjectId(ownerId)) {
    return failure('Authentication required.', 401);
  }

  const clientIp = getTrustedClientIp(request);
  if (!clientIp) return failure('OneMe Flow is temporarily unavailable.', 503);
  const limit = await consumeRateLimits(request, [
    { name: 'flow-user-search-ip', identity: clientIp, windowSeconds: 60, limit: 30 },
    { name: 'flow-user-search-user', identity: ownerId, windowSeconds: 60, limit: 30 },
  ]);
  if (!limit.ok) {
    return failure(
      limit.unavailable ? 'OneMe Flow is temporarily unavailable.' : 'Too many searches. Please try again shortly.',
      limit.unavailable ? 503 : 429,
    );
  }

  const query = normalizePublicUsername(new URL(request.url).searchParams.get('q') || '');
  if (query.length < 2 || query.length > 30 || !/^[a-z0-9-]+$/.test(query)) {
    return NextResponse.json({ users: [] }, {
      headers: { 'Cache-Control': 'private, no-store' },
    });
  }

  try {
    await connectToDatabase();
    const accounts = await User.find({
      username: { $regex: `^${escapeSearchTerm(query)}` },
      _id: { $ne: ownerId },
      emailVerifiedAt: { $ne: null },
    })
      .select('_id name username')
      .sort({ username: 1 })
      .limit(20)
      .lean();
    if (!accounts.length) {
      return NextResponse.json({ users: [] }, {
        headers: { 'Cache-Control': 'private, no-store' },
      });
    }

    const records = await ProfileData.find({
      ownerId: { $in: accounts.map((account) => account._id) },
    }).select('ownerId data.profile').lean();
    const profileByOwner = new Map(
      records.map((record) => [record.ownerId.toString(), record.data?.profile]),
    );
    const users = accounts.flatMap((account) => {
      const profile = profileByOwner.get(account._id.toString());
      if (
        profile?.isPublished !== true
        || profile.privacy?.allowContactExchange !== true
      ) return [];
      return [{
        name: account.name,
        username: account.username,
        title: typeof profile.title === 'string' ? profile.title : '',
        avatar: typeof profile.avatar === 'string' ? profile.avatar : '',
      }];
    }).slice(0, 8);

    return NextResponse.json({ users }, {
      headers: { 'Cache-Control': 'private, no-store' },
    });
  } catch (error) {
    console.error('Unable to search OneMe Flow members.', {
      error: error?.name || 'UnknownError',
      code: typeof error?.code === 'string' || typeof error?.code === 'number' ? error.code : undefined,
    });
    return failure('OneMe Flow search is temporarily unavailable.', 503);
  }
}
