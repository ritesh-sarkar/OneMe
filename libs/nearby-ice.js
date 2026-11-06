import { createHmac, randomBytes } from 'node:crypto';

export function parseNearbyTurnUrls(value) {
  if (!value) return [];
  const urls = value.split(',').map((url) => url.trim()).filter(Boolean);
  if (urls.length > 8 || urls.some((value) => {
    const match = /^(turns?):(.+)$/i.exec(value);
    if (!match) return true;
    const authority = match[2].split(/[/?#]/, 1)[0].replace(/^\/\//, '');
    if (!authority || /[\s@]/.test(authority)) return true;
    try {
      return !new URL(`https://${authority}`).hostname;
    } catch {
      return true;
    }
  })) {
    throw new Error('ONEME_TURN_URLS must contain valid turn: or turns: URLs.');
  }
  return urls;
}

export function createNearbyTurnServer(urls, sharedSecret, now = Date.now()) {
  const expiresAt = Math.floor(now / 1000) + 10 * 60;
  const username = `${expiresAt}:${randomBytes(12).toString('hex')}`;
  const credential = createHmac('sha1', sharedSecret).update(username).digest('base64');
  return { urls, username, credential };
}
