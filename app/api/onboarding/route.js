import mongoose from 'mongoose';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/libs/auth-options';
import { connectToDatabase } from '@/libs/db';
import { createEmptyProfileData } from '@/libs/profile-validation';
import { onboardingSchema } from '@/libs/auth-validation';
import { ProfileData } from '@/libs/models/ProfileData';
import { User } from '@/libs/models/User';
import { consumeRateLimits, getTrustedClientIp } from '@/libs/rate-limit';
import { readJsonBody } from '@/libs/request-body';

export const runtime = 'nodejs';

export async function POST(request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId || !mongoose.isValidObjectId(userId)) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  const clientIp = getTrustedClientIp(request);
  if (!clientIp) {
    return NextResponse.json({ error: 'Profile setup is temporarily unavailable.' }, { status: 503 });
  }
  const limit = await consumeRateLimits(request, [
    { name: 'onboarding-ip', identity: clientIp, windowSeconds: 60, limit: 20 },
    { name: 'onboarding-user', identity: userId, windowSeconds: 60, limit: 10 },
  ]);
  if (!limit.ok) {
    return NextResponse.json(
      { error: limit.unavailable ? 'Profile setup is temporarily unavailable.' : 'Too many setup attempts.' },
      limit.unavailable
        ? { status: 503 }
        : { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } },
    );
  }

  const body = await readJsonBody(request, 8 * 1024);
  if (!body.ok) return NextResponse.json({ error: 'Invalid profile setup request.' }, { status: body.status });
  const parsed = onboardingSchema.safeParse(body.value);
  if (!parsed.success) {
    return NextResponse.json({
      error: parsed.error.issues[0]?.message || 'Profile setup information is invalid.',
    }, { status: 400 });
  }

  try {
    await connectToDatabase();
    const now = new Date();
    if (parsed.data.action === 'skip') {
      await User.updateOne(
        { _id: userId, onboardingCompletedAt: null },
        { $set: { onboardingSkippedAt: now } },
      );
      return NextResponse.json({ skipped: true });
    }

    if (parsed.data.avatar) {
      let avatar;
      try {
        avatar = new URL(parsed.data.avatar);
      } catch {
        return NextResponse.json({ error: 'Profile image URL is invalid.' }, { status: 400 });
      }
      if (
        avatar.protocol !== 'https:' ||
        avatar.hostname !== 'res.cloudinary.com' ||
        !avatar.pathname.includes(`/oneme/${userId}/profile/`)
      ) {
        return NextResponse.json({ error: 'Upload your profile image using the OneMe image uploader.' }, { status: 400 });
      }
    }

    const accountId = new mongoose.Types.ObjectId(userId);
    const existing = await ProfileData.findOne({ ownerId: accountId }).select('data').lean();
    const data = existing?.data || createEmptyProfileData();
    const updatedData = {
      ...data,
      profile: {
        ...data.profile,
        title: parsed.data.title,
        bio: parsed.data.bio,
        location: parsed.data.location,
        avatar: parsed.data.avatar,
      },
    };

    await ProfileData.findOneAndUpdate(
      { ownerId: accountId },
      { $set: { data: updatedData } },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
    );
    await User.updateOne(
      { _id: accountId },
      { $set: { onboardingCompletedAt: now }, $unset: { onboardingSkippedAt: 1 } },
    );

    return NextResponse.json({ completed: true });
  } catch (error) {
    console.error('Unable to save OneMe profile setup.', error);
    return NextResponse.json({ error: 'Profile setup could not be saved.' }, { status: 503 });
  }
}
