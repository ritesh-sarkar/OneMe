import mongoose from 'mongoose';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/libs/auth-options';
import { connectToDatabase } from '@/libs/db';
import { AnalyticsEvent } from '@/libs/models/AnalyticsEvent';
import { consumeRateLimits, getTrustedClientIp } from '@/libs/rate-limit';

export const runtime = 'nodejs';

function utcDateKey(date) {
  return date.toISOString().slice(0, 10);
}

export async function GET(request) {
  const session = await getServerSession(authOptions);
  const ownerId = session?.user?.id;
  if (!ownerId || !mongoose.isValidObjectId(ownerId)) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  const days = Number(new URL(request.url).searchParams.get('days') || 7);
  if (![7, 30, 90].includes(days)) {
    return NextResponse.json({ error: 'Choose a 7, 30, or 90 day period.' }, { status: 400 });
  }

  const clientIp = getTrustedClientIp(request);
  if (!clientIp) {
    return NextResponse.json({ error: 'Analytics are temporarily unavailable.' }, { status: 503 });
  }
  const limit = await consumeRateLimits(request, [
    { name: 'analytics-ip', identity: clientIp, windowSeconds: 60, limit: 30 },
    { name: 'analytics-user', identity: ownerId, windowSeconds: 60, limit: 20 },
  ]);
  if (!limit.ok) {
    if (limit.unavailable) {
      return NextResponse.json({ error: 'Analytics are temporarily unavailable.' }, { status: 503 });
    }
    return NextResponse.json(
      { error: 'Too many analytics requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } },
    );
  }

  try {
    await connectToDatabase();
    const now = new Date();
    const from = new Date(now);
    from.setUTCDate(from.getUTCDate() - days + 1);
    from.setUTCHours(0, 0, 0, 0);

    const [result = { counts: [], days: [], topLinks: [] }] = await AnalyticsEvent.aggregate([
      { $match: { ownerId: new mongoose.Types.ObjectId(ownerId), createdAt: { $gte: from } } },
      {
        $facet: {
          counts: [
            { $group: { _id: '$eventType', count: { $sum: 1 } } },
          ],
          days: [
            { $match: { eventType: 'profile_view' } },
            {
              $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'UTC' } },
                views: { $sum: 1 },
                visitors: { $addToSet: '$visitorHash' },
              },
            },
            { $project: { views: 1, uniqueVisitors: { $size: '$visitors' } } },
            { $sort: { _id: 1 } },
          ],
          topLinks: [
            { $match: { eventType: { $in: ['link_click', 'resume_download', 'contact_click'] } } },
            { $group: { _id: { eventType: '$eventType', target: '$target' }, clicks: { $sum: 1 } } },
            { $sort: { clicks: -1 } },
            { $limit: 10 },
          ],
        },
      },
    ]).exec();

    const counts = Object.fromEntries(result.counts.map(({ _id, count }) => [_id, count]));
    const dailyViews = new Map(result.days.map((item) => [item._id, item]));
    const viewsOverTime = Array.from({ length: days }, (_, index) => {
      const date = new Date(from);
      date.setUTCDate(from.getUTCDate() + index);
      const key = utcDateKey(date);
      const day = dailyViews.get(key);
      return {
        date: key,
        views: day?.views || 0,
        uniqueVisitors: day?.uniqueVisitors || 0,
      };
    });

    return NextResponse.json({
      rangeDays: days,
      overview: {
        profileViews: counts.profile_view || 0,
        linkClicks: counts.link_click || 0,
        resumeDownloads: counts.resume_download || 0,
        contactClicks: counts.contact_click || 0,
        uniqueDailyVisitors: result.days.reduce((total, item) => total + item.uniqueVisitors, 0),
      },
      viewsOverTime,
      topLinks: result.topLinks.map((item) => ({
        eventType: item._id.eventType,
        label: item._id.target || 'Profile interaction',
        clicks: item.clicks,
      })),
      retentionDays: 90,
    }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    console.error('Unable to load account analytics.', error);
    return NextResponse.json({ error: 'Analytics could not be loaded.' }, { status: 503 });
  }
}
