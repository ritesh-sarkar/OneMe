import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { recordAnalyticsEvent } from '@/libs/analytics';
import { profileAnalyticsEventSchema } from '@/libs/analytics-validation';
import { authOptions } from '@/libs/auth-options';
import { connectToDatabase } from '@/libs/db';
import { ProfileData } from '@/libs/models/ProfileData';
import { User } from '@/libs/models/User';
import { consumeRateLimits, getTrustedClientIp } from '@/libs/rate-limit';
import { readJsonBody } from '@/libs/request-body';

export const runtime = 'nodejs';

export async function POST(request, { params }) {
  const { username: rawUsername } = await params;
  const username = (rawUsername || '').replace(/^@/, '').toLowerCase();
  if (!/^[a-z0-9][a-z0-9-]{0,29}$/.test(username)) {
    return NextResponse.json({ error: 'Invalid profile.' }, { status: 404 });
  }

  const session = await getServerSession(authOptions);
  const clientIp = getTrustedClientIp(request);
  if (!clientIp) {
    return NextResponse.json({ error: 'Analytics are temporarily unavailable.' }, { status: 503 });
  }
  const limit = await consumeRateLimits(request, [
    { name: 'profile-event-ip', identity: clientIp, windowSeconds: 60, limit: 60 },
    ...(session?.user?.id
      ? [{ name: 'profile-event-user', identity: session.user.id, windowSeconds: 60, limit: 60 }]
      : []),
  ]);
  if (!limit.ok) {
    if (limit.unavailable) {
      return NextResponse.json({ error: 'Analytics are temporarily unavailable.' }, { status: 503 });
    }
    return NextResponse.json(
      { error: 'Too many analytics events. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } },
    );
  }

  const body = await readJsonBody(request);
  if (!body.ok) return NextResponse.json({ error: 'Invalid event.' }, { status: body.status });
  const parsed = profileAnalyticsEventSchema.safeParse(body.value);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid event.' }, { status: 400 });

  try {
    await connectToDatabase();
    const user = await User.findOne({
      username,
      emailVerifiedAt: { $ne: null },
    }).select('_id').lean();
    if (!user) return NextResponse.json({ recorded: false }, { status: 202 });

    const profile = await ProfileData.findOne({ ownerId: user._id }).select('data.profile.isPublished data.profile.privacy.allowAnalytics').lean();
    if (
      profile?.data?.profile?.isPublished !== true ||
      profile?.data?.profile?.privacy?.allowAnalytics !== true
    ) {
      return NextResponse.json({ recorded: false }, { status: 202 });
    }

    await recordAnalyticsEvent({
      ownerId: user._id,
      clientIp,
      eventType: parsed.data.eventType,
      target: parsed.data.target,
    });
    return NextResponse.json({ recorded: true }, { status: 202 });
  } catch (error) {
    console.error('Unable to record profile analytics event.', error);
    return NextResponse.json({ error: 'Analytics event could not be recorded.' }, { status: 503 });
  }
}
