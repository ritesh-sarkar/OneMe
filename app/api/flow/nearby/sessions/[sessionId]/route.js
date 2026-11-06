import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/libs/db';
import {
  authorizeNearbyRequest,
  getEligibleNearbyMember,
  privateNoStoreHeaders,
} from '@/libs/flow-nearby';
import { FlowNearbyExchange } from '@/libs/models/FlowNearbyExchange';
import { FlowNearbySession } from '@/libs/models/FlowNearbySession';
import { FlowNearbySignal } from '@/libs/models/FlowNearbySignal';
import { ProfileData } from '@/libs/models/ProfileData';
import { User } from '@/libs/models/User';

export const runtime = 'nodejs';

function notFound() {
  return NextResponse.json({ error: 'Nearby session is unavailable or expired.' }, {
    status: 404,
    headers: privateNoStoreHeaders(),
  });
}

export async function GET(request, { params }) {
  const auth = await authorizeNearbyRequest(request, 'presence-poll', 90);
  if (auth.response) return auth.response;

  const { sessionId } = await params;
  if (!mongoose.isValidObjectId(sessionId)) return notFound();

  try {
    await connectToDatabase();
    const now = new Date();
    const ownSession = await FlowNearbySession.findOneAndUpdate(
      {
        _id: sessionId,
        ownerId: auth.ownerId,
        status: 'active',
        expiresAt: { $gt: now },
      },
      { $set: { lastSeenAt: now, expiresAt: new Date(now.getTime() + 45_000) } },
      { new: true },
    ).select('_id').lean();
    if (!ownSession) return notFound();

    const member = await getEligibleNearbyMember(auth.ownerId);
    if (!member) {
      await FlowNearbySession.updateOne(
        { _id: sessionId, ownerId: auth.ownerId, status: 'active' },
        { $set: { status: 'stopped', expiresAt: now } },
      );
      return NextResponse.json({ error: 'Your profile no longer accepts OneMe Flow requests.' }, {
        status: 403,
        headers: privateNoStoreHeaders(),
      });
    }

    const nearbySessions = await FlowNearbySession.find({
      _id: { $ne: ownSession._id },
      ownerId: { $ne: auth.ownerId },
      status: 'active',
      expiresAt: { $gt: now },
    }).sort({ lastSeenAt: -1 }).limit(50).select('ownerId card lastSeenAt').lean();
    const peerIds = [...new Set(nearbySessions.map(({ ownerId }) => ownerId.toString()))]
      .map((id) => new mongoose.Types.ObjectId(id));
    const [accounts, profiles] = peerIds.length
      ? await Promise.all([
        User.find({ _id: { $in: peerIds }, emailVerifiedAt: { $ne: null } })
          .select('_id')
          .lean(),
        ProfileData.find({ ownerId: { $in: peerIds } })
          .select('ownerId data.profile.isPublished data.profile.privacy.allowContactExchange')
          .lean(),
      ])
      : [[], []];
    const eligibleIds = new Set(accounts.map((account) => account._id.toString()));
    const profileById = new Map(
      profiles.map((profile) => [profile.ownerId.toString(), profile.data?.profile]),
    );
    const seenMembers = new Set();
    const peers = nearbySessions.flatMap((nearby) => {
      const ownerId = nearby.ownerId.toString();
      const profile = profileById.get(ownerId);
      if (
        seenMembers.has(ownerId)
        || !eligibleIds.has(ownerId)
        || profile?.isPublished !== true
        || profile.privacy?.allowContactExchange !== true
      ) return [];
      seenMembers.add(ownerId);
      return [{
        sessionId: nearby._id.toString(),
        card: nearby.card,
        lastSeenAt: nearby.lastSeenAt,
      }];
    });

    const sessionFilter = {
      $or: [{ initiatorSessionId: ownSession._id }, { recipientSessionId: ownSession._id }],
    };
    const activeExchanges = await FlowNearbyExchange.find({
      ...sessionFilter,
      status: { $in: ['accepted', 'connected'] },
      expiresAt: { $gt: now },
    }).select('_id initiatorSessionId recipientSessionId').lean();
    const linkedSessionIds = [...new Set(activeExchanges.flatMap((exchange) => [
      exchange.initiatorSessionId.toString(),
      exchange.recipientSessionId.toString(),
    ]))].map((id) => new mongoose.Types.ObjectId(id));
    const liveSessions = await FlowNearbySession.find({
      _id: { $in: linkedSessionIds },
      status: 'active',
      expiresAt: { $gt: now },
    }).select('_id').lean();
    const liveSessionIds = new Set(liveSessions.map(({ _id }) => _id.toString()));
    const expiredExchangeIds = activeExchanges
      .filter((exchange) => (
        !liveSessionIds.has(exchange.initiatorSessionId.toString())
        || !liveSessionIds.has(exchange.recipientSessionId.toString())
      ))
      .map(({ _id }) => _id);
    if (expiredExchangeIds.length) {
      await Promise.all([
        FlowNearbyExchange.updateMany(
          { _id: { $in: expiredExchangeIds }, status: { $in: ['accepted', 'connected'] } },
          { $set: { status: 'closed', expiresAt: new Date(now.getTime() + 60_000) } },
        ),
        FlowNearbySignal.deleteMany({ exchangeId: { $in: expiredExchangeIds } }),
      ]);
    }
    const liveExchangeIds = activeExchanges
      .filter((exchange) => (
        liveSessionIds.has(exchange.initiatorSessionId.toString())
        && liveSessionIds.has(exchange.recipientSessionId.toString())
      ))
      .map(({ _id }) => _id);
    await FlowNearbyExchange.updateMany(
      { _id: { $in: liveExchangeIds }, expiresAt: { $gt: now } },
      { $set: { expiresAt: new Date(now.getTime() + 90_000) } },
    );
    const exchanges = await FlowNearbyExchange.find({
      ...sessionFilter,
      status: { $in: ['pending', 'accepted', 'connected'] },
      expiresAt: { $gt: now },
    }).sort({ createdAt: -1 }).limit(10).lean();
    const exchangeIds = exchanges.map((exchange) => exchange._id);
    const signals = exchangeIds.length
      ? await FlowNearbySignal.find({
        exchangeId: { $in: exchangeIds },
        receiverId: auth.ownerId,
        acknowledgedAt: null,
        expiresAt: { $gt: now },
      }).sort({ createdAt: 1 }).limit(100).lean()
      : [];

    return NextResponse.json({
      ownCard: member.card,
      peers,
      exchanges: exchanges.map((exchange) => {
        const isInitiator = exchange.initiatorId.toString() === auth.ownerId;
        return {
          id: exchange._id.toString(),
          status: exchange.status,
          role: isInitiator ? 'initiator' : 'recipient',
          peer: isInitiator ? exchange.recipientCard : exchange.initiatorCard,
          createdAt: exchange.createdAt,
          expiresAt: exchange.expiresAt,
        };
      }),
      signals: signals.map((signal) => ({
        id: signal._id.toString(),
        exchangeId: signal.exchangeId.toString(),
        kind: signal.kind,
        payload: signal.payload,
      })),
    }, { headers: privateNoStoreHeaders() });
  } catch (error) {
    console.error('Unable to poll OneMe Flow Nearby.', {
      error: error?.name || 'UnknownError',
      code: typeof error?.code === 'string' || typeof error?.code === 'number' ? error.code : undefined,
    });
    return NextResponse.json({ error: 'Nearby discovery is temporarily unavailable.' }, {
      status: 503,
      headers: privateNoStoreHeaders(),
    });
  }
}

export async function DELETE(request, { params }) {
  const auth = await authorizeNearbyRequest(request, 'presence-stop', 12);
  if (auth.response) return auth.response;

  const { sessionId } = await params;
  if (!mongoose.isValidObjectId(sessionId)) return notFound();

  try {
    await connectToDatabase();
    const now = new Date();
    const stopped = await FlowNearbySession.findOneAndUpdate(
      { _id: sessionId, ownerId: auth.ownerId, status: 'active' },
      { $set: { status: 'stopped', expiresAt: now } },
      { new: true },
    ).select('_id').lean();
    if (!stopped) return notFound();

    const exchanges = await FlowNearbyExchange.find({
      $or: [{ initiatorSessionId: stopped._id }, { recipientSessionId: stopped._id }],
      status: { $in: ['pending', 'accepted', 'connected'] },
    }).select('_id').lean();
    const exchangeIds = exchanges.map(({ _id }) => _id);
    await Promise.all([
      FlowNearbyExchange.updateMany(
        { _id: { $in: exchangeIds }, status: { $in: ['pending', 'accepted', 'connected'] } },
        { $set: { status: 'closed', expiresAt: new Date(now.getTime() + 60_000) } },
      ),
      FlowNearbySignal.deleteMany({ exchangeId: { $in: exchangeIds } }),
    ]);

    return NextResponse.json({ stopped: true }, { headers: privateNoStoreHeaders() });
  } catch (error) {
    console.error('Unable to stop OneMe Flow Nearby.', {
      error: error?.name || 'UnknownError',
      code: typeof error?.code === 'string' || typeof error?.code === 'number' ? error.code : undefined,
    });
    return NextResponse.json({ error: 'Nearby discovery could not be stopped.' }, {
      status: 503,
      headers: privateNoStoreHeaders(),
    });
  }
}
