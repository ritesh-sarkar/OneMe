# OneMe

**Your identity. One link.**

OneMe is a JavaScript/Next.js personal digital identity and contact-card platform. The repository contains a substantial responsive UI for profiles, projects, resume information, appearance, connections, analytics, discovery, and OneMe Flow.

## Implementation status

The account lifecycle now has server-backed registration, email verification, sign-in, session checks, and password reset using MongoDB/Mongoose, Auth.js (NextAuth), Brevo transactional email, and Upstash Redis rate limiting. The dashboard requires a valid server session.

This is still an early implementation, not a production-ready platform:

- Account signup and password setup require configured MongoDB, Brevo, and Upstash services. Without them, the account lifecycle is unavailable; live provider integration has not been verified in this repository.
- Profile, theme, project, resume, and connection edits are still browser-local and are not persisted to MongoDB. Local profile data is separated by account, but is not a shared or server-authoritative record.
- Public profiles, discovery, analytics, and notifications are not backed by shared persistent data.
- OneMe Flow remains a preview using sample profiles. It does not create secure sessions, contact nearby users, exchange consented fields, or save real contacts. Its QR links are marked as previews.
- Image selection, AI assistance, and other dashboard tools are not connected to secure server-side integrations.
- Google sign-in is not implemented.

Do not deploy this version as a production service or enter sensitive personal information. Production use still requires persistent profile APIs, authorization, privacy enforcement, secure media handling, real contact exchange, and end-to-end testing with configured services.

## Technology

- Next.js 16 App Router
- React 19 and JavaScript/JSX
- Tailwind CSS 4
- Framer Motion
- React Icons
- MongoDB with Mongoose for account data
- Auth.js / NextAuth Credentials for email-and-password sessions
- Brevo for verification and password-reset email
- Upstash Redis REST for distributed authentication rate limits

## Project structure

```text
app/         App Router pages, layouts, and account API routes
components/  Reusable UI and page components
context/     Client-side auth, profile, theme, connections, and toast state
libs/        Database, auth, validation, email, storage, QR, and vCard helpers
public/      Static assets
tests/       Node.js tests for auth validation and helpers
```

## Local development

Use the Node.js version supported by the installed Next.js release. Copy `.env.example` to `.env.local` and configure the account-service variables before testing account creation:

- `MONGODB_URI`
- `AUTH_SECRET` (a long random secret)
- `NEXTAUTH_URL` (for local development, `http://localhost:3000`)
- `BREVO_API_KEY`, `BREVO_SENDER_EMAIL`, and `BREVO_SENDER_NAME`
- `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`

Authentication endpoints fail closed when required database, email, or rate-limit services are unavailable. Use test credentials and provider accounts for development; never commit `.env.local` or real secrets.

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Available checks:

```bash
npm test
npm run lint
npm run build
```

## Routes

- `/` — landing page
- `/[username]` — public profile preview
- `/dashboard` and `/dashboard/*` — session-protected dashboard UI
- `/discover` — discovery preview
- `/exchange` — OneMe Flow preview
- `/login`, `/signup`, `/forgot-password`, `/verify-email` — account screens
- `/api/auth/*` — Auth.js and account lifecycle endpoints

## Production work still required

Persist profile, theme, project, resume, connection, and analytics data with per-user authorization; implement privacy-aware public profiles and discovery; secure image uploads; build actual consent-enforced OneMe Flow sessions; integrate and validate the AI and notification services; add production security headers and deployment configuration; and test the complete lifecycle with separate accounts and real service integrations.
