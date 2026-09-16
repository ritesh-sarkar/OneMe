'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FiHome,
  FiUser,
  FiSliders,
  FiUsers,
  FiBarChart2,
  FiRadio,
} from 'react-icons/fi';

const MOBILE_NAV = [
  { label: 'Overview', href: '/dashboard', icon: FiHome },
  { label: 'Profile', href: '/dashboard/profile', icon: FiUser },
  { label: 'Flow', href: '/dashboard/exchange', icon: FiRadio, highlight: true },
  { label: 'Appearance', href: '/dashboard/appearance', icon: FiSliders },
  { label: 'Contacts', href: '/dashboard/connections', icon: FiUsers },
  { label: 'Analytics', href: '/dashboard/analytics', icon: FiBarChart2 },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-page/95 backdrop-blur-xl border-t border-subtle px-2 py-2 flex items-center justify-around">
      {MOBILE_NAV.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        if (item.highlight) {
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center -mt-5"
            >
              <div className="w-12 h-12 rounded-full gradient-brand flex items-center justify-center text-surface-dark glow-cyan border-2 border-subtle">
                <Icon className="w-5 h-5 animate-pulse" />
              </div>
              <span className="text-[10px] font-bold text-cyan mt-1">
                {item.label}
              </span>
            </Link>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
              isActive ? 'text-cyan font-bold' : 'text-secondary hover:text-primary'
            }`}
          >
            <Icon className="w-4 h-4 mb-1" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
