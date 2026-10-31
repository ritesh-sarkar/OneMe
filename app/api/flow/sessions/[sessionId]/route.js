import mongoose from 'mongoose';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/libs/auth-options';
import { connectToDatabase } from '@/libs/db';
import {
  createFlowContactData,
  respondToFlowSchema,
  availableFlowFields,
} from '@/libs/flow-validation';
import { FlowSession } from '@/libs/models/FlowSession';
import { ProfileData } from '@/libs/models/ProfileData';
import { User } from '@/libs/models/User';
import { consumeRateLimits, getTrustedClientIp } from '@/libs/rate-limit';
import { readJsonBody } from '@/libs/request-body';

export const runtime = 'nodejs';

function authError() {
  return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
}

async function rateLimit(request, userId) {
  const ip = getTrustedClientIp(request);
  if (!ip) return NextResponse.json({ error: 'OneMe Flow is temporarily unavailable.' }, { status: 503 });
  const result = await consumeRateLimits(request, [
    { name: 'flow-respond-ip', identity: ip, windowSeconds: 60, limit: 30 },
    { name: 'flow-respond-user', identity: userId, windowSeconds: 60, limit: 30 },
  ]);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.unavailable ? 'OneMe Flow is temporarily unavailable.' : 'Too many Flow requests. Please try again later.' },
      result.unavailable
        ? { status: 503 }
        : { status: 429, headers: { 'Retry-After': String(result.retryAfter) } },
    );
  }
  return null;
}

export async function PATCH(request, { params }) {
  const session = await getServerSession(authOptions);
  const ownerId = session?.user?.id;
  if (!ownerId || !mongoose.isValidObjectId(ownerId)) return authError();

  const limited = await rateLimit(request, ownerId);
  if (limited) return limited;

  const { sessionId } = await params;
  if (!mongoose.isValidObjectId(sessionId)) {
    return NextResponse.json({ error: 'Flow request not found.' }, { status: 404 });
  }
  const body = await readJsonBody(request, 8 * 1024);
  if (!body.ok) return NextResponse.json({ error: 'Invalid response.' }, { status: body.status });
  const parsed = respondToFlowSchema.safeParse(body.value);
  if (!parsed.success) {
    return NextResponse.json({
      error: parsed.error.issues[0]?.message || 'Flow response is invalid.',
    }, { status: 400 });
  }

  try {
    await connectToDatabase();
    const now = new Date();
    const record = await FlowSession.findOne({
      _id: sessionId,
      recipientId: ownerId,
      status: 'pending',
      expiresAt: { $gt: now },
    }).lean();
    if (!record) {
      return NextResponse.json({ error: 'This request is unavailable, expired, or already answered.' }, { status: 404 });
    }

    if (parsed.data.action === 'decline') {
      const purgeAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      const declined = await FlowSession.findOneAndUpdate(
        { _id: sessionId, recipientId: ownerId, status: 'pending', expiresAt: { $gt: now } },
        { $set: { status: 'declined', respondedAt: now, purgeAt } },
        { new: true },
      ).select('_id status').lean();
      if (!declined) {
        return NextResponse.json({ error: 'This request has already been answered.' }, { status: 409 });
      }
      return NextResponse.json({ status: declined.status });
    }

    const requesterId = record.requesterId.toString();
    const [requester, recipient, requesterRecord, recipientRecord] = await Promise.all([
      User.findById(requesterId).select('name username email emailVerifiedAt').lean(),
      User.findById(ownerId).select('name username email emailVerifiedAt').lean(),
      ProfileData.findOne({ ownerId: requesterId }).select('data').lean(),
      ProfileData.findOne({ ownerId }).select('data').lean(),
    ]);
    const requesterProfile = requesterRecord?.data?.profile;
    const recipientProfile = recipientRecord?.data?.profile;
    if (
      !requester?.emailVerifiedAt ||
      !recipient?.emailVerifiedAt ||
      requesterProfile?.isPublished !== true ||
      recipientProfile?.isPublished !== true ||
      requesterProfile?.privacy?.allowContactExchange !== true ||
      recipientProfile?.privacy?.allowContactExchange !== true
    ) {
      await FlowSession.updateOne(
        { _id: sessionId, recipientId: ownerId, status: 'pending' },
        { $set: { status: 'cancelled', respondedAt: now, purgeAt: now } },
      );
      return NextResponse.json({ error: 'A participant has disabled OneMe Flow or unpublished their profile.' }, { status: 409 });
    }

    const recipientFields = availableFlowFields(recipient, recipientProfile);
    if (!parsed.data.shareFields.every((field) => recipientFields.includes(field))) {
      return NextResponse.json({ error: 'One or more selected details are no longer available.' }, { status: 400 });
    }

    const requesterData = createFlowContactData({
      account: requester,
      profile: requesterProfile,
      fields: record.requesterFields,
    });
    const recipientData = createFlowContactData({
      account: recipient,
      profile: recipientProfile,
      fields: parsed.data.shareFields,
    });

    const accepted = await FlowSession.findOneAndUpdate(
      { _id: sessionId, recipientId: ownerId, status: 'pending', expiresAt: { $gt: now } },
      {
        $set: {
          status: 'accepted',
          recipientFields: parsed.data.shareFields,
          requesterData,
          recipientData,
          respondedAt: now,
          purgeAt: null,
        },
      },
      { new: true },
    ).select('_id status').lean();
    if (!accepted) {
      return NextResponse.json({ error: 'This request has already been answered.' }, { status: 409 });
    }
    return NextResponse.json({ status: accepted.status });
  } catch (error) {
    console.error('Unable to respond to OneMe Flow request.', error);
    return NextResponse.json({ error: 'Flow response could not be saved.' }, { status: 503 });
  }
}

export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions);
  const ownerId = session?.user?.id;
  if (!ownerId || !mongoose.isValidObjectId(ownerId)) return authError();

  const limited = await rateLimit(request, ownerId);
  if (limited) return limited;

  const { sessionId } = await params;
  if (!mongoose.isValidObjectId(sessionId)) {
    return NextResponse.json({ error: 'Flow request not found.' }, { status: 404 });
  }

  try {
    await connectToDatabase();
    const cancelled = await FlowSession.findOneAndUpdate(
      { _id: sessionId, requesterId: ownerId, status: 'pending' },
      { $set: { status: 'cancelled', respondedAt: new Date(), purgeAt: new Date() } },
      { new: true },
    ).select('_id').lean();
    if (!cancelled) {
      return NextResponse.json({ error: 'Pending Flow request not found.' }, { status: 404 });
    }
    return NextResponse.json({ cancelled: true });
  } catch (error) {
    console.error('Unable to cancel OneMe Flow request.', error);
    return NextResponse.json({ error: 'Flow request could not be cancelled.' }, { status: 503 });
  }
}
