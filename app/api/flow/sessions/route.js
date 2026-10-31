import mongoose from 'mongoose';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/libs/auth-options';
import { connectToDatabase } from '@/libs/db';
import { createFlowRequestSchema, createFlowCard, availableFlowFields } from '@/libs/flow-validation';
import { FlowSession } from '@/libs/models/FlowSession';
import { ProfileData } from '@/libs/models/ProfileData';
import { User } from '@/libs/models/User';
import { consumeRateLimits, getTrustedClientIp } from '@/libs/rate-limit';
import { readJsonBody } from '@/libs/request-body';

export const runtime = 'nodejs';

function unauthorized() {
  return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
}

async function applyRateLimit(request, userId, name, limit) {
  const clientIp = getTrustedClientIp(request);
  if (!clientIp) {
    return { response: NextResponse.json({ error: 'OneMe Flow is temporarily unavailable.' }, { status: 503 }) };
  }
  const result = await consumeRateLimits(request, [
    { name: `${name}-ip`, identity: clientIp, windowSeconds: 60, limit },
    { name: `${name}-user`, identity: userId, windowSeconds: 60, limit },
  ]);
  if (!result.ok) {
    return {
      response: NextResponse.json(
        { error: result.unavailable ? 'OneMe Flow is temporarily unavailable.' : 'Too many Flow requests. Please try again later.' },
        result.unavailable
          ? { status: 503 }
          : { status: 429, headers: { 'Retry-After': String(result.retryAfter) } },
      ),
    };
  }
  return { clientIp };
}

export async function GET(request) {
  const session = await getServerSession(authOptions);
  const ownerId = session?.user?.id;
  if (!ownerId || !mongoose.isValidObjectId(ownerId)) return unauthorized();

  const limited = await applyRateLimit(request, ownerId, 'flow-inbox', 60);
  if (limited.response) return limited.response;

  try {
    await connectToDatabase();
    const now = new Date();
    const [incoming, outgoing] = await Promise.all([
      FlowSession.find({
        recipientId: ownerId,
        status: 'pending',
        expiresAt: { $gt: now },
      }).sort({ createdAt: -1 }).limit(50).lean(),
      FlowSession.find({
        requesterId: ownerId,
        status: 'pending',
        expiresAt: { $gt: now },
      }).sort({ createdAt: -1 }).limit(50).lean(),
    ]);

    return NextResponse.json({
      incoming: incoming.map((item) => ({
        id: item._id.toString(),
        requester: item.requesterCard,
        shareFields: item.requesterFields,
        createdAt: item.createdAt,
        expiresAt: item.expiresAt,
      })),
      outgoing: outgoing.map((item) => ({
        id: item._id.toString(),
        recipient: item.recipientCard,
        createdAt: item.createdAt,
        expiresAt: item.expiresAt,
      })),
    }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    console.error('Unable to load OneMe Flow requests.', error);
    return NextResponse.json({ error: 'OneMe Flow requests could not be loaded.' }, { status: 503 });
  }
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  const requesterId = session?.user?.id;
  if (!requesterId || !mongoose.isValidObjectId(requesterId)) return unauthorized();

  const limited = await applyRateLimit(request, requesterId, 'flow-create', 12);
  if (limited.response) return limited.response;

  const body = await readJsonBody(request, 8 * 1024);
  if (!body.ok) return NextResponse.json({ error: 'Invalid Flow request.' }, { status: body.status });
  const parsed = createFlowRequestSchema.safeParse(body.value);
  if (!parsed.success) {
    return NextResponse.json({
      error: parsed.error.issues[0]?.message || 'Flow request is invalid.',
    }, { status: 400 });
  }

  try {
    await connectToDatabase();
    const requesterObjectId = new mongoose.Types.ObjectId(requesterId);
    const requester = await User.findById(requesterObjectId)
      .select('name username email emailVerifiedAt')
      .lean();
    if (!requester?.emailVerifiedAt) return unauthorized();

    const recipient = await User.findOne({
      username: parsed.data.targetUsername,
      emailVerifiedAt: { $ne: null },
    }).select('name username email').lean();
    if (!recipient) return NextResponse.json({ error: 'That verified OneMe account was not found.' }, { status: 404 });
    if (recipient._id.equals(requesterObjectId)) {
      return NextResponse.json({ error: 'You cannot exchange contact details with yourself.' }, { status: 400 });
    }

    const [requesterRecord, recipientRecord] = await Promise.all([
      ProfileData.findOne({ ownerId: requesterObjectId }).select('data').lean(),
      ProfileData.findOne({ ownerId: recipient._id }).select('data').lean(),
    ]);
    const requesterProfile = requesterRecord?.data?.profile;
    const recipientProfile = recipientRecord?.data?.profile;
    if (
      requesterProfile?.isPublished !== true ||
      requesterProfile?.privacy?.allowContactExchange !== true
    ) {
      return NextResponse.json({
        error: 'Publish your profile and enable OneMe Flow requests in Settings & Privacy first.',
      }, { status: 403 });
    }
    if (
      recipientProfile?.isPublished !== true ||
      recipientProfile?.privacy?.allowContactExchange !== true
    ) {
      return NextResponse.json({ error: 'This account is not accepting OneMe Flow requests.' }, { status: 403 });
    }

    const availableFields = availableFlowFields(requester, requesterProfile);
    if (!parsed.data.shareFields.every((field) => availableFields.includes(field))) {
      return NextResponse.json({ error: 'One or more selected details are unavailable in your profile.' }, { status: 400 });
    }

    const now = new Date();
    const pairKey = [requesterObjectId.toString(), recipient._id.toString()].sort().join(':');
    await FlowSession.updateMany(
      { pairKey, status: 'pending', expiresAt: { $lte: now } },
      { $set: { status: 'cancelled', respondedAt: now, purgeAt: now } },
    );
    const existing = await FlowSession.findOne({
      pairKey,
      status: 'pending',
      expiresAt: { $gt: now },
    }).select('_id').lean();
    if (existing) {
      return NextResponse.json({ error: 'You already have a pending request to this account.' }, { status: 409 });
    }

    const flowRequest = await FlowSession.create({
      requesterId: requesterObjectId,
      recipientId: recipient._id,
      pairKey,
      requesterCard: createFlowCard(requester, requesterProfile),
      recipientCard: createFlowCard(recipient, recipientProfile),
      requesterFields: parsed.data.shareFields,
      expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      purgeAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
    });

    return NextResponse.json({
      request: {
        id: flowRequest._id.toString(),
        status: flowRequest.status,
        expiresAt: flowRequest.expiresAt,
      },
    }, { status: 201, headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    if (error?.code === 11000) {
      return NextResponse.json({ error: 'You already have a pending request to this account.' }, { status: 409 });
    }
    console.error('Unable to create OneMe Flow request.', error);
    return NextResponse.json({ error: 'OneMe Flow request could not be created.' }, { status: 503 });
  }
}
