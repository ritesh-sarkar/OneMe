import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/libs/auth-options';
import { aiCopyRequestSchema, parseGeneratedAiCopy } from '@/libs/ai-validation';
import { consumeRateLimits, getTrustedClientIp } from '@/libs/rate-limit';
import { readJsonBody } from '@/libs/request-body';

export const runtime = 'nodejs';

const responseSchema = {
  type: 'OBJECT',
  properties: {
    tagline: { type: 'STRING' },
    bio: { type: 'STRING' },
    cta: { type: 'STRING' },
  },
  required: ['tagline', 'bio', 'cta'],
  propertyOrdering: ['tagline', 'bio', 'cta'],
};

export async function POST(request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'AI suggestions are not configured.' }, { status: 503 });
  }

  const clientIp = getTrustedClientIp(request);
  if (!clientIp) {
    return NextResponse.json({ error: 'AI suggestions are temporarily unavailable.' }, { status: 503 });
  }
  const limit = await consumeRateLimits(request, [
    { name: 'ai-copy-ip', identity: clientIp, windowSeconds: 60, limit: 10 },
    { name: 'ai-copy-user', identity: userId, windowSeconds: 3600, limit: 20 },
  ]);
  if (!limit.ok) {
    return NextResponse.json(
      { error: limit.unavailable ? 'AI suggestions are temporarily unavailable.' : 'Too many AI requests. Please try again later.' },
      limit.unavailable
        ? { status: 503 }
        : { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } },
    );
  }

  const body = await readJsonBody(request, 4 * 1024);
  if (!body.ok) {
    return NextResponse.json(
      { error: body.status === 413 ? 'The prompt is too large.' : 'Invalid request body.' },
      { status: body.status },
    );
  }
  const parsed = aiCopyRequestSchema.safeParse(body.value);
  if (!parsed.success) {
    return NextResponse.json({
      error: parsed.error.issues[0]?.message || 'The prompt must be between 20 and 2,000 characters.',
    }, { status: 400 });
  }

  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  if (!/^gemini-[a-zA-Z0-9._-]{1,80}$/.test(model)) {
    console.error('GEMINI_MODEL is invalid.');
    return NextResponse.json({ error: 'AI suggestions are temporarily unavailable.' }, { status: 503 });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{
              text: 'Write truthful, professional personal-brand copy based only on the user prompt. Do not invent credentials, employers, awards, or experience. Return only the requested JSON fields.',
            }],
          },
          contents: [{ role: 'user', parts: [{ text: parsed.data.prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema,
            temperature: 0.6,
            maxOutputTokens: 640,
          },
        }),
        cache: 'no-store',
        signal: AbortSignal.timeout(20000),
      },
    );

    if (!response.ok) {
      console.error('Gemini profile-copy request failed with status.', response.status);
      return NextResponse.json({ error: 'AI suggestions could not be generated right now.' }, { status: 503 });
    }

    const payload = await response.json();
    const text = payload?.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || '')
      .join('')
      .trim();
    const generated = parseGeneratedAiCopy(text);
    if (!generated.success) {
      console.error('Gemini returned an invalid profile-copy response.');
      return NextResponse.json({ error: 'AI returned an unusable response. Please try again.' }, { status: 502 });
    }

    return NextResponse.json({ suggestions: generated.data }, {
      headers: { 'Cache-Control': 'private, no-store' },
    });
  } catch (error) {
    console.error('Gemini profile-copy request failed.', error?.name || 'UnknownError');
    return NextResponse.json({ error: 'AI suggestions could not be generated right now.' }, { status: 503 });
  }
}
