import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/libs/db';
import { authorizeNearbyRequest, getEligibleNearbyMember, privateNoStoreHeaders } from '@/libs/flow-nearby';
import { flowNearbyInviteSchema } from '@/libs/flow-nearby-validation';
import { FlowNearbyExchange } from '@/libs/models/FlowNearbyExchange';
import { FlowNearbySession } from '@/libs/models/FlowNearbySession';
import { readJsonBody } from '@/libs/request-body';

export const runtime = 'nodejs';

export async function POST(request) {
  const auth = await authorizeNearbyRequest(request, 'invite', 20);
  if (auth.response) return auth.response;

  const body = await readJsonBody(request, 2 * 1024);
  if (!body.ok) return NextResponse.json({ error: 'Invalid Nearby invitation.' }, { status: body.status });
  const parsed = flowNearbyInviteSchema.safeParse(body.value);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Select an available OneMe member.' }, {
      status: 400,
      headers: privateNoStoreHeaders(),
    });
  }
  if (parsed.data.sessionId === parsed.data.targetSessionId) {
    return NextResponse.json({ error: 'You cannot connect to your own device.' }, {
      status: 400,
      headers: privateNoStoreHeaders(),
    });
  }

  try {
    await connectToDatabase();
    const now = new Date();
    const [ownSession, targetSession, initiator] = await Promise.all([
      FlowNearbySession.findOne({
        _id: parsed.data.sessionId,
        ownerId: auth.ownerId,
        status: 'active',
        expiresAt: { $gt: now },
      }).lean(),
      FlowNearbySession.findOne({
        _id: parsed.data.targetSessionId,
        ownerId: { $ne: auth.ownerId },
        status: 'active',
        expiresAt: { $gt: now },
      }).lean(),
      getEligibleNearbyMember(auth.ownerId),
    ]);
    if (!ownSession) {
      return NextResponse.json({ error: 'Your Nearby session expired. Start discovery again.' }, {
        status: 404,
        headers: privateNoStoreHeaders(),
      });
    }
    if (!targetSession) {
      return NextResponse.json({ error: 'That member is no longer available.' }, {
        status: 404,
        headers: privateNoStoreHeaders(),
      });
    }
    const eligibleRecipient = await getEligibleNearbyMember(targetSession.ownerId);
    if (!initiator || !eligibleRecipient) {
      return NextResponse.json({ error: 'OneMe Flow is no longer enabled for this member.' }, {
        status: 409,
        headers: privateNoStoreHeaders(),
      });
    }
    const activeConnection = await FlowNearbyExchange.exists({
      status: { $in: ['accepted', 'connected'] },
      expiresAt: { $gt: now },
      $or: [
        { initiatorSessionId: ownSession._id },
        { recipientSessionId: ownSession._id },
      ],
    });
    if (activeConnection) {
      return NextResponse.json({ error: 'Disconnect your current Nearby peer before connecting to someone else.' }, {
        status: 409,
        headers: privateNoStoreHeaders(),
      });
    }

    const exchange = await FlowNearbyExchange.create({
      pairKey: [auth.ownerId, targetSession.ownerId.toString()].sort().join(':'),
      initiatorSessionId: ownSession._id,
      recipientSessionId: targetSession._id,
      initiatorId: ownSession.ownerId,
      recipientId: targetSession.ownerId,
      initiatorCard: initiator.card,
      recipientCard: eligibleRecipient.card,
      status: 'pending',
      expiresAt: new Date(now.getTime() + 2 * 60_000),
    });
    return NextResponse.json({
      exchange: {
        id: exchange._id.toString(),
        status: exchange.status,
        peer: exchange.recipientCard,
        expiresAt: exchange.expiresAt,
      },
    }, { status: 201, headers: privateNoStoreHeaders() });
  } catch (error) {
    if (error?.code === 11000) {
      return NextResponse.json({ error: 'A Nearby invitation or connection already exists for these members.' }, {
        status: 409,
        headers: privateNoStoreHeaders(),
      });
    }
    console.error('Unable to create OneMe Flow Nearby invitation.', {
      error: error?.name || 'UnknownError',
      code: typeof error?.code === 'string' || typeof error?.code === 'number' ? error.code : undefined,
    });
    return NextResponse.json({ error: 'Nearby invitation could not be sent.' }, {
      status: 503,
      headers: privateNoStoreHeaders(),
    });
  }
}
