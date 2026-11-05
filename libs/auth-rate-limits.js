export const AUTH_RATE_LIMIT = Object.freeze({
  attempts: 5,
  windowSeconds: 5 * 60,
});

export function getRegistrationRateLimitPolicies(clientIp, email) {
  return [
    {
      name: 'register-ip-v2',
      identity: clientIp,
      windowSeconds: AUTH_RATE_LIMIT.windowSeconds,
      limit: AUTH_RATE_LIMIT.attempts,
    },
    {
      name: 'register-email-v2',
      identity: email,
      windowSeconds: AUTH_RATE_LIMIT.windowSeconds,
      limit: AUTH_RATE_LIMIT.attempts,
    },
  ];
}

export function getLoginRateLimitPolicies(clientIp, email) {
  return [
    {
      name: 'login-ip-v2',
      identity: clientIp,
      windowSeconds: AUTH_RATE_LIMIT.windowSeconds,
      limit: AUTH_RATE_LIMIT.attempts,
    },
    {
      name: 'login-email-v2',
      identity: email,
      windowSeconds: AUTH_RATE_LIMIT.windowSeconds,
      limit: AUTH_RATE_LIMIT.attempts,
    },
  ];
}

export function getLoginErrorMessage(error) {
  if (error === 'RateLimited') {
    return 'Too many sign-in attempts. Please wait up to 5 minutes before trying again.';
  }
  return 'Unable to sign in with those details. Check your credentials and email verification.';
}
