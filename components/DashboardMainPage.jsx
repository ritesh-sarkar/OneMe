"use client";

import React, { useState } from "react";
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
  FiTrendingUp,
  FiCheckCircle,
} from "react-icons/fi";


//Custom Components and libs
import { Button } from "@/components/Button";
import { Toggle } from "@/components/Toggle";
import { useAuth } from "@/context/AuthContext";
import { useProfile } from "@/context/ProfileContext";
import { useToast } from "@/context/ToastContext";
import { copyToClipboard } from "@/libs/utils";
import { DEMO_ANALYTICS } from "@/libs/mock-data"; //TODO: replace with real data
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

  const [exchangeOpen, setExchangeOpen] = useState(false);

  const [qrOpen, setQrOpen] = useState(false);

  const [shareOpen, setShareOpen] = useState(false);

  const activeUser = profile || user;

  const { overview } = DEMO_ANALYTICS;

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
          sm:p-8
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
                sm:text-3xl
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

          <Link href={`/@${activeUser?.username || ""}`} target="_blank">
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

      <div
        className="
          grid
          grid-cols-2
          lg:grid-cols-4
          gap-4
          sm:gap-6
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
            <span className="text-sm md:text-base font-semibold">
              Profile Views
            </span>

            <div className="p-2 rounded-xl bg-cyan-soft text-cyan">
              <FiEye className="w-4 h-4" />
            </div>
          </div>

          <div>
            <div
              className="
                text-2xl
                sm:text-3xl
                font-black
                text-primary
                font-mono
              "
            >
              1,284
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
              <FiTrendingUp className="w-3 h-3" />

              <span>+18.4% vs last week</span>
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
            <span className="text-sm md:text-base font-semibold">QR Scans</span>

            <div className="p-2 rounded-xl bg-success-soft text-success">
              <FiGrid className="w-4 h-4" />
            </div>
          </div>

          <div>
            <div
              className="
                text-2xl
                sm:text-3xl
                font-black
                text-primary
                font-mono
              "
            >
              342
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
              <FiTrendingUp className="w-3 h-3" />

              <span>+32 scans from meetups</span>
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
            <span className="text-sm md:text-base font-semibold">
              Link Clicks
            </span>

            <div className="p-2 rounded-xl bg-accent/10 text-accent">
              <FiMousePointer className="w-4 h-4" />
            </div>
          </div>

          <div>
            <div
              className="
                text-2xl
                sm:text-3xl
                font-black
                text-primary
                font-mono
              "
            >
              187
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
              14.5% conversion CTR
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
            <span className="text-sm md:text-base font-semibold">
              Contact Saves
            </span>

            <div className="p-2 rounded-xl bg-warning-soft text-warning">
              <FiDownload className="w-4 h-4" />
            </div>
          </div>

          <div>
            <div
              className="
                text-2xl
                sm:text-3xl
                font-black
                text-primary
                font-mono
              "
            >
              73
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
              vCards downloaded
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
                sm:grid-cols-3
                gap-3
              "
            >
              <Link href="/dashboard/profile" className="block">
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

                  <div className="text-sm md:text-base font-bold text-primary">
                    Edit Profile
                  </div>

                  <div className="text-xs md:text-sm text-secondary mt-0.5">
                    Bio, skills & media
                  </div>
                </div>
              </Link>

              <Link href="/dashboard/appearance" className="block">
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

                  <div className="text-sm md:text-base font-bold text-primary">
                    Theme Studio
                  </div>

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

                <div className="text-sm md:text-base font-bold text-primary">
                  OneMe Flow
                </div>

                <div className="text-xs md:text-sm text-secondary mt-0.5">
                  Scan nearby peers
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

                <div className="text-sm md:text-base font-bold text-primary">
                  Identity QR
                </div>

                <div className="text-xs md:text-sm text-secondary mt-0.5">
                  Download & share
                </div>
              </button>

              <Link href="/dashboard/projects" className="block">
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

                  <div className="text-sm md:text-base font-bold text-primary">
                    Add Project
                  </div>

                  <div className="text-xs md:text-sm text-secondary mt-0.5">
                    Showcase your work
                  </div>
                </div>
              </Link>

              <Link href="/dashboard/connections" className="block">
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

                  <div className="text-sm md:text-base font-bold text-primary">
                    Connections
                  </div>

                  <div className="text-xs md:text-sm text-secondary mt-0.5">
                    Export contacts
                  </div>
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
                <h3 className="text-base md:text-lg font-bold text-primary">
                  Profile Strength
                </h3>

                <p className="text-sm md:text-base text-secondary mt-0.5">
                  Your profile is 95% complete
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
                95%
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
                className="
                  h-full
                  gradient-success
                  w-[95%]
                  rounded-full
                "
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
              <div className="flex items-center gap-2 text-success">
                <FiCheckCircle className="w-3.5 h-3.5" />

                <span>3 Featured Projects</span>
              </div>

              <div className="flex items-center gap-2 text-success">
                <FiCheckCircle className="w-3.5 h-3.5" />

                <span>6 Social Channels</span>
              </div>

              <div className="flex items-center gap-2 text-success">
                <FiCheckCircle className="w-3.5 h-3.5" />

                <span>Verified vCard Download</span>
              </div>

              <div className="flex items-center gap-2 text-success">
                <FiCheckCircle className="w-3.5 h-3.5" />

                <span>Custom CTA Configured</span>
              </div>
            </div>
          </div>

          {/* Recent Telemetry Activity Feed */}

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
              <h3 className="text-base md:text-lg font-bold text-primary">
                Recent Activity
              </h3>

              <Link
                href="/dashboard/analytics"
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
                View Full Analytics →
              </Link>
            </div>

            <div className="space-y-3">
              <div
                className="
                  p-3
                  rounded-2xl
                  bg-surface-dark/60
                  border
                  border-subtle
                  flex
                  items-center
                  justify-between
                  transition-all
                  duration-200
                  ease-in-out
                  hover:border-light
                "
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-success-soft text-success">
                    <FiRadio className="w-4 h-4" />
                  </div>

                  <div>
                    <div className="text-sm md:text-base font-bold text-primary">
                      OneMe Flow Exchange
                    </div>

                    <div className="text-xs md:text-sm text-secondary">
                      With Sarah Khan (Starlight Studio)
                    </div>
                  </div>
                </div>

                <span
                  className="
                    text-xs
                    md:text-sm
                    text-tertiary
                    font-mono
                  "
                >
                  2h ago
                </span>
              </div>

              <div
                className="
                  p-3
                  rounded-2xl
                  bg-surface-dark/60
                  border
                  border-subtle
                  flex
                  items-center
                  justify-between
                  transition-all
                  duration-200
                  ease-in-out
                  hover:border-light
                "
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-cyan-soft text-cyan">
                    <FiMousePointer className="w-4 h-4" />
                  </div>

                  <div>
                    <div className="text-sm md:text-base font-bold text-primary">
                      PulseFlow Demo Clicked
                    </div>

                    <div className="text-xs md:text-sm text-secondary">
                      Referral from LinkedIn profile
                    </div>
                  </div>
                </div>

                <span
                  className="
                    text-xs
                    md:text-sm
                    text-tertiary
                    font-mono
                  "
                >
                  4h ago
                </span>
              </div>

              <div
                className="
                  p-3
                  rounded-2xl
                  bg-surface-dark/60
                  border
                  border-subtle
                  flex
                  items-center
                  justify-between
                  transition-all
                  duration-200
                  ease-in-out
                  hover:border-light
                "
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-warning-soft text-warning">
                    <FiDownload className="w-4 h-4" />
                  </div>

                  <div>
                    <div className="text-sm md:text-base font-bold text-primary">
                      vCard Downloaded
                    </div>

                    <div className="text-xs md:text-sm text-secondary">
                      From San Francisco, CA visitor
                    </div>
                  </div>
                </div>

                <span
                  className="
                    text-xs
                    md:text-sm
                    text-tertiary
                    font-mono
                  "
                >
                  Yesterday
                </span>
              </div>
            </div>
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
              rounded-[32px]
              p-3
              bg-surface-dark
              border
              border-subtle
              shadow-2xl
            "
          >
            <div
              className="
                h-[620px]
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
