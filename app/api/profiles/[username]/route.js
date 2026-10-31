import { NextResponse } from 'next/server';
import { recordAnalyticsEvent } from '@/libs/analytics';
import { connectToDatabase } from '@/libs/db';
import { ProfileData } from '@/libs/models/ProfileData';
import { User } from '@/libs/models/User';
import { createPublicProfilePayload } from '@/libs/public-profile';
import { consumeRateLimits, getTrustedClientIp } from '@/libs/rate-limit';

export const runtime = 'nodejs';

function notFound() {
  return NextResponse.json({ error: 'Profile not found.' }, {
    status: 404,
    headers: {
      'Cache-Control': 'private, no-store',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
}

export async function GET(request, { params }) {
  const { username: rawUsername } = await params;
  const username = (rawUsername || '').replace(/^@/, '').toLowerCase();
  if (!/^[a-z0-9][a-z0-9-]{0,29}$/.test(username)) return notFound();

  const clientIp = getTrustedClientIp(request);
  if (!clientIp) {
    return NextResponse.json({ error: 'Profile service is temporarily unavailable.' }, { status: 503 });
  }
  const limit = await consumeRateLimits(request, [
    { name: 'public-profile-ip', identity: clientIp, windowSeconds: 60, limit: 120 },
  ]);
  if (!limit.ok) {
    if (limit.unavailable) {
      return NextResponse.json({ error: 'Profile service is temporarily unavailable.' }, { status: 503 });
    }
    return NextResponse.json(
      { error: 'Too many profile requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } },
    );
  }

  try {
    await connectToDatabase();
    const user = await User.findOne({
      username,
      emailVerifiedAt: { $ne: null },
    }).select('name username email emailVerifiedAt').lean();
    if (!user) return notFound();

    const record = await ProfileData.findOne({ ownerId: user._id }).select('data').lean();
    const payload = record?.data && createPublicProfilePayload({
      id: user._id.toString(),
      name: user.name,
      username: user.username,
      email: user.email,
    }, record.data);
    if (!payload) return notFound();
    if (
      payload.user.privacy?.allowAnalytics === true &&
      (process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET)
    ) {
      try {
        await recordAnalyticsEvent({
          ownerId: user._id,
          clientIp,
          eventType: 'profile_view',
        });
      } catch (error) {
        console.error('Unable to record public profile view.', error);
      }
    }
    return NextResponse.json(payload, {
      headers: {
        'Cache-Control': 'private, no-store',
        'X-Robots-Tag': payload.indexable ? 'index, follow' : 'noindex, follow',
      },
    });
  } catch (error) {
    console.error('Unable to load public profile.', error);
    return NextResponse.json({ error: 'Profile service is temporarily unavailable.' }, { status: 503 });
  }
}
