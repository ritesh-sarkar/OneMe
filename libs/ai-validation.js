import { z } from 'zod';

export const aiCopyRequestSchema = z.object({
  prompt: z.string().trim().min(20).max(2000),
}).strict();

export const aiCopyResultSchema = z.object({
  tagline: z.string().trim().min(1).max(200),
  bio: z.string().trim().min(1).max(1500),
  cta: z.string().trim().min(1).max(100),
}).strict();

export function parseGeneratedAiCopy(text) {
  if (typeof text !== 'string') return aiCopyResultSchema.safeParse(null);

  try {
    return aiCopyResultSchema.safeParse(JSON.parse(text));
  } catch {
    return aiCopyResultSchema.safeParse(null);
  }
}
