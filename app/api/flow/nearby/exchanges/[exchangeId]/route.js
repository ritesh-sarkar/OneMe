import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/libs/db';
import { authorizeNearbyRequest, getEligibleNearbyMember, privateNoStoreHeaders } from '@/libs/flow-nearby';
import { flowNearbyActionSchema } from '@/libs/flow-nearby-validation';
import { FlowNearbyExchange } from '@/libs/models/FlowNearbyExchange';
import { FlowNearbySession } from '@/libs/models/FlowNearbySession';
import { FlowNearbySignal } from '@/libs/models/FlowNearbySignal';
import { readJsonBody } from '@/libs/request-body';

export const runtime = 'nodejs';

function missingExchange() {
  return NextResponse.json({ error: 'Nearby invitation is unavailable or expired.' }, {
    status: 404,
    headers: privateNoStoreHeaders(),
  });
}

export async function PATCH(request, { params }) {
  const auth = await authorizeNearbyRequest(request, 'exchange-action', 40);
  if (auth.response) return auth.response;

  const { exchangeId } = await params;
  if (!mongoose.isValidObjectId(exchangeId)) return missingExchange();
  const body = await readJsonBody(request, 2 * 1024);
  if (!body.ok) return NextResponse.json({ error: 'Invalid Nearby action.' }, { status: body.status });
  const parsed = flowNearbyActionSchema.safeParse(body.value);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Choose a valid Nearby action.' }, {
      status: 400,
      headers: privateNoStoreHeaders(),
    });
  }

  try {
    await connectToDatabase();
    const now = new Date();
    const exchange = await FlowNearbyExchange.findOne({
      _id: exchangeId,
      $or: [{ initiatorId: auth.ownerId }, { recipientId: auth.ownerId }],
      status: { $in: ['pending', 'accepted', 'connected'] },
      expiresAt: { $gt: now },
    }).lean();
    if (!exchange) return missingExchange();

    const action = parsed.data.action;
    if (action === 'accept' || action === 'reject') {
      if (exchange.recipientId.toString() !== auth.ownerId || exchange.status !== 'pending') {
        return NextResponse.json({ error: 'Only the invited member can respond to this invitation.' }, {
          status: 403,
          headers: privateNoStoreHeaders(),
        });
      }
      if (action === 'accept') {
        const [initiator, recipient, sessions] = await Promise.all([
          getEligibleNearbyMember(exchange.initiatorId),
          getEligibleNearbyMember(exchange.recipientId),
          FlowNearbySession.find({
            _id: { $in: [exchange.initiatorSessionId, exchange.recipientSessionId] },
            status: 'active',
            expiresAt: { $gt: now },
          }).select('_id').lean(),
        ]);
        if (!initiator || !recipient || sessions.length !== 2) {
          return NextResponse.json({ error: 'A member is no longer available for Nearby exchange.' }, {
            status: 409,
            headers: privateNoStoreHeaders(),
          });
        }
      }

      const updated = await FlowNearbyExchange.findOneAndUpdate(
        {
          _id: exchangeId,
          recipientId: auth.ownerId,
          status: 'pending',
          expiresAt: { $gt: now },
        },
        {
          $set: {
            status: action === 'accept' ? 'accepted' : 'rejected',
            expiresAt: new Date(now.getTime() + (action === 'accept' ? 90_000 : 60_000)),
          },
        },
        { new: true },
      ).select('_id status').lean();
      if (!updated) return missingExchange();
      return NextResponse.json({ status: updated.status }, { headers: privateNoStoreHeaders() });
    }

    if (action === 'connected') {
      if (!['accepted', 'connected'].includes(exchange.status)) {
        return NextResponse.json({ error: 'Accept the invitation before signaling a connection.' }, {
          status: 409,
          headers: privateNoStoreHeaders(),
        });
      }
      const ownSessionId = exchange.initiatorId.toString() === auth.ownerId
        ? exchange.initiatorSessionId
        : exchange.recipientSessionId;
      if (ownSessionId.toString() !== parsed.data.sessionId) {
        return NextResponse.json({ error: 'Your Nearby presence is not part of this connection.' }, {
          status: 403,
          headers: privateNoStoreHeaders(),
        });
      }
      const presence = await FlowNearbySession.exists({
        _id: parsed.data.sessionId,
        ownerId: auth.ownerId,
        status: 'active',
        expiresAt: { $gt: now },
      });
      if (!presence) {
        return NextResponse.json({ error: 'Your Nearby presence has ended.' }, {
          status: 404,
          headers: privateNoStoreHeaders(),
        });
      }
      const updated = await FlowNearbyExchange.findOneAndUpdate(
        { _id: exchangeId, status: { $in: ['accepted', 'connected'] }, expiresAt: { $gt: now } },
        { $set: { status: 'connected', expiresAt: new Date(now.getTime() + 90_000) } },
        { new: true },
      ).select('_id status').lean();
      if (!updated) return missingExchange();
      return NextResponse.json({ status: updated.status }, { headers: privateNoStoreHeaders() });
    }

    const updated = await FlowNearbyExchange.findOneAndUpdate(
      {
        _id: exchangeId,
        $or: [{ initiatorId: auth.ownerId }, { recipientId: auth.ownerId }],
        status: { $in: ['pending', 'accepted', 'connected'] },
      },
      { $set: { status: 'closed', expiresAt: new Date(now.getTime() + 60_000) } },
      { new: true },
    ).select('_id status').lean();
    if (!updated) return missingExchange();
    await FlowNearbySignal.deleteMany({ exchangeId });
    return NextResponse.json({ status: updated.status }, { headers: privateNoStoreHeaders() });
  } catch (error) {
    if (error?.code === 11000) {
      return NextResponse.json({ error: 'This member already has an active Nearby connection.' }, {
        status: 409,
        headers: privateNoStoreHeaders(),
      });
    }
    console.error('Unable to update OneMe Flow Nearby invitation.', {
      error: error?.name || 'UnknownError',
      code: typeof error?.code === 'string' || typeof error?.code === 'number' ? error.code : undefined,
    });
    return NextResponse.json({ error: 'Nearby invitation could not be updated.' }, {
      status: 503,
      headers: privateNoStoreHeaders(),
    });
  }
}
