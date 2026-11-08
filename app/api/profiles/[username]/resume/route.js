import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/libs/auth-options';
import { connectToDatabase } from '@/libs/db';
import { FlowSession } from '@/libs/models/FlowSession';
import { ProfileData } from '@/libs/models/ProfileData';
import { User } from '@/libs/models/User';
import { isAllowedCloudinaryResumeUrl, isAuthenticatedCloudinaryResumeUrl } from '@/libs/resume-delivery';
import { normalizePublicUsername } from '@/libs/public-username';
import { consumeRateLimits, getTrustedClientIp } from '@/libs/rate-limit';

export const runtime = 'nodejs';

const RESUME_ID_PATTERN = /^oneme\/[a-f0-9]{24}\/resume\/[a-f0-9]{32}\.pdf$/i;
const MAX_RESUME_BYTES = 10 * 1024 * 1024;
const RESUME_CONTENT_SECURITY_POLICY = "default-src 'none'; frame-ancestors 'self'";

async function readPdfBody(response) {
  const declaredLength = Number(response.headers.get('content-length'));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_RESUME_BYTES) {
    await response.body?.cancel();
    return null;
  }
  if (!response.body) return null;

  const reader = response.body.getReader();
  const chunks = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_RESUME_BYTES) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }

  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return bytes;
}

async function fetchCloudinaryAsset(url, cloudName) {
  let current = new URL(url);
  for (let redirects = 0; redirects <= 3; redirects += 1) {
    if (!isAllowedCloudinaryResumeUrl(current, cloudName)) {
      throw new Error('Cloudinary returned an invalid resume location.');
    }

    const response = await fetch(current, {
      cache: 'no-store',
      redirect: 'manual',
      signal: AbortSignal.timeout(15_000),
    });
    if (response.status < 300 || response.status >= 400) return response;
    const location = response.headers.get('location');
    await response.body?.cancel();
    if (!location || redirects === 3) {
      throw new Error('Cloudinary resume redirect limit exceeded.');
    }
    current = new URL(location, current);
  }
  throw new Error('Cloudinary resume redirect limit exceeded.');
}

function errorResponse(message, status) {
  return new NextResponse(message, {
    status,
    headers: {
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN',
      'Content-Security-Policy': RESUME_CONTENT_SECURITY_POLICY,
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}

function safeFilename(value) {
  const filename = typeof value === 'string' ? value : '';
  const safe = filename
    .replace(/[\\/\u0000-\u001f\u007f"]/g, '')
    .trim()
    .slice(0, 120);
  return safe.toLowerCase().endsWith('.pdf') ? safe : `${safe || 'resume'}.pdf`;
}

export async function GET(request, { params }) {
  const { username: rawUsername } = await params;
  const username = normalizePublicUsername(rawUsername);
  if (!/^[a-z0-9][a-z0-9-]{0,29}$/.test(username)) {
    return errorResponse('Resume not found.', 404);
  }

  const session = await getServerSession(authOptions);
  const viewerId = session?.user?.id;
  const clientIp = getTrustedClientIp(request);
  if (!clientIp) return errorResponse('Resume service is temporarily unavailable.', 503);
  const limits = await consumeRateLimits(request, [
    { name: 'resume-delivery-ip', identity: clientIp, windowSeconds: 60, limit: 30 },
    ...(mongoose.isValidObjectId(viewerId)
      ? [{ name: 'resume-delivery-user', identity: viewerId, windowSeconds: 60, limit: 30 }]
      : []),
  ]);
  if (!limits.ok) {
    return new NextResponse(
      limits.unavailable ? 'Resume service is temporarily unavailable.' : 'Too many resume requests.',
      {
        status: limits.unavailable ? 503 : 429,
        headers: {
          'Cache-Control': 'private, no-store',
          'X-Content-Type-Options': 'nosniff',
          'Content-Type': 'text/plain; charset=utf-8',
          ...(!limits.unavailable ? { 'Retry-After': String(limits.retryAfter) } : {}),
        },
      },
    );
  }

  try {
    await connectToDatabase();
    const account = await User.findOne({
      username,
      emailVerifiedAt: { $ne: null },
    }).select('_id username').lean();
    if (!account) return errorResponse('Resume not found.', 404);

    const record = await ProfileData.findOne({ ownerId: account._id })
      .select('data.profile data.resume')
      .lean();
    const profile = record?.data?.profile;
    const resume = record?.data?.resume;
    if (
      !profile
      || !resume?.publicId
      || !RESUME_ID_PATTERN.test(resume.publicId)
      || !resume.publicId.startsWith(`oneme/${account._id.toString()}/resume/`)
    ) {
      return errorResponse('Resume not found.', 404);
    }

    const isOwner = mongoose.isValidObjectId(viewerId)
      && account._id.toString() === viewerId;
    const isPublic = profile.isPublished === true
      && profile.privacy?.showResume === true
      && profile.sectionVisibility?.resume !== false;
    let sharedWithViewer = false;
    if (!isOwner && !isPublic && mongoose.isValidObjectId(viewerId)) {
      sharedWithViewer = Boolean(await FlowSession.exists({
        status: 'accepted',
        $or: [
          {
            requesterId: account._id,
            recipientId: viewerId,
            requesterFields: 'resume',
          },
          {
            recipientId: account._id,
            requesterId: viewerId,
            recipientFields: 'resume',
          },
        ],
      }));
    }
    if (!isOwner && !isPublic && !sharedWithViewer) {
      return errorResponse('Resume not found.', 404);
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    if (!cloudName || !apiKey || !apiSecret) {
      return errorResponse('Resume delivery is temporarily unavailable.', 503);
    }

    cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true });
    let storedAssetUrl;
    try {
      storedAssetUrl = new URL(resume.fileUrl);
    } catch {
      return errorResponse('Resume not found.', 404);
    }
    if (
      !isAuthenticatedCloudinaryResumeUrl(storedAssetUrl, cloudName, resume.publicId)
    ) {
      return errorResponse('Resume not found.', 404);
    }
    const deliveryUrl = cloudinary.utils.private_download_url(resume.publicId, 'pdf', {
      resource_type: 'raw',
      type: 'authenticated',
      expires_at: Math.floor(Date.now() / 1000) + 60,
    });
    const upstream = await fetchCloudinaryAsset(deliveryUrl, cloudName);
    if (!upstream.ok) {
      return errorResponse(upstream.status === 404 ? 'Resume not found.' : 'Resume delivery failed.', upstream.status === 404 ? 404 : 502);
    }

    const bytes = await readPdfBody(upstream);
    if (
      !bytes
      || bytes.byteLength < 5
      || new TextDecoder().decode(bytes.slice(0, 5)) !== '%PDF-'
    ) {
      return errorResponse('Resume file is invalid.', 502);
    }

    const url = new URL(request.url);
    const disposition = url.searchParams.get('download') === '1' ? 'attachment' : 'inline';
    const filename = safeFilename(resume.fileName);
    const encodedFilename = encodeURIComponent(filename).replace(/['()*]/g, (char) => (
      `%${char.charCodeAt(0).toString(16).toUpperCase()}`
    ));
    return new NextResponse(bytes, {
      headers: {
        'Cache-Control': 'private, no-store',
        'Content-Type': 'application/pdf',
        'Content-Disposition': `${disposition}; filename="resume.pdf"; filename*=UTF-8''${encodedFilename}`,
        'Content-Length': String(bytes.byteLength),
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'SAMEORIGIN',
        'Referrer-Policy': 'no-referrer',
        'Content-Security-Policy': RESUME_CONTENT_SECURITY_POLICY,
      },
    });
  } catch (error) {
    if (error?.name === 'TimeoutError' || error?.name === 'AbortError') {
      return errorResponse('Resume delivery timed out.', 504);
    }
    console.error('Unable to deliver resume.', {
      error: error?.name || 'UnknownError',
      code: typeof error?.code === 'string' || typeof error?.code === 'number' ? error.code : undefined,
    });
    return errorResponse('Resume delivery is temporarily unavailable.', 503);
  }
}
