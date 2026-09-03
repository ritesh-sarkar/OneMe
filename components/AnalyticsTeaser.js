"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  FiTrendingUp,
  FiEye,
  FiGrid,
  FiMousePointer,
  FiDownload,
  FiUserCheck,
} from "react-icons/fi";
import { DEMO_ANALYTICS } from "@/libs/mock-data";

export function AnalyticsTeaser() {
  const { overview, trafficSources } = DEMO_ANALYTICS;

  return (
    <section className="py-24 border-t border-subtle bg-surface-dark/40 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
          <span className="text-xs font-semibold uppercase tracking-wider text-accent font-mono">
            Actionable Telemetry
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-primary tracking-tight">
            Know Who Engages With Your Work
          </h2>
          <p className="text-sm sm:text-base text-secondary">
            Gain transparent insights on link clicks, QR code scans at
            networking events, and resume downloads.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-5 rounded-2xl bg-glass border border-subtle backdrop-blur-md">
            <div className="flex items-center justify-between text-secondary mb-2">
              <span className="text-xs font-medium">Profile Views</span>
              <FiEye className="w-4 h-4 text-accent" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-primary font-mono">
              1,284
            </div>
            <div className="text-[11px] text-success font-medium mt-1">
              +24% this week
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-glass border border-subtle backdrop-blur-md">
            <div className="flex items-center justify-between text-secondary mb-2">
              <span className="text-xs font-medium">QR Scans</span>
              <FiGrid className="w-4 h-4 text-success" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-primary font-mono">
              342
            </div>
            <div className="text-[11px] text-success font-medium mt-1">
              +18% from meetups
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-glass border border-subtle backdrop-blur-md">
            <div className="flex items-center justify-between text-secondary mb-2">
              <span className="text-xs font-medium">Link Clicks</span>
              <FiMousePointer className="w-4 h-4 text-accent" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-primary font-mono">
              187
            </div>
            <div className="text-[11px] text-accent font-medium mt-1">
              14.5% CTR
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-glass border border-subtle backdrop-blur-md">
            <div className="flex items-center justify-between text-secondary mb-2">
              <span className="text-xs font-medium">Contact Saves</span>
              <FiUserCheck className="w-4 h-4 text-warning" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-primary font-mono">
              73
            </div>
            <div className="text-[11px] text-success font-medium mt-1">
              vCards downloaded
            </div>
          </div>
        </div>

        {/* Traffic Channels Breakdown Bar */}
        <div className="p-6 rounded-2xl bg-glass-soft border border-subtle backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between text-xs text-secondary">
            <span className="font-semibold text-primary">
              Top Traffic Channels
            </span>
            <span>Last 30 Days</span>
          </div>

          <div className="w-full h-3 rounded-full bg-surface-panel overflow-hidden flex">
            {trafficSources.map((source, i) => (
              <div
                key={i}
                style={{
                  width: `${source.percentage}%`,
                  backgroundColor: source.color,
                }}
                className="h-full transition-all duration-500"
                title={`${source.source}: ${source.percentage}%`}
              />
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            {trafficSources.map((source, i) => (
              <div key={i} className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: source.color }}
                />
                <span className="text-secondary">{source.source}</span>
                <span className="text-muted font-mono">
                  ({source.percentage}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
