import { createHash } from 'node:crypto';

const rateLimitScript = `
local blocked = 0
local retryAfter = 0
for i, key in ipairs(KEYS) do
  local count = redis.call('INCR', key)
  if count == 1 then
    redis.call('EXPIRE', key, tonumber(ARGV[(i * 2) - 1]))
  end
  local ttl = redis.call('TTL', key)
  if count > tonumber(ARGV[i * 2]) then
    blocked = 1
    if ttl > retryAfter then retryAfter = ttl end
  end
end
return { blocked, retryAfter }
`;

function hash(value) {
  return createHash('sha256').update(value).digest('hex');
}

export function getTrustedClientIp(request) {
  const headers = request?.headers;
  const getHeader = (name) =>
    typeof headers?.get === 'function' ? headers.get(name) : headers?.[name];

  if (process.env.VERCEL === '1') {
    const forwardedFor = getHeader('x-vercel-forwarded-for');
    return forwardedFor?.split(',')[0]?.trim() || null;
  }

  if (process.env.NODE_ENV !== 'production') {
    return getHeader('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
  }

  return null;
}

export async function consumeRateLimits(request, policies) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  const ip = getTrustedClientIp(request);

  if (!url || !token || !ip) {
    return { ok: false, unavailable: true };
  }

  const keys = policies.map(({ name, identity }) =>
    `oneme:rate:${name}:${hash(identity)}`,
  );
  const args = policies.flatMap(({ windowSeconds, limit }) => [windowSeconds, limit]);

  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([
        'EVAL',
        rateLimitScript,
        keys.length,
        ...keys,
        ...args,
      ]),
      cache: 'no-store',
      signal: AbortSignal.timeout(3000),
    });
  } catch {
    return { ok: false, unavailable: true };
  }

  if (!response.ok) return { ok: false, unavailable: true };

  let payload;
  try {
    payload = await response.json();
  } catch {
    return { ok: false, unavailable: true };
  }

  const result = payload?.result;
  if (!Array.isArray(result) || result.length !== 2) {
    return { ok: false, unavailable: true };
  }

  return {
    ok: Number(result[0]) === 0,
    retryAfter: Math.max(1, Number(result[1]) || 1),
  };
}
