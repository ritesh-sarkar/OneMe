import mongoose from 'mongoose';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/libs/auth-options';
import { connectToDatabase } from '@/libs/db';
import { FlowSession } from '@/libs/models/FlowSession';
import { consumeRateLimits, getTrustedClientIp } from '@/libs/rate-limit';
import { readJsonBody } from '@/libs/request-body';
import { z } from 'zod';

export const runtime = 'nodejs';

const deletionSchema = z.object({
  id: z.string().regex(/^[a-f0-9]{24}$/i).optional(),
  all: z.literal(true).optional(),
}).strict().refine((value) => Boolean(value.id) !== Boolean(value.all), {
  message: 'Specify one connection to remove or choose all.',
});

async function authorize(request) {
  const session = await getServerSession(authOptions);
  const ownerId = session?.user?.id;
  if (!ownerId || !mongoose.isValidObjectId(ownerId)) {
    return { response: NextResponse.json({ error: 'Authentication required.' }, { status: 401 }) };
  }

  const ip = getTrustedClientIp(request);
  if (!ip) {
    return { response: NextResponse.json({ error: 'Connections are temporarily unavailable.' }, { status: 503 }) };
  }
  const limit = await consumeRateLimits(request, [
    { name: 'connections-ip', identity: ip, windowSeconds: 60, limit: 60 },
    { name: 'connections-user', identity: ownerId, windowSeconds: 60, limit: 60 },
  ]);
  if (!limit.ok) {
    return {
      response: NextResponse.json(
        { error: limit.unavailable ? 'Connections are temporarily unavailable.' : 'Too many connection requests.' },
        limit.unavailable
          ? { status: 503 }
          : { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } },
      ),
    };
  }
  return { ownerId };
}

function connectionForOwner(record, ownerId) {
  const isRequester = record.requesterId.toString() === ownerId;
  return {
    id: record._id.toString(),
    peer: isRequester ? record.recipientCard : record.requesterCard,
    contact: isRequester ? record.recipientData : record.requesterData,
    exchangeMethod: 'OneMe Flow',
    dateConnected: record.respondedAt || record.updatedAt,
  };
}

export async function GET(request) {
  const auth = await authorize(request);
  if (auth.response) return auth.response;

  try {
    await connectToDatabase();
    const records = await FlowSession.find({
      status: 'accepted',
      hiddenFor: { $ne: new mongoose.Types.ObjectId(auth.ownerId) },
      $or: [{ requesterId: auth.ownerId }, { recipientId: auth.ownerId }],
    }).sort({ respondedAt: -1 }).limit(200).lean();

    return NextResponse.json({
      connections: records.map((record) => connectionForOwner(record, auth.ownerId)),
    }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    console.error('Unable to load saved connections.', error);
    return NextResponse.json({ error: 'Connections could not be loaded.' }, { status: 503 });
  }
}

export async function DELETE(request) {
  const auth = await authorize(request);
  if (auth.response) return auth.response;

  const body = await readJsonBody(request, 2 * 1024);
  if (!body.ok) return NextResponse.json({ error: 'Invalid connection request.' }, { status: body.status });
  const parsed = deletionSchema.safeParse(body.value);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid connection request.' }, { status: 400 });
  }

  try {
    await connectToDatabase();
    const ownerObjectId = new mongoose.Types.ObjectId(auth.ownerId);
    const filter = {
      status: 'accepted',
      $or: [{ requesterId: ownerObjectId }, { recipientId: ownerObjectId }],
    };
    if (parsed.data.id) filter._id = parsed.data.id;
    const result = await FlowSession.updateMany(
      filter,
      { $addToSet: { hiddenFor: ownerObjectId } },
    );

    return NextResponse.json({ removed: result.modifiedCount });
  } catch (error) {
    console.error('Unable to remove saved connections.', error);
    return NextResponse.json({ error: 'Connection could not be removed.' }, { status: 503 });
  }
}
