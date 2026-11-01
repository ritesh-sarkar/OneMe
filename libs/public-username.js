export function normalizePublicUsername(value) {
  if (typeof value !== 'string') return '';

  let username;
  try {
    username = decodeURIComponent(value);
  } catch {
    return '';
  }

  return username.replace(/^@/, '').toLowerCase();
}
