import { createHash, randomBytes } from 'node:crypto';

export function createAuthToken() {
  const token = randomBytes(32).toString('base64url');
  return {
    token,
    tokenHash: createHash('sha256').update(token).digest('hex'),
  };
}

export function hashAuthToken(token) {
  return createHash('sha256').update(token).digest('hex');
}
