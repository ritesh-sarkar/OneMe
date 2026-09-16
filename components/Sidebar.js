'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FiHome,
  FiUser,
  FiSliders,
  FiFolder,
  FiFileText,
  FiUsers,
  FiBarChart2,
  FiRadio,
  FiCpu,
  FiSettings,
  FiExternalLink,
  FiLogOut,
  FiCompass,
} from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import { useProfile } from '@/context/ProfileContext';

const NAV_ITEMS = [
  { label: 'Overview', href: '/dashboard', icon: FiHome },
  { label: 'Profile Editor', href: '/dashboard/profile', icon: FiUser },
  { label: 'Appearance', href: '/dashboard/appearance', icon: FiSliders },
  { label: 'Projects', href: '/dashboard/projects', icon: FiFolder },
  { label: 'Resume & Career', href: '/dashboard/resume', icon: FiFileText },
  { label: 'Connections', href: '/dashboard/connections', icon: FiUsers },
  { label: 'OneMe Flow', href: '/dashboard/exchange', icon: FiRadio, highlight: true },
  { label: 'Analytics', href: '/dashboard/analytics', icon: FiBarChart2 },
  { label: 'AI Assistant', href: '/dashboard/ai-assistant', icon: FiCpu },
  { label: 'Discover', href: '/discover', icon: FiCompass },
  { label: 'Settings', href: '/dashboard/settings', icon: FiSettings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const { profile } = useProfile();

  const activeUser = profile || user;

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-subtle bg-surface-page min-h-screen sticky top-0 h-screen overflow-y-auto scrollbar-none z-30">
      {/* Brand Header */}
      <div className="p-5 border-b border-subtle flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr gradient-brand p-0.5 shadow-md glow-cyan group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-surface-page rounded-[10px] flex items-center justify-center">
              <span className="font-extrabold text-primary text-xs">1M</span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-base font-extrabold text-primary tracking-tight flex items-center gap-1">
              OneMe
              <span className="w-1.5 h-1.5 rounded-full bg-cyan inline-block" />
            </span>
          </div>
        </Link>
      </div>

      {/* Profile Mini Card */}
      <div className="p-4 mx-3 my-3 rounded-2xl bg-glass border border-subtle flex items-center gap-3">
        <div className="relative w-10 h-10 rounded-full overflow-hidden border border-light shrink-0">
          <img
            src={activeUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'}
            alt={activeUser?.name || 'Ritesh'}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-xs font-bold text-primary truncate">{activeUser?.name || 'Ritesh Sarkar'}</h4>
          <p className="text-[11px] text-secondary font-mono truncate">@{activeUser?.username || 'ritesh'}</p>
        </div>
        <Link
          href={`/@${activeUser?.username || 'ritesh'}`}
          target="_blank"
          className="p-1.5 rounded-lg hover:bg-glass-soft text-secondary hover:text-cyan transition-colors"
          title="View Public Profile"
        >
          <FiExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'btn-primary font-semibold glow-indigo'
                  : 'text-secondary hover:text-primary hover:bg-surface-deep'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 ${
                    isActive
                      ? 'text-primary'
                      : item.highlight
                      ? 'text-cyan'
                      : 'text-secondary'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.highlight && !isActive && (
                <span className="w-2 h-2 rounded-full bg-cyan animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-subtle mt-auto">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-secondary hover:text-danger hover:bg-danger-soft transition-colors"
        >
          <FiLogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
