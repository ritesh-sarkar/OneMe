# OneMe

**Your identity. One link.**

OneMe is a JavaScript/Next.js personal digital identity and contact-card platform. The repository contains a substantial responsive UI for profiles, projects, resume information, appearance, connections, analytics, discovery, and OneMe Flow.

## Implementation status

The account lifecycle has server-backed registration, email verification, sign-in, session checks, and password reset using MongoDB/Mongoose, Auth.js (NextAuth), Brevo transactional email, and Upstash Redis rate limiting. The dashboard requires a valid server session. Authenticated profile, theme, project, career, certification, achievement, resume, and privacy data are stored in MongoDB. Public profile reads require publication and redact contact fields according to privacy controls. Profile photos, banners, and PDF resumes use owner-scoped signed Cloudinary uploads.

This is still an early implementation, not a production-ready platform:

- Account and profile features require configured MongoDB, Brevo, Upstash, and Cloudinary services. These provider integrations have not been live-tested in this repository because credentials are not configured.
- The public discovery directory uses published, verified profiles that opted in separately; analytics are off by default and record approximate profile views and link categories only when enabled.
- Connections are persisted as accepted OneMe Flow exchanges. Requests use exact verified usernames; each participant explicitly chooses which contact categories to share, and no contact data is disclosed until the recipient accepts and selects their own fields. Requests expire after seven days; either party can cancel or decline, and saved connections can be removed.
- OneMe Flow does not scan for nearby devices or use a proximity radar. Exchange requests use verified usernames and explicit, two-sided consent through the dashboard and public profiles.
- AI assistance and notifications are not connected to server-side integrations.
- Google sign-in is not implemented.

The app also includes baseline security headers and a static/offline-only PWA shell. Do not deploy this version as a production service or enter sensitive personal information. Production use still requires service configuration and end-to-end testing with configured providers.

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
- Cloudinary for signed profile image and resume uploads

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
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `CLOUDINARY_IMAGE_UPLOAD_PRESET`, and `CLOUDINARY_RESUME_UPLOAD_PRESET`. Configure the signed image preset to enforce a 5 MB maximum and JPEG, PNG, WebP, or AVIF formats. Configure the signed resume preset to enforce a 10 MB maximum and PDF-only uploads.

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
- `/[username]` — published public profile with privacy controls
- `/dashboard` and `/dashboard/*` — session-protected dashboard UI
- `/discover` — opt-in directory of published, verified profiles
- `/exchange` — OneMe Flow mutual-consent exchange
- `/login`, `/signup`, `/forgot-password`, `/verify-email` — account screens
- `/api/auth/*` — Auth.js and account lifecycle endpoints
- `/api/profile` — authenticated profile persistence
- `/api/profiles/[username]` — privacy-filtered public profile data
- `/api/profiles/[username]/events` — opt-in, rate-limited profile link analytics
- `/api/analytics` — authenticated owner-only analytics aggregation (7, 30, or 90 days)
- `/api/discover` — paginated, privacy-opted-in discovery directory
- `/api/flow/sessions` — authenticated Flow request inbox and request creation
- `/api/flow/sessions/[sessionId]` — recipient approval/decline and requester cancellation
- `/api/connections` — owner-scoped accepted exchanges and connection removal

## Production work still required

Integrate and validate AI and notification services; configure and review deployment security; and test the complete lifecycle—including two-account contact exchange—with real service integrations. Analytics retain events for up to 90 days, deduplicate visitor events into 15-minute windows, and do not store raw IP addresses, referrers, destination URLs, locations, or device details.
