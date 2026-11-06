import { LandingFooter } from '@/components/LandingFooter';
import { LandingNavbar } from '@/components/LandingNavbar';
import QrExchange from '@/components/QrExchange';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return {
    title: 'OneMe Flow QR Exchange',
    robots: { index: false, follow: false },
    referrer: 'no-referrer',
  };
}

export default async function FlowQrPage({ params }) {
  const { token } = await params;
  return (
    <div className="flex min-h-screen flex-col bg-surface-page text-primary">
      <LandingNavbar />
      <QrExchange token={token} />
      <LandingFooter />
    </div>
  );
}
