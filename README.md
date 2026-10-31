# OneMe

**Your identity. One link.**

OneMe is a JavaScript/Next.js prototype for a personal digital identity and contact-card platform. It includes a substantial responsive UI for profiles, projects, resume information, appearance, connections, analytics, discovery, and OneMe Flow.

## Current implementation status

This repository is a frontend prototype, not a production account service. The UI is backed by sample data and browser `localStorage`; it does not currently have application API routes or a connected database.

- Login, signup, Google login, and password recovery are simulated in the browser. Do not use real credentials.
- Profile, theme, and connection edits are stored in the current browser only.
- Public profiles, discovery, analytics, and notifications are not backed by shared persistent data.
- The OneMe Flow UI is a preview using sample profiles. It does not create secure sessions, contact real nearby users, exchange consented fields, or save real contacts. Its QR links are marked as previews.
- Image selection, AI assistance, and other dashboard tools are not connected to secure server-side integrations.
- MongoDB, Auth.js, Brevo, Cloudinary, Upstash, and a production AI provider are not configured by this prototype.

Do not deploy this version as a production service or enter sensitive personal information. Production use requires server-side authentication, persistence, authorization, privacy enforcement, rate limiting, and the external integrations described in the product requirements.

## Technology

- Next.js 16 App Router
- React 19 and JavaScript/JSX
- Tailwind CSS 4
- Framer Motion
- React Icons
- QR and vCard utilities

## Project structure

```text
app/         App Router pages and layouts
components/  Reusable UI and page components
context/     Client-side auth, profile, theme, connections, and toast state
libs/        Browser storage, sample data, theme, QR, and vCard helpers
public/      Static assets
```

## Local development

Use the Node.js version supported by the installed Next.js release.

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Available checks:

```bash
npm run lint
npm run build
```

There is currently no automated unit, integration, or end-to-end test suite.

## Routes in the prototype

- `/` — landing page
- `/[username]` — public profile preview
- `/dashboard` and `/dashboard/*` — dashboard UI
- `/discover` — discovery preview
- `/exchange` — OneMe Flow preview
- `/login`, `/signup`, `/forgot-password` — simulated account screens

## Production work still required

Before production deployment, implement and test the server-side account lifecycle, MongoDB persistence, validated and authorized APIs, distributed rate limiting, transactional email, secure image uploads, analytics, privacy controls, and consent-enforced OneMe Flow sessions. Configure service credentials only in the deployment environment; never commit `.env` files or secrets.

The current project does not consume production service environment variables, so deployment instructions for MongoDB Atlas, Brevo, Cloudinary, Upstash, AI, and Vercel would be premature. Document each integration when it is implemented and verified.
