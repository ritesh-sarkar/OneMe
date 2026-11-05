import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { registrationSchema, isDisposableEmail } from '@/libs/auth-validation';
import { sendAccountToken } from '@/libs/auth-email';
import { connectToDatabase } from '@/libs/db';
import { User } from '@/libs/models/User';
import { consumeRateLimits, getTrustedClientIp } from '@/libs/rate-limit';
import { getRegistrationRateLimitPolicies } from '@/libs/auth-rate-limits';
import { readJsonBody } from '@/libs/request-body';

export const runtime = 'nodejs';

const acceptedResponse = () => NextResponse.json({
  message: 'If the details can be used to create an account, a verification email will be sent.',
}, { status: 202 });

export async function POST(request) {
  const body = await readJsonBody(request);
  if (!body.ok) {
    return NextResponse.json(
      { error: body.status === 413 ? 'Request body is too large.' : 'Invalid request body.' },
      { status: body.status },
    );
  }

  const parsed = registrationSchema.safeParse(body.value);
  if (!parsed.success) {
    return NextResponse.json({
      error: parsed.error.issues[0]?.message || 'Check the information and try again.',
    }, { status: 400 });
  }

  let disposable;
  try {
    disposable = isDisposableEmail(parsed.data.email);
  } catch (error) {
    console.error('Account registration email validation failed.', {
      error: error?.name || 'UnknownError',
    });
    return NextResponse.json({ error: 'Email verification is temporarily unavailable.' }, { status: 503 });
  }
  if (disposable) {
    return NextResponse.json({ error: 'Please use a non-temporary email address.' }, { status: 400 });
  }

  const clientIp = getTrustedClientIp(request);
  if (!clientIp) {
    console.error('Account registration is unavailable because the client IP could not be determined.');
    return NextResponse.json({ error: 'Registration is temporarily unavailable.' }, { status: 503 });
  }

  const limit = await consumeRateLimits(
    request,
    getRegistrationRateLimitPolicies(clientIp, parsed.data.email),
  );
  if (!limit.ok) {
    if (limit.unavailable) {
      console.error('Account registration rate-limit check is unavailable.', {
        reason: limit.reason || 'unknown',
      });
      return NextResponse.json({ error: 'Registration is temporarily unavailable.' }, { status: 503 });
    }
    return NextResponse.json(
      { error: 'Too many registration attempts. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } },
    );
  }

  let stage = 'database';
  try {
    await connectToDatabase();

    const existing = await User.findOne({ email: parsed.data.email });
    if (existing) {
      if (!existing.emailVerifiedAt) {
        stage = 'verification_email';
        await sendAccountToken({ user: existing, purpose: 'verify-email' });
      }
      return acceptedResponse();
    }

    const passwordHash = await hash(parsed.data.password, 12);
    stage = 'account_creation';
    const user = await User.create({
      name: parsed.data.name,
      username: parsed.data.username,
      email: parsed.data.email,
      passwordHash,
    });

    try {
      stage = 'verification_email';
      await sendAccountToken({ user, purpose: 'verify-email' });
    } catch (error) {
      await User.deleteOne({ _id: user._id, emailVerifiedAt: null });
      throw error;
    }

    return acceptedResponse();
  } catch (error) {
    if (error?.code === 11000 && error?.keyPattern?.username) {
      return NextResponse.json({ error: 'That username is already taken. Choose another one.' }, { status: 409 });
    }
    console.error('Account registration failed.', {
      stage,
      error: error?.name || 'UnknownError',
      code: typeof error?.code === 'string' || typeof error?.code === 'number'
        ? error.code
        : undefined,
    });
    return NextResponse.json({ error: 'Account registration is temporarily unavailable.' }, { status: 503 });
  }
}
