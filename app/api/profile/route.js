import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/libs/auth-options';
import { connectToDatabase } from '@/libs/db';
import { ProfileData } from '@/libs/models/ProfileData';
import { createEmptyProfileData, profileDataSchema } from '@/libs/profile-validation';
import { consumeRateLimits, getTrustedClientIp } from '@/libs/rate-limit';
import { readJsonBody } from '@/libs/request-body';

export const runtime = 'nodejs';

async function getAccount() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  return session.user;
}

export async function GET() {
  const user = await getAccount();
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

  try {
    await connectToDatabase();
    const record = await ProfileData.findOne({ ownerId: user.id }).select('data').lean();
    return NextResponse.json({
      data: record?.data || createEmptyProfileData(),
      isNew: !record,
    }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch {
    return NextResponse.json({ error: 'Profile service is temporarily unavailable.' }, { status: 503 });
  }
}

export async function PUT(request) {
  const user = await getAccount();
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

  const clientIp = getTrustedClientIp(request);
  if (!clientIp) {
    return NextResponse.json({ error: 'Profile service is temporarily unavailable.' }, { status: 503 });
  }
  const limit = await consumeRateLimits(request, [
    { name: 'profile-save-ip', identity: clientIp, windowSeconds: 60, limit: 300 },
    { name: 'profile-save-user', identity: user.id, windowSeconds: 60, limit: 120 },
  ]);
  if (!limit.ok) {
    if (limit.unavailable) {
      return NextResponse.json({ error: 'Profile service is temporarily unavailable.' }, { status: 503 });
    }
    return NextResponse.json(
      { error: 'Too many profile updates. Please wait before saving again.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } },
    );
  }

  const body = await readJsonBody(request, 64 * 1024);
  if (!body.ok) {
    return NextResponse.json(
      { error: body.status === 413 ? 'Profile data is too large.' : 'Invalid request body.' },
      { status: body.status },
    );
  }

  const parsed = profileDataSchema.safeParse(body.value);
  if (!parsed.success) {
    return NextResponse.json({
      error: parsed.error.issues[0]?.message || 'Profile data is invalid.',
    }, { status: 400 });
  }
  const { fileUrl, publicId } = parsed.data.resume;
  if (
    (fileUrl || publicId) &&
    (
      !fileUrl ||
      !publicId?.startsWith(`oneme/${user.id}/resume/`) ||
      !fileUrl.startsWith('https://res.cloudinary.com/') ||
      !new URL(fileUrl).pathname.includes(`/raw/upload/`) ||
      !new URL(fileUrl).pathname.endsWith(`/${publicId}`)
    )
  ) {
    return NextResponse.json({ error: 'Resume file is invalid.' }, { status: 400 });
  }

  try {
    await connectToDatabase();
    await ProfileData.findOneAndUpdate(
      { ownerId: user.id },
      { $set: { data: parsed.data } },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
    );
    return NextResponse.json({ saved: true });
  } catch {
    return NextResponse.json({ error: 'Profile could not be saved right now.' }, { status: 503 });
  }
}
