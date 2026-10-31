"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FiEye,
  FiMousePointer,
  FiUsers,
  FiDownload,
  FiShield,
  FiRefreshCw,
} from "react-icons/fi";
import { Tabs } from "@/components/Tabs";
import { useProfile } from "@/context/ProfileContext";

const TIMEFRAME_TABS = [
  { id: 7, label: "Last 7 Days" },
  { id: 30, label: "Last 30 Days" },
  { id: 90, label: "Last 90 Days" },
];

const EMPTY_OVERVIEW = {
  profileViews: 0,
  uniqueDailyVisitors: 0,
  linkClicks: 0,
  resumeDownloads: 0,
};

function formatDay(date) {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export default function AnalyticsPage() {
  const [timeframe, setTimeframe] = useState(7);
  const [analytics, setAnalytics] = useState(null);
  const [loadedTimeframe, setLoadedTimeframe] = useState(null);
  const [requestError, setRequestError] = useState(null);
  const loading = loadedTimeframe !== timeframe && requestError?.timeframe !== timeframe;
  const error = requestError?.timeframe === timeframe ? requestError.message : "";
  const { profile } = useProfile();

  useEffect(() => {
    let active = true;

    fetch(`/api/analytics?days=${timeframe}`, { cache: "no-store" })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Analytics could not be loaded.");
        if (active) {
          setAnalytics(result);
          setLoadedTimeframe(timeframe);
          setRequestError(null);
        }
      })
      .catch((requestError) => {
        if (active) {
          setRequestError({
            timeframe,
            message: requestError.message || "Analytics could not be loaded.",
          });
        }
      });

    return () => {
      active = false;
    };
  }, [timeframe]);

  const overview = analytics?.overview || EMPTY_OVERVIEW;
  const viewsOverTime = analytics?.viewsOverTime || [];
  const topLinks = analytics?.topLinks || [];
  const maxView = Math.max(1, ...viewsOverTime.map((item) => item.views));
  const metrics = [
    { label: "Profile Views", value: overview.profileViews, icon: FiEye, tone: "text-accent" },
    { label: "Daily Unique Visitors", value: overview.uniqueDailyVisitors, icon: FiUsers, tone: "text-success" },
    { label: "Link Clicks", value: overview.linkClicks, icon: FiMousePointer, tone: "text-accent" },
    { label: "Resume Downloads", value: overview.resumeDownloads, icon: FiDownload, tone: "text-warning" },
  ];

  return (
    <div className="space-y-8">
      <header className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-text-primary md:text-3xl">
            Profile Analytics
          </h1>
          <p className="mt-1 text-sm leading-relaxed text-secondary md:text-base">
            Privacy-preserving engagement for your published OneMe profile.
          </p>
        </div>
        <Tabs tabs={TIMEFRAME_TABS} activeTab={timeframe} onChange={setTimeframe} />
      </header>

      {profile?.privacy?.allowAnalytics !== true && (
        <div className="flex items-start gap-3 rounded-2xl border border-light bg-surface-panel/70 p-4 text-sm text-secondary">
          <FiShield className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
          <p>
            Anonymous analytics are off. Enable them in{" "}
            <Link href="/dashboard/settings" className="font-semibold text-accent underline">
              Settings &amp; Privacy
            </Link>{" "}
            to start counting visits and clicks on your published profile.
          </p>
        </div>
      )}

      {error && (
        <div role="alert" className="rounded-2xl border border-light bg-danger-soft p-4 text-sm text-danger">
          {error}
        </div>
      )}

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {metrics.map(({ label, value, icon: Icon, tone }) => (
          <div
            key={label}
            className="space-y-3 rounded-3xl border border-subtle bg-glass p-5 backdrop-blur-xl transition-transform duration-200 hover:scale-[1.02]"
          >
            <div className="flex items-center justify-between gap-2 text-secondary">
              <span className="text-sm font-semibold">{label}</span>
              <Icon className={`h-4 w-4 shrink-0 ${tone}`} />
            </div>
            <div className="font-mono text-2xl font-black text-text-primary md:text-3xl">
              {loading ? "—" : value.toLocaleString()}
            </div>
          </div>
        ))}
      </section>

      <section className="space-y-6 rounded-3xl border border-subtle bg-glass p-6 backdrop-blur-xl sm:p-8">
        <div>
          <h2 className="text-base font-bold text-text-primary md:text-lg">Daily Profile Views</h2>
          <p className="text-sm text-secondary">
            Approximate visits, deduplicated to one view per visitor every 15 minutes.
          </p>
        </div>

        <div className="overflow-x-auto border-b border-subtle">
          <div
            className="flex h-64 min-w-full items-end justify-between gap-2 px-2 pb-2 pt-8"
            style={{ minWidth: timeframe === 90 ? 900 : timeframe === 30 ? 600 : 0 }}
          >
            {viewsOverTime.map((item, index) => {
              const height = item.views ? Math.max(5, (item.views / maxView) * 100) : 0;
              const showDate = timeframe === 7 || index % (timeframe === 30 ? 5 : 10) === 0;
              return (
                <div
                  key={item.date}
                  className="group relative flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
                  title={`${formatDay(item.date)}: ${item.views} views`}
                >
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ duration: 0.35, delay: Math.min(index * 0.01, 0.3) }}
                    className="w-full max-w-8 rounded-t-lg bg-accent transition-colors group-hover:brightness-110"
                  />
                  {showDate && (
                    <span className="whitespace-nowrap text-[10px] text-tertiary md:text-xs">
                      {formatDay(item.date)}
                    </span>
                  )}
                  {!showDate && <span className="text-[10px] text-transparent">.</span>}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-3xl border border-subtle bg-glass p-6 backdrop-blur-xl sm:p-8">
        <div>
          <h2 className="text-base font-bold text-text-primary md:text-lg">Most Clicked Link Categories</h2>
          <p className="text-sm text-secondary">
            Click labels are collected without storing destination URLs or referrers.
          </p>
        </div>
        {topLinks.length ? (
          <div className="space-y-3">
            {topLinks.map((item, index) => (
              <div
                key={`${item.eventType}-${item.label}-${index}`}
                className="flex items-center justify-between gap-3 rounded-2xl border border-subtle bg-surface-dark/70 p-3.5"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <FiMousePointer className="h-4 w-4 shrink-0 text-accent" />
                  <span className="truncate text-sm font-semibold text-text-primary">{item.label}</span>
                  <span className="hidden shrink-0 text-xs text-tertiary sm:inline">
                    {item.eventType.replace("_", " ")}
                  </span>
                </div>
                <span className="shrink-0 font-mono text-sm font-bold text-accent">
                  {item.clicks.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-subtle bg-surface-dark/50 p-4 text-sm text-secondary">
            {loading ? "Loading activity…" : "No link activity for this period yet."}
          </p>
        )}
      </section>

      <p className="text-xs leading-relaxed text-tertiary">
        Analytics use a keyed, pseudonymous visitor token; raw IP addresses, email addresses, link destinations,
        referrers, locations, and device details are not stored. Events are retained for up to 90 days.
      </p>
    </div>
  );
}
