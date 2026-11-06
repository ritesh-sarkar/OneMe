import Link from 'next/link';
import { FiArrowLeft, FiDownload, FiFileText } from 'react-icons/fi';
import { normalizePublicUsername } from '@/libs/public-username';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { username: rawUsername } = await params;
  const username = normalizePublicUsername(rawUsername);
  return {
    title: `Resume | ${username || 'OneMe'}`,
    robots: { index: false, follow: false },
  };
}

export default async function ResumePage({ params }) {
  const { username: rawUsername } = await params;
  const username = normalizePublicUsername(rawUsername);
  if (!/^[a-z0-9][a-z0-9-]{0,29}$/.test(username)) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-surface-page p-6 text-primary">
        <p>Resume not found.</p>
      </main>
    );
  }

  const resumeUrl = `/api/profiles/${encodeURIComponent(username)}/resume`;
  return (
    <main className="flex min-h-screen flex-col bg-surface-page text-primary">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-subtle bg-glass px-4 py-3 backdrop-blur-md sm:px-6">
        <Link
          href={`/${encodeURIComponent(username)}`}
          className="btn-base btn-outline inline-flex items-center gap-2 text-sm"
        >
          <FiArrowLeft className="h-4 w-4" />
          Return to profile
        </Link>
        <div className="flex min-w-0 items-center gap-2 text-sm font-semibold">
          <FiFileText className="h-4 w-4 shrink-0 text-accent" />
          <span className="truncate">Resume</span>
        </div>
        <a
          href={`${resumeUrl}?download=1`}
          className="btn-base btn-primary inline-flex items-center gap-2 text-sm"
        >
          <FiDownload className="h-4 w-4" />
          Download
        </a>
      </header>
      <section className="flex min-h-0 flex-1 p-2 sm:p-4" aria-label="Resume document">
        <iframe
          src={resumeUrl}
          title={`${username}'s resume`}
          className="min-h-[75vh] w-full flex-1 rounded-xl border border-subtle bg-white sm:min-h-0"
        />
      </section>
    </main>
  );
}
