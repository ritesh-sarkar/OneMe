export function getRegistrationErrorMessage({ status, retryAfter, message }) {
  if (status !== 429) return message || 'Unable to create an account.';

  const retryAfterSeconds = Number(retryAfter);
  if (Number.isFinite(retryAfterSeconds) && retryAfterSeconds >= 60) {
    const minutes = Math.ceil(retryAfterSeconds / 60);
    return `Too many registration attempts. Please try again in ${minutes} minute${minutes === 1 ? '' : 's'}.`;
  }
  if (Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0) {
    return 'Too many registration attempts. Please try again in less than a minute.';
  }
  return 'Too many registration attempts. Please wait before trying again.';
}
