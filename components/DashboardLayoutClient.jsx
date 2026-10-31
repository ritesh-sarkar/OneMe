'use client';

import React from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Topbar } from '@/components/Topbar';
import { MobileNav } from '@/components/MobileNav';
import { useAuth } from '@/context/AuthContext';

export default function DashboardLayoutClient({ children }) {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-page flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-linear-to-tr gradient-brand flex items-center justify-center text-primary font-black text-base animate-pulse">
            1M
          </div>
          <span className="text-sm md:text-base font-mono text-tertiary animate-pulse">
            Loading OneMe Identity...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-surface-page text-primary selection:bg-accent-soft selection:text-primary">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-8">
        <Topbar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
