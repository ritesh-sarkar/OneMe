import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/libs/db';
import { authorizeNearbyRequest, privateNoStoreHeaders } from '@/libs/flow-nearby';
import { flowNearbySignalBodySchema } from '@/libs/flow-nearby-validation';
import { FlowNearbyExchange } from '@/libs/models/FlowNearbyExchange';
import { FlowNearbySession } from '@/libs/models/FlowNearbySession';
import { FlowNearbySignal } from '@/libs/models/FlowNearbySignal';
import { readJsonBody } from '@/libs/request-body';

export const runtime = 'nodejs';

function failure(message, status) {
  return NextResponse.json({ error: message }, { status, headers: privateNoStoreHeaders() });
}

export async function POST(request, { params }) {
  const auth = await authorizeNearbyRequest(request, 'signaling', 180);
  if (auth.response) return auth.response;

  const { exchangeId } = await params;
  if (!mongoose.isValidObjectId(exchangeId)) {
    return failure('Nearby connection is unavailable.', 404);
  }
  const body = await readJsonBody(request, 24 * 1024);
  if (!body.ok) return failure('Invalid WebRTC signaling message.', body.status);
  const parsed = flowNearbySignalBodySchema.safeParse(body.value);
  if (!parsed.success) return failure('Invalid WebRTC signaling message.', 400);

  try {
    await connectToDatabase();
    const now = new Date();
    const exchange = await FlowNearbyExchange.findOne({
      _id: exchangeId,
      $or: [{ initiatorId: auth.ownerId }, { recipientId: auth.ownerId }],
      status: { $in: ['accepted', 'connected'] },
      expiresAt: { $gt: now },
    }).lean();
    if (!exchange) return failure('Accept the Nearby invitation before signaling.', 404);

    const isInitiator = exchange.initiatorId.toString() === auth.ownerId;
    const ownSessionId = isInitiator ? exchange.initiatorSessionId : exchange.recipientSessionId;
    const peerId = isInitiator ? exchange.recipientId : exchange.initiatorId;
    if (ownSessionId.toString() !== parsed.data.sessionId) {
      return failure('Your Nearby presence is not part of this connection.', 403);
    }
    const presence = await FlowNearbySession.findOne({
      _id: parsed.data.sessionId,
      ownerId: auth.ownerId,
      status: 'active',
      expiresAt: { $gt: now },
    }).select('_id').lean();
    if (!presence) return failure('Your Nearby presence has ended.', 404);

    if (parsed.data.action === 'ack') {
      await FlowNearbySignal.updateMany(
        {
          _id: { $in: parsed.data.signalIds },
          exchangeId: exchange._id,
          receiverId: auth.ownerId,
          acknowledgedAt: null,
        },
        { $set: { acknowledgedAt: now } },
      );
      return NextResponse.json({ acknowledged: true }, { headers: privateNoStoreHeaders() });
    }

    const recentSignals = await FlowNearbySignal.countDocuments({
      exchangeId: exchange._id,
      senderId: auth.ownerId,
      createdAt: { $gte: new Date(now.getTime() - 2 * 60_000) },
    });
    if (recentSignals >= 100) return failure('Too many WebRTC signaling messages.', 429);

    try {
      const signal = await FlowNearbySignal.create({
        exchangeId: exchange._id,
        senderId: auth.ownerId,
        receiverId: peerId,
        clientSignalId: parsed.data.signalId,
        kind: parsed.data.signal.kind,
        payload: parsed.data.signal.payload,
        expiresAt: new Date(now.getTime() + 2 * 60_000),
      });
      return NextResponse.json({ id: signal._id.toString() }, {
        status: 201,
        headers: privateNoStoreHeaders(),
      });
    } catch (error) {
      if (error?.code === 11000) {
        return NextResponse.json({ duplicate: true }, { headers: privateNoStoreHeaders() });
      }
      throw error;
    }
  } catch (error) {
    console.error('Unable to deliver WebRTC signaling.', {
      error: error?.name || 'UnknownError',
      code: typeof error?.code === 'string' || typeof error?.code === 'number' ? error.code : undefined,
    });
    return failure('WebRTC signaling is temporarily unavailable.', 503);
  }
}
