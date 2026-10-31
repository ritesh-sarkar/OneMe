import test from 'node:test';
import assert from 'node:assert/strict';
import { emailRequestSchema, loginSchema, normalizeUsername, registrationSchema, isDisposableEmail } from '../libs/auth-validation.js';
import { createAuthToken, hashAuthToken } from '../libs/auth-tokens.js';
import { consumeRateLimits, getTrustedClientIp } from '../libs/rate-limit.js';
import { readJsonBody } from '../libs/request-body.js';

test('registration normalizes email, rejects unexpected fields, and enforces a valid name', () => {
  const parsed = registrationSchema.safeParse({
    name: 'Ritesh Sarkar',
    email: '  USER@Example.COM ',
  });
  assert.equal(parsed.success, true);
  assert.equal(parsed.data.email, 'user@example.com');
  assert.equal(registrationSchema.safeParse({
    name: 'Ritesh',
    email: 'user@example.com',
    role: 'admin',
  }).success, false);
  assert.equal(registrationSchema.safeParse({
    name: 'Bad\nName',
    email: 'user@example.com',
  }).success, false);
});

test('login and password reset emails are validated and normalized', () => {
  const parsed = loginSchema.safeParse({ email: 'USER@Example.com', password: 'a password' });
  assert.equal(parsed.success, true);
  assert.equal(parsed.data.email, 'user@example.com');
  assert.equal(emailRequestSchema.safeParse({ email: 'invalid' }).success, false);
  assert.equal(loginSchema.safeParse({
    email: 'user@example.com',
    password: 'a password',
    ownerId: 'other-user',
  }).success, false);
});

test('disposable email list rejects temporary mail and permits common providers', () => {
  assert.equal(isDisposableEmail('person@mailinator.com'), true);
  assert.equal(isDisposableEmail('person@gmail.com'), false);
});

test('username normalization produces a bounded URL-safe slug', () => {
  assert.equal(normalizeUsername('  Rités h Sarkar! '), 'rites-h-sarkar');
  assert.equal(normalizeUsername('!!!'), 'member');
  assert.ok(normalizeUsername('a'.repeat(100)).length <= 24);
});

test('auth tokens are cryptographically random and only expose a digest for storage', () => {
  const first = createAuthToken();
  const second = createAuthToken();
  assert.equal(first.token.length, 43);
  assert.notEqual(first.token, second.token);
  assert.equal(first.tokenHash, hashAuthToken(first.token));
  assert.notEqual(first.tokenHash, first.token);
});

test('client IP extraction only trusts Vercel proxy metadata in production', () => {
  const previous = {
    nodeEnv: process.env.NODE_ENV,
    vercel: process.env.VERCEL,
  };
  process.env.NODE_ENV = 'production';
  process.env.VERCEL = '1';
  assert.equal(getTrustedClientIp(new Request('https://example.com', {
    headers: { 'x-vercel-forwarded-for': '203.0.113.8, 10.0.0.1' },
  })), '203.0.113.8');
  assert.equal(getTrustedClientIp(new Request('https://example.com', {
    headers: { 'x-forwarded-for': '198.51.100.10' },
  })), null);
  if (previous.nodeEnv === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = previous.nodeEnv;
  if (previous.vercel === undefined) delete process.env.VERCEL;
  else process.env.VERCEL = previous.vercel;
});

test('distributed rate limits send hashed identities and report blocked retries', async () => {
  const previous = {
    nodeEnv: process.env.NODE_ENV,
    vercel: process.env.VERCEL,
    redisUrl: process.env.UPSTASH_REDIS_REST_URL,
    redisToken: process.env.UPSTASH_REDIS_REST_TOKEN,
    fetch: globalThis.fetch,
  };
  process.env.NODE_ENV = 'test';
  delete process.env.VERCEL;
  process.env.UPSTASH_REDIS_REST_URL = 'https://redis.example.test';
  process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token';

  const results = [[0, 0], [1, 25]];
  globalThis.fetch = async (_url, options) => {
    const command = JSON.parse(options.body);
    assert.equal(command[0], 'EVAL');
    assert.equal(command[2], 1);
    assert.match(command[3], /^oneme:rate:login-email:[a-f0-9]{64}$/);
    assert.equal(command[3].includes('user@example.com'), false);
    return new Response(JSON.stringify({ result: results.shift() }), { status: 200 });
  };

  try {
    const request = new Request('https://example.com');
    const policy = [{ name: 'login-email', identity: 'user@example.com', windowSeconds: 900, limit: 8 }];
    assert.deepEqual(await consumeRateLimits(request, policy), { ok: true, retryAfter: 1 });
    assert.deepEqual(await consumeRateLimits(request, policy), { ok: false, retryAfter: 25 });
  } finally {
    globalThis.fetch = previous.fetch;
    if (previous.nodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previous.nodeEnv;
    if (previous.vercel === undefined) delete process.env.VERCEL;
    else process.env.VERCEL = previous.vercel;
    if (previous.redisUrl === undefined) delete process.env.UPSTASH_REDIS_REST_URL;
    else process.env.UPSTASH_REDIS_REST_URL = previous.redisUrl;
    if (previous.redisToken === undefined) delete process.env.UPSTASH_REDIS_REST_TOKEN;
    else process.env.UPSTASH_REDIS_REST_TOKEN = previous.redisToken;
  }
});

test('distributed rate limits fail closed when the provider is unavailable', async () => {
  const previous = {
    nodeEnv: process.env.NODE_ENV,
    vercel: process.env.VERCEL,
    redisUrl: process.env.UPSTASH_REDIS_REST_URL,
    redisToken: process.env.UPSTASH_REDIS_REST_TOKEN,
    fetch: globalThis.fetch,
  };
  process.env.NODE_ENV = 'test';
  delete process.env.VERCEL;
  process.env.UPSTASH_REDIS_REST_URL = 'https://redis.example.test';
  process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token';
  globalThis.fetch = async () => {
    throw new Error('test provider failure');
  };

  try {
    const result = await consumeRateLimits(
      new Request('https://example.com'),
      [{ name: 'register-ip', identity: '127.0.0.1', windowSeconds: 60, limit: 2 }],
    );
    assert.deepEqual(result, { ok: false, unavailable: true });
  } finally {
    globalThis.fetch = previous.fetch;
    if (previous.nodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previous.nodeEnv;
    if (previous.vercel === undefined) delete process.env.VERCEL;
    else process.env.VERCEL = previous.vercel;
    if (previous.redisUrl === undefined) delete process.env.UPSTASH_REDIS_REST_URL;
    else process.env.UPSTASH_REDIS_REST_URL = previous.redisUrl;
    if (previous.redisToken === undefined) delete process.env.UPSTASH_REDIS_REST_TOKEN;
    else process.env.UPSTASH_REDIS_REST_TOKEN = previous.redisToken;
  }
});

test('request JSON reader enforces size limits and rejects malformed bodies', async () => {
  const valid = await readJsonBody(new Request('https://example.com', {
    method: 'POST',
    body: JSON.stringify({ email: 'user@example.com' }),
  }));
  assert.equal(valid.ok, true);
  assert.equal(valid.value.email, 'user@example.com');

  const oversized = await readJsonBody(new Request('https://example.com', {
    method: 'POST',
    body: JSON.stringify({ value: 'x'.repeat(50) }),
  }), 16);
  assert.deepEqual(oversized, { ok: false, status: 413 });

  const malformed = await readJsonBody(new Request('https://example.com', {
    method: 'POST',
    body: '{',
  }));
  assert.deepEqual(malformed, { ok: false, status: 400 });
});
