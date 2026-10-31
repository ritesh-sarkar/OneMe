import { z } from 'zod';
import MailChecker from 'mailchecker';

const emailSchema = z.string()
  .trim()
  .toLowerCase()
  .max(254)
  .email('Enter a valid email address.');

const passwordSchema = z.string()
  .min(12, 'Password must be at least 12 characters.')
  .max(72, 'Password must be no more than 72 characters.');

const usernameSchema = z.string()
  .trim()
  .toLowerCase()
  .min(3, 'Username must be at least 3 characters.')
  .max(30, 'Username must be no more than 30 characters.')
  .regex(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/, 'Use letters, numbers, and hyphens; start and end with a letter or number.');

export const registrationSchema = z.object({
  name: z.string()
    .trim()
    .min(2)
    .max(80)
    .refine((value) => !/[\u0000-\u001f\u007f]/.test(value), 'Name contains invalid characters.'),
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
}).strict();

export const accountIdentitySchema = z.object({
  name: z.string()
    .trim()
    .min(2)
    .max(80)
    .refine((value) => !/[\u0000-\u001f\u007f]/.test(value), 'Name contains invalid characters.'),
  email: emailSchema,
}).strict();

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(72),
}).strict();

export const emailRequestSchema = z.object({
  email: emailSchema,
}).strict();

export const passwordResetSchema = z.object({
  token: z.string().min(40).max(128),
  password: passwordSchema,
}).strict();

export const onboardingSchema = z.object({
  action: z.enum(['complete', 'skip']),
  title: z.string().trim().max(120),
  bio: z.string().trim().max(4000),
  location: z.string().trim().max(120),
  avatar: z.string().trim().max(2048),
}).strict().refine(({ action, title, bio }) => (
  action === 'skip' || (title.length > 0 && bio.length > 0)
), {
  message: 'Add a professional title and short description to complete your profile.',
});

export function normalizeUsername(name) {
  const base = name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 24)
    .replace(/-$/g, '');

  return base || 'member';
}

export function isDisposableEmail(email) {
  if (typeof MailChecker.isValid !== 'function') {
    throw new Error('Disposable email data is unavailable.');
  }
  return !MailChecker.isValid(email);
}
