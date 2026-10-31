import mongoose from 'mongoose';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/libs/auth-options';
import { connectToDatabase } from '@/libs/db';
import { FlowSession } from '@/libs/models/FlowSession';
import {
  notificationActionSchema,
  markAllNotificationsSchema,
} from '@/libs/notification-validation';
import { consumeRateLimits, getTrustedClientIp } from '@/libs/rate-limit';
import { readJsonBody } from '@/libs/request-body';

export const runtime = 'nodejs';

const RETENTION_MS = 30 * 24 * 60 * 60 * 1000;

async function authorize(request) {
  const session = await getServerSession(authOptions);
  const ownerId = session?.user?.id;
  if (!ownerId || !mongoose.isValidObjectId(ownerId)) {
    return { response: NextResponse.json({ error: 'Authentication required.' }, { status: 401 }) };
  }

  const clientIp = getTrustedClientIp(request);
  if (!clientIp) {
    return { response: NextResponse.json({ error: 'Notifications are temporarily unavailable.' }, { status: 503 }) };
  }
  const limit = await consumeRateLimits(request, [
    { name: 'notifications-ip', identity: clientIp, windowSeconds: 60, limit: 90 },
    { name: 'notifications-user', identity: ownerId, windowSeconds: 60, limit: 90 },
  ]);
  if (!limit.ok) {
    return {
      response: NextResponse.json(
        { error: limit.unavailable ? 'Notifications are temporarily unavailable.' : 'Too many notification requests.' },
        limit.unavailable
          ? { status: 503 }
          : { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } },
      ),
    };
  }
  return { ownerId };
}

function incomingNotification(record) {
  return {
    id: record._id.toString(),
    event: 'incoming',
    type: 'flow-request',
    title: 'New OneMe Flow request',
    message: `${record.requesterCard.name} wants to exchange selected contact details. Review the request before sharing.`,
    peer: record.requesterCard,
    createdAt: record.createdAt,
    read: Boolean(record.recipientNotificationReadAt),
  };
}

function responseNotification(record) {
  const accepted = record.status === 'accepted';
  return {
    id: record._id.toString(),
    event: 'response',
    type: accepted ? 'connection' : 'flow-request',
    title: accepted ? 'Contact exchange accepted' : 'Flow request declined',
    message: accepted
      ? `${record.recipientCard.name} accepted your request and chose contact details to share.`
      : `${record.recipientCard.name} declined your contact exchange request.`,
    peer: record.recipientCard,
    createdAt: record.respondedAt,
    read: Boolean(record.requesterNotificationReadAt),
  };
}

export async function GET(request) {
  const auth = await authorize(request);
  if (auth.response) return auth.response;

  try {
    await connectToDatabase();
    const now = new Date();
    const since = new Date(now.getTime() - RETENTION_MS);
    const [incoming, responses] = await Promise.all([
      FlowSession.find({
        recipientId: auth.ownerId,
        status: 'pending',
        expiresAt: { $gt: now },
        recipientNotificationDismissedAt: null,
      }).sort({ createdAt: -1 }).limit(50).lean(),
      FlowSession.find({
        requesterId: auth.ownerId,
        status: { $in: ['accepted', 'declined'] },
        respondedAt: { $gte: since },
        requesterNotificationDismissedAt: null,
      }).sort({ respondedAt: -1 }).limit(50).lean(),
    ]);

    const notifications = [
      ...incoming.map(incomingNotification),
      ...responses.map(responseNotification),
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 50);

    return NextResponse.json({ notifications }, {
      headers: { 'Cache-Control': 'private, no-store' },
    });
  } catch (error) {
    console.error('Unable to load notifications.', error);
    return NextResponse.json({ error: 'Notifications could not be loaded.' }, { status: 503 });
  }
}

export async function PATCH(request) {
  const auth = await authorize(request);
  if (auth.response) return auth.response;

  const body = await readJsonBody(request, 2 * 1024);
  if (!body.ok) return NextResponse.json({ error: 'Invalid notification request.' }, { status: body.status });
  const all = markAllNotificationsSchema.safeParse(body.value);
  const one = notificationActionSchema.safeParse(body.value);
  if (!all.success && !one.success) {
    return NextResponse.json({ error: 'Specify one notification or mark all as read.' }, { status: 400 });
  }

  try {
    await connectToDatabase();
    const now = new Date();
    if (all.success) {
      const since = new Date(now.getTime() - RETENTION_MS);
      const [incoming, responses] = await Promise.all([
        FlowSession.updateMany({
          recipientId: auth.ownerId,
          status: 'pending',
          expiresAt: { $gt: now },
          recipientNotificationReadAt: null,
          recipientNotificationDismissedAt: null,
        }, { $set: { recipientNotificationReadAt: now } }),
        FlowSession.updateMany({
          requesterId: auth.ownerId,
          status: { $in: ['accepted', 'declined'] },
          respondedAt: { $gte: since },
          requesterNotificationReadAt: null,
          requesterNotificationDismissedAt: null,
        }, { $set: { requesterNotificationReadAt: now } }),
      ]);
      return NextResponse.json({ markedRead: incoming.modifiedCount + responses.modifiedCount });
    }

    const isIncoming = one.data.event === 'incoming';
    const filter = isIncoming
      ? { _id: one.data.id, recipientId: auth.ownerId, status: 'pending', expiresAt: { $gt: now }, recipientNotificationDismissedAt: null }
      : { _id: one.data.id, requesterId: auth.ownerId, status: { $in: ['accepted', 'declined'] }, respondedAt: { $gte: new Date(now.getTime() - RETENTION_MS) }, requesterNotificationDismissedAt: null };
    const updateField = isIncoming ? 'recipientNotificationReadAt' : 'requesterNotificationReadAt';
    const updated = await FlowSession.findOneAndUpdate(
      filter,
      { $set: { [updateField]: now } },
      { new: true },
    ).select('_id').lean();
    if (!updated) return NextResponse.json({ error: 'Notification not found.' }, { status: 404 });
    return NextResponse.json({ markedRead: true });
  } catch (error) {
    console.error('Unable to update notification read state.', error);
    return NextResponse.json({ error: 'Notification could not be updated.' }, { status: 503 });
  }
}

export async function DELETE(request) {
  const auth = await authorize(request);
  if (auth.response) return auth.response;

  const body = await readJsonBody(request, 2 * 1024);
  if (!body.ok) return NextResponse.json({ error: 'Invalid notification request.' }, { status: body.status });
  const parsed = notificationActionSchema.safeParse(body.value);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Specify a valid notification to dismiss.' }, { status: 400 });
  }

  try {
    await connectToDatabase();
    const now = new Date();
    const isIncoming = parsed.data.event === 'incoming';
    const filter = isIncoming
      ? { _id: parsed.data.id, recipientId: auth.ownerId, status: 'pending', expiresAt: { $gt: now }, recipientNotificationDismissedAt: null }
      : { _id: parsed.data.id, requesterId: auth.ownerId, status: { $in: ['accepted', 'declined'] }, respondedAt: { $gte: new Date(now.getTime() - RETENTION_MS) }, requesterNotificationDismissedAt: null };
    const updateField = isIncoming ? 'recipientNotificationDismissedAt' : 'requesterNotificationDismissedAt';
    const dismissed = await FlowSession.findOneAndUpdate(
      filter,
      { $set: { [updateField]: now } },
      { new: true },
    ).select('_id').lean();
    if (!dismissed) return NextResponse.json({ error: 'Notification not found.' }, { status: 404 });
    return NextResponse.json({ dismissed: true });
  } catch (error) {
    console.error('Unable to dismiss notification.', error);
    return NextResponse.json({ error: 'Notification could not be dismissed.' }, { status: 503 });
  }
}
