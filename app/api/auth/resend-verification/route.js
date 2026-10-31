import { NextResponse } from 'next/server';
import { emailRequestSchema } from '@/libs/auth-validation';
import { sendAccountToken } from '@/libs/auth-email';
import { connectToDatabase } from '@/libs/db';
import { User } from '@/libs/models/User';
import { consumeRateLimits, getTrustedClientIp } from '@/libs/rate-limit';
import { readJsonBody } from '@/libs/request-body';

export const runtime = 'nodejs';

export async function POST(request) {
  const body = await readJsonBody(request);
  if (!body.ok) {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: body.status });
  }

  const parsed = emailRequestSchema.safeParse(body.value);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
  }

  const clientIp = getTrustedClientIp(request);
  if (!clientIp) {
    return NextResponse.json({ error: 'Email service is temporarily unavailable.' }, { status: 503 });
  }
  const limit = await consumeRateLimits(request, [
    { name: 'resend-verification-ip', identity: clientIp, windowSeconds: 3600, limit: 5 },
    { name: 'resend-verification-email', identity: parsed.data.email, windowSeconds: 3600, limit: 3 },
  ]);
  if (!limit.ok) {
    if (limit.unavailable) {
      return NextResponse.json({ error: 'Email service is temporarily unavailable.' }, { status: 503 });
    }
    return NextResponse.json(
      { error: 'Too many email requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } },
    );
  }

  try {
    await connectToDatabase();
    const user = await User.findOne({
      email: parsed.data.email,
      emailVerifiedAt: null,
    }).lean();
    if (user) {
      await sendAccountToken({ user, purpose: 'verify-email' });
    }
    return NextResponse.json({
      message: 'If the account needs verification, an email will be sent.',
    }, { status: 202 });
  } catch {
    return NextResponse.json({ error: 'Email service is temporarily unavailable.' }, { status: 503 });
  }
}
