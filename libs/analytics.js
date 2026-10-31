import { AnalyticsEvent } from '@/libs/models/AnalyticsEvent';
import { createAnalyticsVisitorHash } from '@/libs/analytics-validation';

export async function recordAnalyticsEvent({ ownerId, clientIp, eventType, target = '' }) {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error('Analytics signing secret is not configured.');

  const visitorHash = createAnalyticsVisitorHash(ownerId, clientIp, secret);
  const dedupeBucket = Math.floor(Date.now() / (15 * 60 * 1000));

  try {
    await AnalyticsEvent.create({ ownerId, eventType, target, visitorHash, dedupeBucket });
    return true;
  } catch (error) {
    if (error?.code === 11000) return false;
    throw error;
  }
}
