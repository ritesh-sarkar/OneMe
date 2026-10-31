import { accountIdentitySchema, isDisposableEmail } from './auth-validation.js';

export function getVerifiedGoogleIdentity(profile) {
  if (profile?.email_verified !== true || typeof profile.email !== 'string') return null;

  const email = profile.email.trim().toLowerCase();
  const proposedName = typeof profile.name === 'string' ? profile.name : '';
  let parsed = accountIdentitySchema.safeParse({
    name: proposedName,
    email,
  });
  if (!parsed.success) {
    parsed = accountIdentitySchema.safeParse({
      name: 'Google Member',
      email,
    });
  }
  if (!parsed.success) return null;

  try {
    if (isDisposableEmail(parsed.data.email)) return null;
  } catch {
    return null;
  }
  return parsed.data;
}
