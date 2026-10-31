"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

//icons
import {
  FiEye,
  FiGrid,
  FiMousePointer,
  FiDownload,
  FiRadio,
  FiZap,
  FiCopy,
  FiCheck,
  FiExternalLink,
  FiSliders,
  FiPlus,
  FiCheckCircle,
  FiUsers,
} from "react-icons/fi";

//Custom Components and libs
import { Button } from "@/components/Button";
import { Toggle } from "@/components/Toggle";
import { useAuth } from "@/context/AuthContext";
import { useProfile } from "@/context/ProfileContext";
import { useToast } from "@/context/ToastContext";
import { copyToClipboard } from "@/libs/utils";
import { PublicProfileView } from "@/components/PublicProfileView";
import { ExchangeModal } from "@/components/ExchangeModal";
import { QrShareModal } from "@/components/QrShareModal";
import { ShareModal } from "@/components/ShareModal";

export default function DashboardOverviewPage() {
  const { user } = useAuth();

  const {
    profile,
    projects,
    experience,
    education,
    certifications,
    achievements,
    resume,
    updateProfile,
  } = useProfile();

  const { success } = useToast();

  const [copied, setCopied] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [analyticsError, setAnalyticsError] = useState("");

  const [exchangeOpen, setExchangeOpen] = useState(false);

  const [qrOpen, setQrOpen] = useState(false);

  const [shareOpen, setShareOpen] = useState(false);

  const activeUser = profile || user;

  useEffect(() => {
    let active = true;
    fetch("/api/analytics?days=7", { cache: "no-store" })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Analytics could not be loaded.");
        if (active) setAnalytics(result);
      })
      .catch((error) => {
        if (active) setAnalyticsError(error.message || "Analytics could not be loaded.");
      });

    return () => {
      active = false;
    };
  }, []);

  const overview = analytics?.overview || {};
  const strengthItems = [
    ["Profile photo", Boolean(profile?.avatar)],
    ["Bio", Boolean(profile?.bio)],
    ["At least one project", projects.length > 0],
    ["Social links", (profile?.socials?.length || 0) > 0],
  ];
  const profileStrength = Math.round(
    (strengthItems.filter(([, complete]) => complete).length / strengthItems.length) * 100,
  );

  const profileUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/@${activeUser?.username || ""}`
      : `https://oneme.app/@${activeUser?.username || ""}`;

  const handleCopy = () => {
    copyToClipboard(profileUrl);

    setCopied(true);

    success("Public profile URL copied!");

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const handleTogglePublish = (isPublished) => {
    updateProfile({
      isPublished,
    });

    success(
      isPublished
        ? "Your OneMe identity is now publicly live!"
        : "Your OneMe profile is now hidden from public view.",
    );
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner & Quick Identity Status */}

      <div
        className="
          flex
          flex-col
          md:flex-row
          md:items-center
          justify-between
          gap-6
          p-6
          md:p-8
          rounded-3xl
          gradient-accent-soft
          border
          border-subtle
          backdrop-blur-xl
        "
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h1
              className="
                text-2xl
                md:text-3xl
                font-black
                text-primary
                tracking-tight
              "
            >
              Good evening, {activeUser?.name?.split(" ")[0] || ""}
            </h1>

            {activeUser?.isVerified && (
              <span
                className="
                  p-1
                  rounded-full
                  bg-cyan
                  text-surface-dark
                "
                title="Verified Identity"
              >
                <FiCheckCircle className="w-3.5 h-3.5" />
              </span>
            )}
          </div>

          <p className="text-sm md:text-base text-secondary">
            {activeUser?.isPublished !== false
              ? "Your OneMe is live and discoverable worldwide."
              : "Your OneMe is currently unpublished (Private)."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div
            className="
              flex
              items-center
              gap-3
              p-2
              rounded-2xl
              bg-surface-dark/80
              border
              border-subtle
            "
          >
            <Toggle
              checked={activeUser?.isPublished !== false}
              onChange={handleTogglePublish}
              label={activeUser?.isPublished !== false ? "Live" : "Draft"}
            />
          </div>

          <Button
            onClick={handleCopy}
            variant="outline"
            size="sm"
            icon={copied ? FiCheck : FiCopy}
            className="
              text-sm
              transition-all
              duration-200
              ease-in-out
              hover:scale-105
              active:scale-95
            "
          >
            {copied ? "Copied" : "Copy Link"}
          </Button>

          <Link
            href={`/@${activeUser?.username || ""}`}
            target="_blank"
          >
            <Button
              variant="primary"
              size="sm"
              iconRight={FiExternalLink}
              className="
                text-sm
                transition-all
                duration-200
                ease-in-out
                hover:scale-105
                active:scale-95
              "
            >
              View Public Page
            </Button>
          </Link>
        </div>
      </div>

      {/* Analytics Overview Grid */}
      {analyticsError && (
        <p
          role="alert"
          className="rounded-2xl border border-light bg-danger-soft p-4 text-sm text-danger"
        >
          {analyticsError}
        </p>
      )}
      <div
        className="
          grid
          grid-cols-2
          lg:grid-cols-4
          gap-4
          md:gap-6
        "
      >
        <div
          className="
            p-5
            rounded-2xl
            bg-glass
            border
            border-subtle
            backdrop-blur-md
            space-y-3
            transition-all
            duration-200
            ease-in-out
            hover:scale-[1.02]
          "
        >
          <div className="flex items-center justify-between text-secondary">
            <span className="text-sm md:text-base font-semibold">Profile Views</span>

            <div className="p-2 rounded-xl bg-cyan-soft text-cyan">
              <FiEye className="w-4 h-4" />
            </div>
          </div>

          <div>
            <div
              className="
                text-2xl
                md:text-3xl
                font-black
                text-primary
                font-mono
              "
            >
              {(overview.profileViews || 0).toLocaleString()}
            </div>

            <div
              className="
                flex
                items-center
                gap-1
                text-xs
                md:text-sm
                text-success
                font-medium
                mt-1
              "
            >
              <span>Last 7 days</span>
            </div>
          </div>
        </div>

        <div
          className="
            p-5
            rounded-2xl
            bg-glass
            border
            border-subtle
            backdrop-blur-md
            space-y-3
            transition-all
            duration-200
            ease-in-out
            hover:scale-102
          "
        >
          <div className="flex items-center justify-between text-secondary">
            <span className="text-sm md:text-base font-semibold">Daily Visitors</span>

            <div className="p-2 rounded-xl bg-success-soft text-success">
              <FiUsers className="w-4 h-4" />
            </div>
          </div>

          <div>
            <div
              className="
                text-2xl
                md:text-3xl
                font-black
                text-primary
                font-mono
              "
            >
              {(overview.uniqueDailyVisitors || 0).toLocaleString()}
            </div>

            <div
              className="
                flex
                items-center
                gap-1
                text-xs
                md:text-sm
                text-success
                font-medium
                mt-1
              "
            >
              <span>Approximate daily unique visitors</span>
            </div>
          </div>
        </div>

        <div
          className="
            p-5
            rounded-2xl
            bg-glass
            border
            border-subtle
            backdrop-blur-md
            space-y-3
            transition-all
            duration-200
            ease-in-out
            hover:scale-[1.02]
          "
        >
          <div className="flex items-center justify-between text-secondary">
            <span className="text-sm md:text-base font-semibold">Link Clicks</span>

            <div className="p-2 rounded-xl bg-accent/10 text-accent">
              <FiMousePointer className="w-4 h-4" />
            </div>
          </div>

          <div>
            <div
              className="
                text-2xl
                md:text-3xl
                font-black
                text-primary
                font-mono
              "
            >
              {(overview.linkClicks || 0).toLocaleString()}
            </div>

            <div
              className="
                text-xs
                md:text-sm
                text-accent
                font-medium
                mt-1
              "
            >
              Last 7 days
            </div>
          </div>
        </div>

        <div
          className="
            p-5
            rounded-2xl
            bg-glass
            border
            border-subtle
            backdrop-blur-md
            space-y-3
            transition-all
            duration-200
            ease-in-out
            hover:scale-[1.02]
          "
        >
          <div className="flex items-center justify-between text-secondary">
            <span className="text-sm md:text-base font-semibold">Resume Downloads</span>

            <div className="p-2 rounded-xl bg-warning-soft text-warning">
              <FiDownload className="w-4 h-4" />
            </div>
          </div>

          <div>
            <div
              className="
                text-2xl
                md:text-3xl
                font-black
                text-primary
                font-mono
              "
            >
              {(overview.resumeDownloads || 0).toLocaleString()}
            </div>

            <div
              className="
                text-xs
                md:text-sm
                text-success
                font-medium
                mt-1
              "
            >
              Last 7 days
            </div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout: Quick Actions & Live Mini Preview */}

      <div
        className="
          grid
          grid-cols-1
          lg:grid-cols-12
          gap-8
          items-start
        "
      >
        {/* Left Column: Quick Actions & Profile Completion & Activity */}

        <div className="lg:col-span-7 space-y-6">
          {/* Quick Actions Panel */}

          <div
            className="
              p-6
              rounded-3xl
              bg-glass
              border
              border-subtle
              backdrop-blur-md
              space-y-4
            "
          >
            <h3
              className="
                text-base
                md:text-lg
                font-bold
                text-primary
                tracking-tight
              "
            >
              Quick Actions
            </h3>

            <div
              className="
                grid
                grid-cols-2
                md:grid-cols-3
                gap-3
              "
            >
              <Link
                href="/dashboard/profile"
                className="block"
              >
                <div
                  className="
                    p-3.5
                    rounded-2xl
                    bg-surface-dark/70
                    border
                    border-subtle
                    hover:border-light
                    transition-all
                    duration-200
                    ease-in-out
                    hover:scale-[1.02]
                    active:scale-[0.98]
                    group
                  "
                >
                  <div
                    className="
                      p-2
                      rounded-xl
                      bg-cyan-soft
                      text-cyan
                      w-fit
                      mb-2
                      group-hover:scale-110
                      transition-transform
                    "
                  >
                    <FiZap className="w-4 h-4" />
                  </div>

                  <div className="text-sm md:text-base font-bold text-primary">Edit Profile</div>

                  <div className="text-xs md:text-sm text-secondary mt-0.5">
                    Bio, skills & media
                  </div>
                </div>
              </Link>

              <Link
                href="/dashboard/appearance"
                className="block"
              >
                <div
                  className="
                    p-3.5
                    rounded-2xl
                    bg-surface-dark/70
                    border
                    border-subtle
                    hover:border-light
                    transition-all
                    duration-200
                    ease-in-out
                    hover:scale-[1.02]
                    active:scale-[0.98]
                    group
                  "
                >
                  <div
                    className="
                      p-2
                      rounded-xl
                      bg-accent/10
                      text-accent
                      w-fit
                      mb-2
                      group-hover:scale-110
                      transition-transform
                    "
                  >
                    <FiSliders className="w-4 h-4" />
                  </div>

                  <div className="text-sm md:text-base font-bold text-primary">Theme Studio</div>

                  <div className="text-xs md:text-sm text-secondary mt-0.5">
                    Presets & custom tokens
                  </div>
                </div>
              </Link>

              <button
                type="button"
                onClick={() => setExchangeOpen(true)}
                className="
                  text-left
                  w-full
                  p-3.5
                  rounded-2xl
                  bg-surface-dark/70
                  border
                  border-subtle
                  hover:border-light
                  transition-all
                  duration-200
                  ease-in-out
                  hover:scale-[1.02]
                  active:scale-[0.98]
                  group
                "
              >
                <div
                  className="
                    p-2
                    rounded-xl
                    bg-success-soft
                    text-success
                    w-fit
                    mb-2
                    group-hover:scale-110
                    transition-transform
                  "
                >
                  <FiRadio className="w-4 h-4 animate-pulse" />
                </div>

                <div className="text-sm md:text-base font-bold text-primary">OneMe Flow</div>

                <div className="text-xs md:text-sm text-secondary mt-0.5">
                  Request a consent-based exchange
                </div>
              </button>

              <button
                type="button"
                onClick={() => setQrOpen(true)}
                className="
                  text-left
                  w-full
                  p-3.5
                  rounded-2xl
                  bg-surface-dark/70
                  border
                  border-subtle
                  hover:border-light
                  transition-all
                  duration-200
                  ease-in-out
                  hover:scale-[1.02]
                  active:scale-[0.98]
                  group
                "
              >
                <div
                  className="
                    p-2
                    rounded-xl
                    bg-cyan-soft
                    text-cyan
                    w-fit
                    mb-2
                    group-hover:scale-110
                    transition-transform
                  "
                >
                  <FiGrid className="w-4 h-4" />
                </div>

                <div className="text-sm md:text-base font-bold text-primary">Identity QR</div>

                <div className="text-xs md:text-sm text-secondary mt-0.5">Download & share</div>
              </button>

              <Link
                href="/dashboard/projects"
                className="block"
              >
                <div
                  className="
                    p-3.5
                    rounded-2xl
                    bg-surface-dark/70
                    border
                    border-subtle
                    hover:border-light
                    transition-all
                    duration-200
                    ease-in-out
                    hover:scale-[1.02]
                    active:scale-[0.98]
                    group
                  "
                >
                  <div
                    className="
                      p-2
                      rounded-xl
                      bg-warning-soft
                      text-warning
                      w-fit
                      mb-2
                      group-hover:scale-110
                      transition-transform
                    "
                  >
                    <FiPlus className="w-4 h-4" />
                  </div>

                  <div className="text-sm md:text-base font-bold text-primary">Add Project</div>

                  <div className="text-xs md:text-sm text-secondary mt-0.5">Showcase your work</div>
                </div>
              </Link>

              <Link
                href="/dashboard/connections"
                className="block"
              >
                <div
                  className="
                    p-3.5
                    rounded-2xl
                    bg-surface-dark/70
                    border
                    border-subtle
                    hover:border-pink
                    transition-all
                    duration-200
                    ease-in-out
                    hover:scale-[1.02]
                    active:scale-[0.98]
                    group
                  "
                >
                  <div
                    className="
                      p-2
                      rounded-xl
                      bg-pink-soft
                      text-pink
                      w-fit
                      mb-2
                      group-hover:scale-110
                      transition-transform
                    "
                  >
                    <FiDownload className="w-4 h-4" />
                  </div>

                  <div className="text-sm md:text-base font-bold text-primary">Connections</div>

                  <div className="text-xs md:text-sm text-secondary mt-0.5">Export contacts</div>
                </div>
              </Link>
            </div>
          </div>

          {/* Profile Strength Widget */}

          <div
            className="
              p-6
              rounded-3xl
              bg-glass
              border
              border-subtle
              backdrop-blur-md
              space-y-4
            "
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base md:text-lg font-bold text-primary">Profile Strength</h3>

                <p className="text-sm md:text-base text-secondary mt-0.5">
                  Complete the basics to help people learn about you.
                </p>
              </div>

              <span
                className="
                  text-sm
                  md:text-base
                  font-black
                  text-success
                  font-mono
                "
              >
                {profileStrength}%
              </span>
            </div>

            <div
              className="
                w-full
                h-2.5
                rounded-full
                bg-surface-panel
                overflow-hidden
              "
            >
              <div
                className="h-full rounded-full gradient-success transition-all"
                style={{ width: `${profileStrength}%` }}
              />
            </div>

            <div
              className="
                grid
                grid-cols-2
                gap-2
                text-sm
                md:text-base
              "
            >
              {strengthItems.map(([label, complete]) => (
                <div
                  key={label}
                  className={`flex items-center gap-2 ${complete ? "text-success" : "text-secondary"}`}
                >
                  <FiCheckCircle className="h-3.5 w-3.5" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 rounded-3xl border border-subtle bg-glass p-6 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-primary md:text-lg">
                Most Clicked Link Categories
              </h3>
              <Link
                href="/dashboard/analytics"
                className="text-sm font-medium text-cyan transition-all hover:tracking-wide"
              >
                View Analytics →
              </Link>
            </div>
            {analytics?.topLinks?.length ? (
              <div className="space-y-3">
                {analytics.topLinks.slice(0, 3).map((item, index) => (
                  <div
                    key={`${item.eventType}-${item.label}-${index}`}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-subtle bg-surface-dark/60 p-3"
                  >
                    <span className="truncate text-sm font-semibold text-primary">
                      {item.label}
                    </span>
                    <span className="shrink-0 font-mono text-sm text-accent">
                      {item.clicks.toLocaleString()} clicks
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-secondary">
                Enable anonymous analytics and share your published profile to see activity here.
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Live Interactive Profile Card */}

        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between px-1">
            <span
              className="
                text-xs
                md:text-sm
                font-bold
                uppercase
                tracking-wider
                text-secondary
                font-mono
                flex
                items-center
                gap-1.5
              "
            >
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              Live Identity Preview
            </span>

            <Link
              href="/dashboard/appearance"
              className="
                text-sm
                md:text-base
                text-cyan
                hover:text-cyan
                font-medium
                transition-all
                duration-200
                ease-in-out
                hover:tracking-wide
              "
            >
              Customize Theme →
            </Link>
          </div>

          <div
            className="
              rounded-4xl
              p-3
              bg-surface-dark
              border
              border-subtle
              shadow-2xl
            "
          >
            <div
              className="
                h-155
                overflow-y-auto
                rounded-[22px]
                bg-surface-dark
                border
                border-subtle
                scrollbar-none
                shadow-inner
              "
            >
              <PublicProfileView
                user={activeUser}
                projects={projects}
                experience={experience}
                education={education}
                certifications={certifications}
                achievements={achievements}
                resume={resume}
                themeId={activeUser?.themeId}
                onOpenExchange={() => setExchangeOpen(true)}
                onOpenQr={() => setQrOpen(true)}
                onOpenShare={() => setShareOpen(true)}
                isLivePreview={true}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}

      <ExchangeModal
        isOpen={exchangeOpen}
        onClose={() => setExchangeOpen(false)}
        currentUser={activeUser}
      />

      <QrShareModal
        isOpen={qrOpen}
        onClose={() => setQrOpen(false)}
        user={activeUser}
      />

      <ShareModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        user={activeUser}
      />
    </div>
  );
}
