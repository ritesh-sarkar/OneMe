import { randomBytes } from 'node:crypto';
import { v2 as cloudinary } from 'cloudinary';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { authOptions } from '@/libs/auth-options';
import { getTrustedClientIp, consumeRateLimits } from '@/libs/rate-limit';
import { readJsonBody } from '@/libs/request-body';

export const runtime = 'nodejs';

const requestSchema = z.object({
  kind: z.enum(['avatar', 'banner', 'resume']),
}).strict();

export async function POST(request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

  const body = await readJsonBody(request);
  if (!body.ok) return NextResponse.json({ error: 'Invalid upload request.' }, { status: body.status });
  const parsed = requestSchema.safeParse(body.value);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid upload type.' }, { status: 400 });

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const uploadPreset = parsed.data.kind === 'resume'
    ? process.env.CLOUDINARY_RESUME_UPLOAD_PRESET
    : process.env.CLOUDINARY_IMAGE_UPLOAD_PRESET;
  if (!cloudName || !apiKey || !apiSecret || !uploadPreset) {
    return NextResponse.json({ error: 'Image uploads are not configured.' }, { status: 503 });
  }

  const clientIp = getTrustedClientIp(request);
  if (!clientIp) {
    return NextResponse.json({ error: 'Image uploads are temporarily unavailable.' }, { status: 503 });
  }
  const limit = await consumeRateLimits(request, [
    { name: 'image-upload-ip', identity: clientIp, windowSeconds: 3600, limit: 20 },
    { name: 'image-upload-user', identity: userId, windowSeconds: 3600, limit: 10 },
  ]);
  if (!limit.ok) {
    if (limit.unavailable) {
      return NextResponse.json({ error: 'Image uploads are temporarily unavailable.' }, { status: 503 });
    }
    return NextResponse.json(
      { error: 'Too many image uploads. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } },
    );
  }

  const isResume = parsed.data.kind === 'resume';
  const params = {
    allowed_formats: isResume ? 'pdf' : 'jpg,png,webp,avif',
    folder: `oneme/${userId}/${isResume ? 'resume' : 'profile'}`,
    overwrite: 'false',
    public_id: `${randomBytes(16).toString('hex')}${isResume ? '.pdf' : ''}`,
    timestamp: Math.floor(Date.now() / 1000),
    upload_preset: uploadPreset,
  };
  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true });

  return NextResponse.json({
    apiKey,
    cloudName,
    resourceType: isResume ? 'raw' : 'image',
    params,
    signature: cloudinary.utils.api_sign_request(params, apiSecret),
  }, { headers: { 'Cache-Control': 'no-store' } });
}
