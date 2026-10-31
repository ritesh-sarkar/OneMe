import { v2 as cloudinary } from 'cloudinary';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { authOptions } from '@/libs/auth-options';
import { consumeRateLimits, getTrustedClientIp } from '@/libs/rate-limit';
import { readJsonBody } from '@/libs/request-body';

export const runtime = 'nodejs';

const requestSchema = z.object({
  publicId: z.string().regex(/^oneme\/[a-f0-9]{24}\/(?:profile\/[a-f0-9]{32}|resume\/[a-f0-9]{32}\.pdf)$/),
}).strict();

export async function POST(request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

  const body = await readJsonBody(request);
  if (!body.ok) return NextResponse.json({ error: 'Invalid image deletion request.' }, { status: body.status });
  const parsed = requestSchema.safeParse(body.value);
  if (!parsed.success || !parsed.data.publicId.startsWith(`oneme/${userId}/profile/`)) {
    return NextResponse.json({ error: 'Image not found.' }, { status: 404 });
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json({ error: 'Image service is not configured.' }, { status: 503 });
  }

  const clientIp = getTrustedClientIp(request);
  if (!clientIp) {
    return NextResponse.json({ error: 'Image service is temporarily unavailable.' }, { status: 503 });
  }
  const limit = await consumeRateLimits(request, [
    { name: 'image-delete-ip', identity: clientIp, windowSeconds: 3600, limit: 20 },
    { name: 'image-delete-user', identity: userId, windowSeconds: 3600, limit: 10 },
  ]);
  if (!limit.ok) {
    if (limit.unavailable) {
      return NextResponse.json({ error: 'Image service is temporarily unavailable.' }, { status: 503 });
    }
    return NextResponse.json(
      { error: 'Too many image changes. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } },
    );
  }

  try {
    cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true });
    const result = await cloudinary.uploader.destroy(parsed.data.publicId, {
      invalidate: true,
      resource_type: parsed.data.publicId.includes('/resume/') ? 'raw' : 'image',
    });
    if (result.result !== 'ok' && result.result !== 'not found') {
      return NextResponse.json({ error: 'Image could not be removed.' }, { status: 503 });
    }
    return NextResponse.json({ deleted: result.result === 'ok' });
  } catch {
    return NextResponse.json({ error: 'Image could not be removed.' }, { status: 503 });
  }
}
