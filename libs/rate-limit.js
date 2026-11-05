import { createHash } from 'node:crypto';

const rateLimitScript = `
local blocked = 0
local retryAfter = 0
for i, key in ipairs(KEYS) do
  local count = tonumber(redis.call('GET', key)) or 0
  local limit = tonumber(ARGV[i * 2])
  if count >= limit then
    local ttl = redis.call('TTL', key)
    if ttl < 0 then
      ttl = tonumber(ARGV[(i * 2) - 1])
      redis.call('EXPIRE', key, ttl)
    end
    blocked = 1
    if ttl > retryAfter then retryAfter = ttl end
  end
end
if blocked == 1 then
  return { blocked, retryAfter }
end
for i, key in ipairs(KEYS) do
  local count = redis.call('INCR', key)
  if count == 1 then
    redis.call('EXPIRE', key, tonumber(ARGV[(i * 2) - 1]))
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

  if (process.env.NODE_ENV !== 'production') {
    return getHeader('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
  }

  if (process.env.VERCEL === '1') {
    const forwardedFor = getHeader('x-vercel-forwarded-for');
    return forwardedFor?.split(',')[0]?.trim() || null;
  }

  return null;
}

export async function consumeRateLimits(request, policies) {
  const hostname = request?.nextUrl?.hostname || (() => {
    try {
      return new URL(request.url).hostname;
    } catch {
      return '';
    }
  })();
  if (
    process.env.NODE_ENV === 'development' &&
    process.env.VERCEL !== '1' &&
    ['localhost', '127.0.0.1', '::1'].includes(hostname)
  ) {
    return { ok: true, retryAfter: 1 };
  }

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  const ip = getTrustedClientIp(request);

  if (!url || !token) {
    return { ok: false, unavailable: true, reason: 'missing_configuration' };
  }
  if (!ip) {
    return { ok: false, unavailable: true, reason: 'missing_client_ip' };
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
  } catch (error) {
    console.error('Rate-limit provider request failed.', {
      error: error?.name || 'UnknownError',
      code: typeof error?.code === 'string' ? error.code : undefined,
    });
    return { ok: false, unavailable: true, reason: 'request_failed' };
  }

  if (!response.ok) {
    console.error('Rate-limit provider rejected the request.', { status: response.status });
    return { ok: false, unavailable: true, reason: 'provider_rejected' };
  }

  let payload;
  try {
    payload = await response.json();
  } catch (error) {
    console.error('Rate-limit provider returned invalid JSON.', {
      error: error?.name || 'UnknownError',
    });
    return { ok: false, unavailable: true, reason: 'invalid_json' };
  }

  const result = payload?.result;
  if (!Array.isArray(result) || result.length !== 2) {
    console.error('Rate-limit provider returned an invalid result.');
    return { ok: false, unavailable: true, reason: 'invalid_result' };
  }

  return {
    ok: Number(result[0]) === 0,
    retryAfter: Math.max(1, Number(result[1]) || 1),
  };
}
