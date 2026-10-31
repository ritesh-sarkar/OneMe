import { createHmac } from 'node:crypto';
import { z } from 'zod';

export const profileAnalyticsEventSchema = z.object({
  eventType: z.enum(['link_click', 'resume_download', 'contact_click']),
  target: z.enum(['Profile link', 'Email', 'Phone', 'Resume']),
}).strict();

export function createAnalyticsVisitorHash(ownerId, clientIp, secret) {
  return createHmac('sha256', secret)
    .update(`${ownerId.toString()}:${clientIp}`)
    .digest('hex');
}
