import { z } from 'zod';

const objectId = z.string().regex(/^[a-f0-9]{24}$/i);

export const flowNearbyInviteSchema = z.object({
  sessionId: objectId,
  targetSessionId: objectId,
}).strict();

export const flowNearbyActionSchema = z.object({
  action: z.enum(['accept', 'reject', 'close', 'connected']),
  sessionId: objectId.optional(),
}).strict().refine((value) => value.action !== 'connected' || Boolean(value.sessionId), {
  message: 'A Nearby session is required to confirm a connection.',
});

const signalSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('offer'),
    payload: z.object({
      type: z.literal('offer'),
      sdp: z.string().min(1).max(16_000),
    }).strict(),
  }).strict(),
  z.object({
    kind: z.literal('answer'),
    payload: z.object({
      type: z.literal('answer'),
      sdp: z.string().min(1).max(16_000),
    }).strict(),
  }).strict(),
  z.object({
    kind: z.literal('candidate'),
    payload: z.object({
      candidate: z.string().max(4_096),
      sdpMid: z.string().max(256).nullable(),
      sdpMLineIndex: z.number().int().min(0).max(65_535).nullable(),
      usernameFragment: z.string().max(256).nullable().optional(),
    }).strict(),
  }).strict(),
]);

export const flowNearbySignalBodySchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('send'),
    sessionId: objectId,
    signalId: z.string().uuid(),
    signal: signalSchema,
  }).strict(),
  z.object({
    action: z.literal('ack'),
    sessionId: objectId,
    signalIds: z.array(objectId).max(100),
  }).strict(),
]);
