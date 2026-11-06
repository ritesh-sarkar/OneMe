import { createHash } from 'node:crypto';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/libs/auth-options';
import { connectToDatabase } from '@/libs/db';
import {
  availableFlowFields,
  createFlowCard,
  flowSelectionSchema,
  getFlowFieldOptions,
} from '@/libs/flow-validation';
import { FlowQrSession } from '@/libs/models/FlowQrSession';
import { FlowSession } from '@/libs/models/FlowSession';
import { ProfileData } from '@/libs/models/ProfileData';
import { User } from '@/libs/models/User';
import { consumeRateLimits, getTrustedClientIp } from '@/libs/rate-limit';
import { readJsonBody } from '@/libs/request-body';

export const runtime = 'nodejs';

function tokenDigest(token) {
  return createHash('sha256').update(token).digest('hex');
}

function invalidSession() {
  return NextResponse.json({ error: 'This QR session is invalid, expired, or already used.' }, {
    status: 404,
    headers: { 'Cache-Control': 'private, no-store' },
  });
}

async function applyLimit(request, userId, action) {
  const ip = getTrustedClientIp(request);
  if (!ip) return NextResponse.json({ error: 'OneMe Flow is temporarily unavailable.' }, { status: 503 });
  const result = await consumeRateLimits(request, [
    { name: `flow-qr-${action}-ip`, identity: ip, windowSeconds: 60, limit: 30 },
    { name: `flow-qr-${action}-user`, identity: userId, windowSeconds: 60, limit: 30 },
  ]);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.unavailable ? 'OneMe Flow is temporarily unavailable.' : 'Too many QR requests.' },
      {
        status: result.unavailable ? 503 : 429,
        ...(!result.unavailable ? { headers: { 'Retry-After': String(result.retryAfter) } } : {}),
      },
    );
  }
  return null;
}

export async function GET(request, { params }) {
  const session = await getServerSession(authOptions);
  const viewerId = session?.user?.id;
  if (!viewerId || !mongoose.isValidObjectId(viewerId)) {
    return NextResponse.json({ error: 'Sign in to scan a OneMe Flow QR code.' }, { status: 401 });
  }
  const limited = await applyLimit(request, viewerId, 'scan');
  if (limited) return limited;
  const { token } = await params;
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) return invalidSession();

  try {
    await connectToDatabase();
    const qr = await FlowQrSession.findOne({
      tokenHash: tokenDigest(token),
      status: 'active',
      expiresAt: { $gt: new Date() },
    }).select('ownerId expiresAt').lean();
    if (!qr || qr.ownerId.toString() === viewerId) return invalidSession();

    const [account, record] = await Promise.all([
      User.findOne({
        _id: qr.ownerId,
        emailVerifiedAt: { $ne: null },
      }).select('name username').lean(),
      ProfileData.findOne({ ownerId: qr.ownerId }).select('data.profile').lean(),
    ]);
    const profile = record?.data?.profile;
    if (
      !account
      || profile?.isPublished !== true
      || profile.privacy?.allowContactExchange !== true
    ) return invalidSession();

    return NextResponse.json({
      recipient: createFlowCard(account, profile),
      expiresIn: Math.max(0, Math.floor((qr.expiresAt - Date.now()) / 1000)),
    }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    console.error('Unable to validate OneMe Flow QR session.', {
      error: error?.name || 'UnknownError',
      code: typeof error?.code === 'string' || typeof error?.code === 'number' ? error.code : undefined,
    });
    return NextResponse.json({ error: 'OneMe Flow is temporarily unavailable.' }, { status: 503 });
  }
}

export async function POST(request, { params }) {
  const session = await getServerSession(authOptions);
  const requesterId = session?.user?.id;
  if (!requesterId || !mongoose.isValidObjectId(requesterId)) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }
  const limited = await applyLimit(request, requesterId, 'request');
  if (limited) return limited;
  const { token } = await params;
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) return invalidSession();
  const body = await readJsonBody(request, 64 * 1024);
  if (!body.ok) return NextResponse.json({ error: 'Invalid Flow request.' }, { status: body.status });
  const parsed = flowSelectionSchema.safeParse(body.value);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Select valid information to share.' }, { status: 400 });
  }

  try {
    await connectToDatabase();
    const now = new Date();
    const qr = await FlowQrSession.findOneAndUpdate(
      {
        tokenHash: tokenDigest(token),
        status: 'active',
        expiresAt: { $gt: now },
        ownerId: { $ne: requesterId },
      },
      { $set: { status: 'claimed', claimedBy: requesterId } },
      { new: true },
    ).select('ownerId').lean();
    if (!qr) return invalidSession();

    let requestCreated = false;
    try {
      const [requester, recipient, requesterRecord, recipientRecord] = await Promise.all([
        User.findOne({ _id: requesterId, emailVerifiedAt: { $ne: null } }).select('name username email emailVerifiedAt').lean(),
        User.findOne({ _id: qr.ownerId, emailVerifiedAt: { $ne: null } }).select('name username email emailVerifiedAt').lean(),
        ProfileData.findOne({ ownerId: requesterId }).select('data').lean(),
        ProfileData.findOne({ ownerId: qr.ownerId }).select('data').lean(),
      ]);
      const requesterData = requesterRecord?.data || {};
      const recipientData = recipientRecord?.data || {};
      const requesterProfile = requesterData.profile;
      const recipientProfile = recipientData.profile;
      if (
        !requester
        || !recipient
        || requesterProfile?.isPublished !== true
        || recipientProfile?.isPublished !== true
        || requesterProfile.privacy?.allowContactExchange !== true
        || recipientProfile.privacy?.allowContactExchange !== true
      ) return invalidSession();

      const available = availableFlowFields(requester, requesterProfile, requesterData);
      if (!parsed.data.shareFields.every((field) => available.includes(field))) {
        return NextResponse.json({ error: 'One or more selected details are unavailable in your profile.' }, { status: 400 });
      }

      const requesterObjectId = new mongoose.Types.ObjectId(requesterId);
      const pairKey = [requesterId, qr.ownerId.toString()].sort().join(':');
      await FlowSession.updateMany(
        { pairKey, status: 'pending', expiresAt: { $lte: now } },
        { $set: { status: 'cancelled', respondedAt: now, purgeAt: now } },
      );
      const flowRequest = await FlowSession.create({
        requesterId: requesterObjectId,
        recipientId: qr.ownerId,
        pairKey,
        requesterCard: createFlowCard(requester, requesterProfile),
        recipientCard: createFlowCard(recipient, recipientProfile),
        requesterFields: parsed.data.shareFields,
        requesterFieldLabels: getFlowFieldOptions(requester, requesterProfile, requesterData)
          .filter((field) => parsed.data.shareFields.includes(field.id))
          .map(({ id, label, requestLabel }) => ({ id, label: requestLabel || label })),
        expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        purgeAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      });
      requestCreated = true;
      try {
        const completed = await FlowQrSession.updateOne(
          { _id: qr._id, status: 'claimed', claimedBy: requesterId },
          { $set: { status: 'completed' } },
        );
        if (completed.modifiedCount !== 1) {
          console.error('Flow request was created but QR session finalization did not update a record.', {
            code: 'qr_finalize_missed',
          });
        }
      } catch (error) {
        console.error('Flow request was created but QR session finalization failed.', {
          error: error?.name || 'UnknownError',
          code: typeof error?.code === 'string' || typeof error?.code === 'number' ? error.code : undefined,
        });
      }
      return NextResponse.json({
        request: { id: flowRequest._id.toString(), status: flowRequest.status },
      }, { status: 201, headers: { 'Cache-Control': 'private, no-store' } });
    } finally {
      if (!requestCreated) {
        await FlowQrSession.updateOne(
          { _id: qr._id, status: 'claimed', claimedBy: requesterId, expiresAt: { $gt: new Date() } },
          { $set: { status: 'active' }, $unset: { claimedBy: 1 } },
        );
      }
    }
  } catch (error) {
    if (error?.code === 11000) {
      return NextResponse.json({ error: 'A pending exchange already exists for these accounts.' }, { status: 409 });
    }
    console.error('Unable to create OneMe Flow request from QR.', {
      error: error?.name || 'UnknownError',
      code: typeof error?.code === 'string' || typeof error?.code === 'number' ? error.code : undefined,
    });
    return NextResponse.json({ error: 'Flow request could not be created.' }, { status: 503 });
  }
}
