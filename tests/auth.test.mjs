import test from 'node:test';
import assert from 'node:assert/strict';
import { emailRequestSchema, loginSchema, normalizeUsername, registrationSchema, isDisposableEmail } from '../libs/auth-validation.js';
import { createAuthToken, hashAuthToken } from '../libs/auth-tokens.js';
import { consumeRateLimits, getTrustedClientIp } from '../libs/rate-limit.js';
import { readJsonBody } from '../libs/request-body.js';
import { createEmptyProfileData, profileDataSchema } from '../libs/profile-validation.js';
import { createPublicProfilePayload } from '../libs/public-profile.js';
import { escapeSearchTerm } from '../libs/discovery.js';
import { createAnalyticsVisitorHash, profileAnalyticsEventSchema } from '../libs/analytics-validation.js';
import {
  availableFlowFields,
  createFlowContactData,
  createFlowRequestSchema,
  respondToFlowSchema,
} from '../libs/flow-validation.js';
import { generateVCard } from '../libs/vcard.js';
import { aiCopyRequestSchema, parseGeneratedAiCopy } from '../libs/ai-validation.js';
import { markAllNotificationsSchema, notificationActionSchema } from '../libs/notification-validation.js';
import { getVerifiedGoogleIdentity } from '../libs/google-auth.js';

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

test('profile payload validation strips unsafe structures and accepts an empty account profile', () => {
  const emptyProfile = createEmptyProfileData();
  assert.equal(profileDataSchema.safeParse(emptyProfile).success, true);
  assert.equal(emptyProfile.profile.privacy.allowAnalytics, false);

  const validProject = {
    id: 'proj_1',
    title: 'Portfolio',
    description: 'A project description',
    technologies: ['JavaScript'],
    image: '',
    githubUrl: 'https://github.com/example/project',
    liveUrl: '',
    status: 'Live',
    metrics: '',
  };
  const parsed = profileDataSchema.safeParse({
    ...emptyProfile,
    projects: [validProject],
    profile: { ...emptyProfile.profile, skills: [{ name: 'JavaScript', level: 'Advanced' }] },
  });
  assert.equal(parsed.success, true);
  assert.equal(parsed.data.projects[0].featured, false);
  assert.equal(parsed.data.projects[0].stars, 0);
  assert.equal(parsed.data.profile.skills[0].category, '');

  assert.equal(profileDataSchema.safeParse({
    ...emptyProfile,
    profile: { ...emptyProfile.profile, avatar: 'javascript:alert(1)' },
  }).success, false);
  assert.equal(profileDataSchema.safeParse({
    ...emptyProfile,
    profile: { ...emptyProfile.profile, banner: 'http://example.com/image.jpg' },
  }).success, false);
  assert.equal(profileDataSchema.safeParse({
    ...emptyProfile,
    profile: { ...emptyProfile.profile, isAdmin: true },
  }).success, false);
  assert.equal(profileDataSchema.safeParse({
    ...emptyProfile,
    ownerId: 'another-account',
  }).success, false);
});

test('profile analytics accepts only non-identifying event categories and hashes visitors per profile', () => {
  assert.equal(profileAnalyticsEventSchema.safeParse({
    eventType: 'link_click',
    target: 'Profile link',
  }).success, true);
  assert.equal(profileAnalyticsEventSchema.safeParse({
    eventType: 'link_click',
    target: 'https://private.example/path?token=secret',
  }).success, false);
  assert.equal(profileAnalyticsEventSchema.safeParse({
    eventType: 'contact_click',
    target: 'person@example.com',
  }).success, false);

  const ownerId = '507f1f77bcf86cd799439011';
  const secret = 'test-secret';
  const visitorHash = createAnalyticsVisitorHash(ownerId, '203.0.113.8', secret);
  assert.match(visitorHash, /^[a-f0-9]{64}$/);
  assert.equal(visitorHash.includes('203.0.113.8'), false);
  assert.equal(visitorHash, createAnalyticsVisitorHash(ownerId, '203.0.113.8', secret));
  assert.notEqual(visitorHash, createAnalyticsVisitorHash('507f1f77bcf86cd799439012', '203.0.113.8', secret));
});

test('OneMe Flow validates explicit sharing consent and only returns selected contact fields', () => {
  assert.equal(createFlowRequestSchema.safeParse({
    targetUsername: 'other-member',
    shareFields: ['email', 'phone'],
  }).success, true);
  assert.equal(createFlowRequestSchema.safeParse({
    targetUsername: '@other-member',
    shareFields: ['email'],
  }).success, false);
  assert.equal(createFlowRequestSchema.safeParse({
    targetUsername: 'other-member',
    shareFields: ['email', 'email'],
  }).success, false);
  assert.equal(respondToFlowSchema.safeParse({
    action: 'accept',
    shareFields: [],
  }).success, false);
  assert.equal(respondToFlowSchema.safeParse({
    action: 'decline',
    shareFields: [],
  }).success, true);

  const account = { email: 'member@example.com' };
  const profile = {
    phone: '+1 555 0100',
    socials: [{ label: 'GitHub', platform: 'github', url: 'https://github.com/member' }],
    resume: { fileName: 'resume.pdf', fileUrl: 'https://res.cloudinary.com/demo/raw/upload/resume.pdf' },
  };
  assert.deepEqual(availableFlowFields(account, profile), ['email', 'phone', 'socials', 'resume']);
  assert.deepEqual(createFlowContactData({ account, profile, fields: ['phone'] }), {
    email: '',
    phone: '+1 555 0100',
    socials: [],
    resume: { fileName: '', fileUrl: '' },
  });
});

test('vCard export escapes user-controlled line breaks to prevent injected properties', () => {
  const card = generateVCard({
    name: 'Member\r\nEMAIL:attacker@example.com',
    email: 'member@example.com',
    title: 'Engineer\nTEL:+1-555-0000',
    username: 'member',
  });
  assert.equal(card.includes('\r\nEMAIL:attacker@example.com'), false);
  assert.equal(card.includes('\r\nTEL:+1-555-0000'), false);
  assert.match(card, /\\nEMAIL:attacker@example.com/);
});

test('AI profile copy validates bounded prompts and structured model output', () => {
  assert.equal(aiCopyRequestSchema.safeParse({ prompt: 'A focused software engineer seeking product roles.' }).success, true);
  assert.equal(aiCopyRequestSchema.safeParse({ prompt: 'short' }).success, false);
  assert.equal(aiCopyRequestSchema.safeParse({
    prompt: 'A software engineer seeking product roles with a focus on design systems.',
    includeProfile: true,
  }).success, false);

  const parsed = parseGeneratedAiCopy(JSON.stringify({
    tagline: 'Building accessible products.',
    bio: 'A software engineer who creates accessible web applications.',
    cta: 'Let’s work together',
  }));
  assert.equal(parsed.success, true);
  assert.equal(parseGeneratedAiCopy('not json').success, false);
  assert.equal(parseGeneratedAiCopy(JSON.stringify({
    tagline: 'x'.repeat(201),
    bio: 'A professional bio.',
    cta: 'Contact me',
  })).success, false);
});

test('notification mutations accept only owner-scoped event identifiers', () => {
  assert.equal(notificationActionSchema.safeParse({
    id: '507f1f77bcf86cd799439011',
    event: 'incoming',
  }).success, true);
  assert.equal(notificationActionSchema.safeParse({
    id: 'not-an-object-id',
    event: 'response',
  }).success, false);
  assert.equal(notificationActionSchema.safeParse({
    id: '507f1f77bcf86cd799439011',
    event: 'incoming',
    ownerId: 'another-account',
  }).success, false);
  assert.equal(markAllNotificationsSchema.safeParse({ all: true }).success, true);
  assert.equal(markAllNotificationsSchema.safeParse({ all: false }).success, false);
});

test('Google OAuth accepts only verified, valid, non-disposable account identities', () => {
  assert.deepEqual(getVerifiedGoogleIdentity({
    email: '  MEMBER@EXAMPLE.COM ',
    email_verified: true,
    name: 'Member Name',
  }), {
    name: 'Member Name',
    email: 'member@example.com',
  });
  assert.equal(getVerifiedGoogleIdentity({
    email: 'member@example.com',
    email_verified: false,
    name: 'Member Name',
  }), null);
  assert.equal(getVerifiedGoogleIdentity({
    email: 'not-an-email',
    email_verified: true,
    name: 'Member Name',
  }), null);
  assert.equal(getVerifiedGoogleIdentity({
    email: 'member@mailinator.com',
    email_verified: true,
    name: 'Member Name',
  }), null);
});

test('public profile payload returns only published, privacy-approved contact fields', () => {
  const data = createEmptyProfileData();
  data.profile.isPublished = true;
  data.profile.phone = '+1 555 0100';
  data.profile.location = 'Public City';
  data.resume.summary = 'Private resume summary';

  const account = {
    id: '507f1f77bcf86cd799439011',
    name: 'Profile Owner',
    username: 'profile-owner',
    email: 'owner@example.com',
  };
  const privatePayload = createPublicProfilePayload(account, data);
  assert.equal(privatePayload.user.email, undefined);
  assert.equal(privatePayload.user.phone, undefined);
  assert.equal(privatePayload.user.location, '');
  assert.equal(privatePayload.resume, null);
  assert.equal(privatePayload.indexable, false);

  data.profile.privacy = {
    showEmail: true,
    showPhone: true,
    showLocation: true,
    showResume: true,
    searchEngineIndexing: true,
  };
  const publicPayload = createPublicProfilePayload(account, data);
  assert.equal(publicPayload.user.email, account.email);
  assert.equal(publicPayload.user.phone, data.profile.phone);
  assert.equal(publicPayload.user.location, data.profile.location);
  assert.equal(publicPayload.resume.summary, data.resume.summary);
  assert.equal(publicPayload.indexable, true);

  data.profile.isPublished = false;
  assert.equal(createPublicProfilePayload(account, data), null);
});

test('public profile payload omits content from sections hidden in the page builder', () => {
  const data = createEmptyProfileData();
  data.profile.isPublished = true;
  data.profile.bio = 'Hidden biography';
  data.profile.phone = '+1 555 0100';
  data.profile.socials = [{
    id: 'github',
    platform: 'github',
    label: 'GitHub',
    url: 'https://github.com/member',
    handle: 'member',
    featured: false,
  }];
  data.profile.skills = [{ name: 'Private skill', category: '', level: 'Expert' }];
  data.profile.customCta.text = 'Private invitation';
  data.profile.privacy.showEmail = true;
  data.profile.privacy.showPhone = true;
  data.profile.privacy.showResume = true;
  data.profile.sectionVisibility = {
    about: false,
    cta: false,
    socials: false,
    skills: false,
    projects: false,
    experience: false,
    education: false,
    certifications: false,
    achievements: false,
    resume: false,
    contact: false,
  };
  data.projects = [{
    id: 'hidden-project',
    title: 'Private project',
    description: '',
    technologies: [],
    image: '',
    githubUrl: '',
    liveUrl: '',
    status: '',
    featured: false,
    metrics: '',
    stars: 0,
  }];
  data.experience = [{
    id: 'hidden-role',
    role: 'Private role',
    company: '',
    location: '',
    period: '',
    description: '',
    highlights: [],
  }];
  data.education = [{
    id: 'hidden-school',
    institution: 'Private school',
    degree: '',
    period: '',
    location: '',
    grade: '',
    description: '',
  }];
  data.certifications = [{
    id: 'hidden-cert',
    name: 'Private certification',
    issuer: '',
    issueDate: '',
    credentialId: '',
    verifyUrl: '',
    badge: '',
  }];
  data.achievements = [{
    id: 'hidden-award',
    title: 'Private award',
    organization: '',
    date: '',
    description: '',
  }];
  data.resume.summary = 'Private resume content';
  data.resume.fileUrl = 'https://example.com/private-resume.pdf';

  const payload = createPublicProfilePayload({
    id: '507f1f77bcf86cd799439011',
    name: 'Profile Owner',
    username: 'profile-owner',
    email: 'owner@example.com',
  }, data);

  assert.equal(payload.user.bio, undefined);
  assert.equal(payload.user.customCta, undefined);
  assert.deepEqual(payload.user.socials, []);
  assert.deepEqual(payload.user.skills, []);
  assert.equal(payload.user.email, undefined);
  assert.equal(payload.user.phone, undefined);
  assert.deepEqual(payload.projects, []);
  assert.deepEqual(payload.experience, []);
  assert.deepEqual(payload.education, []);
  assert.deepEqual(payload.certifications, []);
  assert.deepEqual(payload.achievements, []);
  assert.equal(payload.resume, null);
});

test('discovery search terms escape regular-expression syntax', () => {
  assert.equal(escapeSearchTerm('.*[name]'), '\\.\\*\\[name\\]');
});
