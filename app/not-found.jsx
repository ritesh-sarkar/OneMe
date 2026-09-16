'use client';

import React from 'react';
import Link from 'next/link';
import { FiHome, FiCompass, FiZap } from 'react-icons/fi';
import { Button } from '@/components/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface-page text-primary flex flex-col items-center justify-center p-6 text-center space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-light text-accent flex items-center justify-center font-mono font-black text-2xl">
        404
      </div>

      <div className="space-y-2 max-w-md">
        <h1 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight">
          Page Not Found
        </h1>
        <p className="text-xs sm:text-sm text-secondary">
          The identity or page you are searching for does not exist or has been relocated.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Link href="/">
          <Button variant="primary" size="md" icon={FiHome}>
            Return Home
          </Button>
        </Link>
        <Link href="/discover">
          <Button variant="outline" size="md" icon={FiCompass}>
            Discover Profiles
          </Button>
        </Link>
      </div>
    </div>
  );
}
