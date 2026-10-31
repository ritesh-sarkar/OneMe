import { Suspense } from 'react';
import VerifyEmailPage from '@/components/VerifyEmail';

export default function VerifyEmailRoute() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface-page" />}>
      <VerifyEmailPage />
    </Suspense>
  );
}
