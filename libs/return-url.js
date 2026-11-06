const RETURN_URL_ORIGIN = 'https://oneme.invalid';

export function getSafeReturnPath(value, fallback = '/dashboard') {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) {
    return fallback;
  }
  try {
    const url = new URL(value, RETURN_URL_ORIGIN);
    if (url.origin !== RETURN_URL_ORIGIN) return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}
