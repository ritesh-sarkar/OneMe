import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/libs/db';
import { escapeSearchTerm } from '@/libs/discovery';
import { ProfileData } from '@/libs/models/ProfileData';
import { User } from '@/libs/models/User';
import { consumeRateLimits, getTrustedClientIp } from '@/libs/rate-limit';

export const runtime = 'nodejs';

const PAGE_SIZE = 24;

export async function GET(request) {
  const search = new URL(request.url).searchParams.get('q') || '';
  const query = search.trim();
  const requestedPage = Number(new URL(request.url).searchParams.get('page') || 1);
  const page = Number.isInteger(requestedPage) && requestedPage >= 1 && requestedPage <= 100
    ? requestedPage
    : null;
  if (query.length > 80) {
    return NextResponse.json({ error: 'Search must be 80 characters or fewer.' }, { status: 400 });
  }
  if (!page) return NextResponse.json({ error: 'Invalid discovery page.' }, { status: 400 });

  const clientIp = getTrustedClientIp(request);
  if (!clientIp) {
    return NextResponse.json({ error: 'Discovery is temporarily unavailable.' }, { status: 503 });
  }
  const limit = await consumeRateLimits(request, [
    { name: 'discover-ip', identity: clientIp, windowSeconds: 60, limit: 60 },
  ]);
  if (!limit.ok) {
    if (limit.unavailable) {
      return NextResponse.json({ error: 'Discovery is temporarily unavailable.' }, { status: 503 });
    }
    return NextResponse.json(
      { error: 'Too many discovery searches. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } },
    );
  }

  try {
    await connectToDatabase();
    const stages = [
      {
        $match: {
          'data.profile.isPublished': true,
          'data.profile.privacy.allowDiscovery': true,
        },
      },
      {
        $lookup: {
          from: User.collection.name,
          localField: 'ownerId',
          foreignField: '_id',
          as: 'owner',
        },
      },
      { $unwind: '$owner' },
      { $match: { 'owner.emailVerifiedAt': { $ne: null } } },
    ];

    if (query) {
      const regex = { $regex: escapeSearchTerm(query), $options: 'i' };
      stages.push({
        $match: {
          $or: [
            { 'owner.name': regex },
            { 'owner.username': regex },
            { 'data.profile.title': regex },
            { 'data.profile.tagline': regex },
            { 'data.profile.skills.name': regex },
            {
              $and: [
                { 'data.profile.privacy.showLocation': true },
                { 'data.profile.location': regex },
              ],
            },
          ],
        },
      });
    }

    stages.push(
      {
        $project: {
          _id: 0,
          id: { $toString: '$owner._id' },
          name: '$owner.name',
          username: '$owner.username',
          title: { $ifNull: ['$data.profile.title', ''] },
          tagline: { $ifNull: ['$data.profile.tagline', ''] },
          avatar: { $ifNull: ['$data.profile.avatar', ''] },
          flowEnabled: { $eq: ['$data.profile.privacy.allowContactExchange', true] },
          location: {
            $cond: [
              { $eq: ['$data.profile.privacy.showLocation', true] },
              { $ifNull: ['$data.profile.location', ''] },
              '',
            ],
          },
          skills: {
            $map: {
              input: { $ifNull: ['$data.profile.skills', []] },
              as: 'skill',
              in: '$$skill.name',
            },
          },
          verified: { $ne: ['$owner.emailVerifiedAt', null] },
        },
      },
      { $sort: { username: 1 } },
      { $skip: (page - 1) * PAGE_SIZE },
      { $limit: PAGE_SIZE + 1 },
    );

    const profiles = await ProfileData.aggregate(stages).exec();
    const hasMore = profiles.length > PAGE_SIZE;
    return NextResponse.json({ profiles: profiles.slice(0, PAGE_SIZE), hasMore }, {
      headers: {
        'Cache-Control': 'private, no-store',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Discovery is temporarily unavailable.' }, { status: 503 });
  }
}
