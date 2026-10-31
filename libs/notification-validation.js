import { z } from 'zod';

export const notificationEventSchema = z.enum(['incoming', 'response']);

export const notificationActionSchema = z.object({
  id: z.string().regex(/^[a-f0-9]{24}$/i),
  event: notificationEventSchema,
}).strict();

export const markAllNotificationsSchema = z.object({
  all: z.literal(true),
}).strict();
