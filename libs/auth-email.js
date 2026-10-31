import { AuthToken } from '@/libs/models/AuthToken';
import { createAuthToken } from '@/libs/auth-tokens';
import { sendTransactionalEmail } from '@/libs/brevo';

const TOKEN_LIFETIME_MS = 60 * 60 * 1000;

export async function sendAccountToken({ user, purpose }) {
  const { token, tokenHash } = createAuthToken();
  await AuthToken.deleteMany({ userId: user._id, purpose });
  await AuthToken.create({
    userId: user._id,
    purpose,
    tokenHash,
    expiresAt: new Date(Date.now() + TOKEN_LIFETIME_MS),
  });

  try {
    const configuredUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!configuredUrl) throw new Error('Application URL is not configured.');
    const baseUrl = new URL(configuredUrl);
    if (
      baseUrl.username ||
      baseUrl.password ||
      (process.env.NODE_ENV === 'production' && baseUrl.protocol !== 'https:')
    ) {
      throw new Error('Application URL is invalid.');
    }
    const actionUrl = new URL(
      purpose === 'verify-email' ? '/verify-email' : '/forgot-password',
      baseUrl.origin,
    );
    actionUrl.searchParams.set('token', token);

    await sendTransactionalEmail({
      to: user.email,
      name: user.name,
      subject: purpose === 'verify-email' ? 'Verify your OneMe email' : 'Reset your OneMe password',
      actionUrl: actionUrl.toString(),
      actionLabel: purpose === 'verify-email' ? 'Verify email address' : 'Reset password',
      purpose: purpose === 'verify-email' ? 'verify your email address' : 'reset your password',
    });
  } catch (error) {
    await AuthToken.deleteOne({ tokenHash });
    throw error;
  }
}
