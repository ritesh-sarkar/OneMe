'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FiBarChart2,
  FiEye,
  FiGrid,
  FiMousePointer,
  FiDownload,
  FiRadio,
  FiGlobe,
  FiSmartphone,
  FiTrendingUp,
} from 'react-icons/fi';
import { Tabs } from '@/components/Tabs';
import { DEMO_ANALYTICS } from '@/lib/mock-data';

const TIMEFRAME_TABS = [
  { id: '7d', label: 'Last 7 Days' },
  { id: '30d', label: 'Last 30 Days' },
  { id: '90d', label: 'Last 90 Days' },
  { id: 'all', label: 'All Time' },
];

export default function AnalyticsPage() {
  const [timeframe, setTimeframe] = useState('7d');
  const { overview, viewsOverTime, trafficSources, topClickedLinks, devices, geoDistribution } = DEMO_ANALYTICS;

  // Maximum view count for SVG chart scaling
  const maxView = Math.max(...viewsOverTime.map((d) => d.views));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-primary tracking-tight">
            Telemetry & Analytics
          </h1>
          <p className="text-xs sm:text-sm text-secondary">
            Real-time engagement telemetry across views, QR scans, and link clicks.
          </p>
        </div>

        <Tabs
          tabs={TIMEFRAME_TABS}
          activeTab={timeframe}
          onChange={setTimeframe}
        />
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-glass border border-subtle backdrop-blur-xl space-y-2">
          <div className="flex items-center justify-between text-secondary">
            <span className="text-xs font-semibold">Total Profile Views</span>
            <FiEye className="w-4 h-4 text-accent" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-primary font-mono">
            {overview.profileViews.toLocaleString()}
          </div>
          <div className="text-[11px] text-success font-medium flex items-center gap-1">
            <FiTrendingUp className="w-3 h-3" />
            <span>+24.2% vs previous period</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-glass border border-subtle backdrop-blur-xl space-y-2">
          <div className="flex items-center justify-between text-secondary">
            <span className="text-xs font-semibold">Physical QR Scans</span>
            <FiGrid className="w-4 h-4 text-success" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-primary font-mono">
            {overview.qrScans.toLocaleString()}
          </div>
          <div className="text-[11px] text-success font-medium flex items-center gap-1">
            <FiTrendingUp className="w-3 h-3" />
            <span>+18.9% from events</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-glass border border-subtle backdrop-blur-xl space-y-2">
          <div className="flex items-center justify-between text-secondary">
            <span className="text-xs font-semibold">Link Clicks</span>
            <FiMousePointer className="w-4 h-4 text-accent" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-primary font-mono">
            {overview.linkClicks.toLocaleString()}
          </div>
          <div className="text-[11px] text-accent font-medium">
            14.5% conversion CTR
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-glass border border-subtle backdrop-blur-xl space-y-2">
          <div className="flex items-center justify-between text-secondary">
            <span className="text-xs font-semibold">vCards & Exchanges</span>
            <FiDownload className="w-4 h-4 text-warning" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-primary font-mono">
            {(overview.contactSaves + overview.contactExchanges).toLocaleString()}
          </div>
          <div className="text-[11px] text-success font-medium">
            73 saves • 45 OneMe Flow connections
          </div>
        </div>
      </div>

      {/* Main Interactive SVG Views & Activity Chart */}
      <div className="p-6 sm:p-8 rounded-3xl bg-glass border border-subtle backdrop-blur-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-primary">Daily Views & Engagement Flow</h3>
            <p className="text-xs text-secondary">Comparing profile visits and QR code activations</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5 text-accent">
              <span className="w-2.5 h-2.5 rounded-full bg-accent" />
              <span>Views</span>
            </div>
            <div className="flex items-center gap-1.5 text-success">
              <span className="w-2.5 h-2.5 rounded-full bg-success" />
              <span>QR Scans</span>
            </div>
          </div>
        </div>

        {/* Interactive Bar/Column Stage */}
        <div className="h-64 flex items-end justify-between gap-3 pt-8 pb-2 px-2 border-b border-subtle">
          {viewsOverTime.map((item, index) => {
            const viewHeightPercent = (item.views / maxView) * 100;
            const scanHeightPercent = (item.scans / maxView) * 100;

            return (
              <div
                key={index}
                className="flex-1 flex flex-col items-center gap-2 group relative h-full justify-end"
              >
                {/* Tooltip on hover */}
                <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 px-2.5 py-1 rounded-xl bg-surface-dark border border-light text-[10px] font-mono whitespace-nowrap shadow-xl">
                  <div>Views: <span className="text-accent font-bold">{item.views}</span></div>
                  <div>Scans: <span className="text-success font-bold">{item.scans}</span></div>
                </div>

                <div className="w-full flex items-end justify-center gap-1.5 h-full">
                  {/* Views Bar */}
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${viewHeightPercent}%` }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    className="w-full max-w-[28px] rounded-t-lg bg-accent group-hover:brightness-110 transition-colors"
                  />
                  {/* Scans Bar */}
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${scanHeightPercent}%` }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    className="w-full max-w-[14px] rounded-t-lg bg-success group-hover:brightness-110 transition-colors"
                  />
                </div>

                <span className="text-[11px] text-muted font-mono mt-1">
                  {item.date}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two-Column Deep Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Clicked Links */}
        <div className="p-6 sm:p-8 rounded-3xl bg-glass border border-subtle backdrop-blur-xl space-y-4">
          <h3 className="text-sm font-bold text-primary">Most Clicked Links & CTAs</h3>
          <div className="space-y-3">
            {topClickedLinks.map((link, i) => (
              <div
                key={i}
                className="p-3.5 rounded-2xl bg-surface-dark/70 border border-subtle flex items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-primary truncate">{link.label}</div>
                  <div className="text-[10px] text-muted font-mono truncate">{link.url}</div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-mono font-bold text-accent">{link.clicks}</span>
                  <span className="text-[10px] text-muted ml-1">clicks</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Geographic Distribution & Devices */}
        <div className="p-6 sm:p-8 rounded-3xl bg-glass border border-subtle backdrop-blur-xl space-y-6">
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-primary flex items-center gap-2">
              <FiGlobe className="w-4 h-4 text-cyan" />
              <span>Visitor Locations</span>
            </h3>
            <div className="space-y-2">
              {geoDistribution.map((geo, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="text-secondary font-medium">
                    {geo.country} <span className="text-muted font-normal">({geo.city})</span>
                  </span>
                  <span className="font-mono text-secondary">{geo.views} views</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-subtle">
            <h3 className="text-sm font-bold text-primary flex items-center gap-2">
              <FiSmartphone className="w-4 h-4 text-accent" />
              <span>Device Breakdown</span>
            </h3>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              {devices.map((dev, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-surface-dark/80 border border-subtle">
                  <div className="text-base font-bold text-primary font-mono">{dev.percentage}%</div>
                  <div className="text-[10px] text-muted mt-0.5 truncate">{dev.device}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
