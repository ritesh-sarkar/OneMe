import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/libs/db';
import { authorizeNearbyRequest, getEligibleNearbyMember, privateNoStoreHeaders } from '@/libs/flow-nearby';
import { FlowNearbySession } from '@/libs/models/FlowNearbySession';

export const runtime = 'nodejs';

export async function POST(request) {
  const auth = await authorizeNearbyRequest(request, 'presence-start', 6);
  if (auth.response) return auth.response;

  try {
    await connectToDatabase();
    const member = await getEligibleNearbyMember(auth.ownerId);
    if (!member) {
      return NextResponse.json({
        error: 'Publish your profile and enable OneMe Flow requests before becoming visible.',
      }, { status: 403, headers: privateNoStoreHeaders() });
    }

    const now = new Date();
    const session = await FlowNearbySession.create({
      ownerId: new mongoose.Types.ObjectId(auth.ownerId),
      card: member.card,
      status: 'active',
      lastSeenAt: now,
      expiresAt: new Date(now.getTime() + 45_000),
    });

    return NextResponse.json({
      session: { id: session._id.toString(), card: session.card, expiresAt: session.expiresAt },
    }, { status: 201, headers: privateNoStoreHeaders() });
  } catch (error) {
    console.error('Unable to start OneMe Flow Nearby presence.', {
      error: error?.name || 'UnknownError',
      code: typeof error?.code === 'string' || typeof error?.code === 'number' ? error.code : undefined,
    });
    return NextResponse.json({ error: 'Nearby discovery could not be started.' }, {
      status: 503,
      headers: privateNoStoreHeaders(),
    });
  }
}
