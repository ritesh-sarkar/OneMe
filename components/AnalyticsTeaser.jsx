"use client";

import React from "react";
import { FiEye, FiMousePointer, FiShield, FiClock } from "react-icons/fi";

const FEATURES = [
  {
    label: "Profile views",
    detail: "See approximate visits to your published identity.",
    icon: FiEye,
    tone: "text-accent",
  },
  {
    label: "Link activity",
    detail: "Understand which public profile links get attention.",
    icon: FiMousePointer,
    tone: "text-success",
  },
  {
    label: "Opt-in by choice",
    detail: "Analytics stay off until you enable them in privacy settings.",
    icon: FiShield,
    tone: "text-warning",
  },
  {
    label: "90-day retention",
    detail: "Events expire automatically; no location or device tracking.",
    icon: FiClock,
    tone: "text-cyan",
  },
];

export function AnalyticsTeaser() {
  return (
    <section className="relative border-t border-subtle bg-surface-dark/40 py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-2xl space-y-3 text-center">
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-accent md:text-sm">
            Privacy-first analytics
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight text-primary md:text-4xl">
            Learn how people engage with your identity
          </h2>
          <p className="text-sm text-secondary md:text-base">
            Get useful activity counts without collecting referrers, raw IP addresses, visitor
            locations, or device details.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ label, detail, icon: Icon, tone }) => (
            <div
              key={label}
              className="space-y-3 rounded-2xl border border-subtle bg-glass p-5 backdrop-blur-md"
            >
              <Icon className={`h-5 w-5 ${tone}`} />
              <h3 className="font-bold text-primary">{label}</h3>
              <p className="text-sm leading-relaxed text-secondary">{detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
