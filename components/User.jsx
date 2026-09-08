"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

// Custom Components and libs
import { PublicProfileView } from "@/components/PublicProfileView";
import { QrShareModal } from "@/components/QrShareModal";
import { ShareModal } from "@/components/ShareModal";
import { ExchangeModal } from "@/components/ExchangeModal";
import { useProfile } from "@/context/ProfileContext";

// Mock data]
//TODO: replace with real data
import {
  DISCOVER_PROFILES,
  DEMO_PROJECTS,
  DEMO_EXPERIENCE,
  DEMO_EDUCATION,
  DEMO_CERTIFICATIONS,
  DEMO_ACHIEVEMENTS,
  DEMO_RESUME,
} from "@/libs/mock-data";

// Icons
import { FiHome, FiCompass, FiZap, FiArrowLeft } from "react-icons/fi";

export default function DynamicPublicProfilePage() {
  const params = useParams();

  const rawUsername = params?.username;

  //TODO: replace with real data
  const username = decodeURIComponent(rawUsername)
    .replace(/^@/, "")
    .toLowerCase();

  const {
    profile,
    projects,
    experience,
    education,
    certifications,
    achievements,
    resume,
  } = useProfile();

  const [exchangeOpen, setExchangeOpen] = useState(false);

  const [qrOpen, setQrOpen] = useState(false);

  const [shareOpen, setShareOpen] = useState(false);

  // Check if viewing active demo user profile
  let targetUser = profile;
  let targetProjects = projects;
  let targetExperience = experience;
  let targetEducation = education;
  let targetCertifications = certifications;
  let targetAchievements = achievements;
  let targetResume = resume;

  if (username !== profile?.username?.toLowerCase() && username !== "") {
    const found = DISCOVER_PROFILES.find(
      (p) => p.username.toLowerCase() === username,
    );

    if (found) {
      targetUser = {
        ...profile,
        ...found,
        bio: `${found.title} based in ${found.location}. ${found.tagline} Passionate about modern software architectures, creative technologies, and human-centric design.`,
        themeId:
          found.category === "Developers"
            ? "developer"
            : found.category === "Designers"
              ? "glass"
              : "aurora",
      };

      targetProjects = DEMO_PROJECTS.slice(0, 2);

      targetExperience = DEMO_EXPERIENCE.slice(0, 1);
    }
  }

  // Check if unlisted / 404
  if (!targetUser) {
    return (
      <div
        className="
          min-h-screen
          bg-surface-page
          text-primary
          flex
          flex-col
          items-center
          justify-center
          p-6
          text-center
          space-y-4
        "
      >
        <h1
          className="
            text-2xl
            font-bold
            text-primary
          "
        >
          Profile Not Found
        </h1>

        <p
          className="
            text-sm
            md:text-base
            text-secondary
          "
        >
          The OneMe identity @{username} does not exist or has been made
          private.
        </p>

        <Link
          href="/"
          className="
            inline-flex
            items-center
            gap-2
            px-4
            py-2
            rounded-xl
            bg-accent
            text-primary
            text-sm
            md:text-base
            font-semibold
          "
        >
          <FiHome
            className="
              w-4
              h-4
            "
          />

          <span>Return Home</span>
        </Link>
      </div>
    );
  }

  return (
    <div
      className="
        min-h-screen
        bg-surface-page
        text-primary
        selection:bg-accent-soft
        selection:text-primary
      "
    >
      {/* Subtle Floating Navigation Bar */}
      <div
        className="
          fixed
          top-4
          left-4
          z-40
        "
      >
        <Link
          href="/"
          className="
            flex
            justify-center
            items-center
            gap-2
            px-3
            py-1.5
            rounded-full
            bg-surface-dark/80
            hover:bg-surface-deep
            border
            border-light
            text-sm
            md:text-base
            font-medium
            text-secondary
            backdrop-blur-md
            transition-all
            duration-200
            ease-in-out
            shadow-lg
            hover:tracking-wider
            hover:gap-2.5
            active:scale-90
          "
        >
          <FiArrowLeft
            className="
              w-3.5
              h-3.5
              text-accent
            "
          />

          <span>OneMe</span>
        </Link>
      </div>

      <div
        className="
          fixed
          top-4
          right-4
          z-40
          flex
          items-center
          gap-2
        "
      >
        <Link
          href="/discover"
          className="
            flex
            items-center
            gap-1.5
            px-3
            py-1.5
            rounded-full
            bg-surface-dark/80
            hover:bg-surface-deep
            border
            border-light
            text-sm
            md:text-base
            font-medium
            text-secondary
            backdrop-blur-md
            transition-all
            duration-200
            ease-in-out
            shadow-lg
            hover:tracking-wider
            hover:gap-2.5
            active:scale-90
          "
        >
          <FiCompass
            className="
              w-3.5
              h-3.5
              text-accent
            "
          />

          <span
            className="
              hidden
              md:inline
            "
          >
            Discover
          </span>
        </Link>

        <Link
          href="/login"
          className="
            flex
            items-center
            gap-1.5
            px-3.5
            py-1.5
            rounded-full
            bg-accent
            hover:bg-accent
            text-sm
            md:text-base
            font-semibold
            text-primary
            shadow-lg
            glow-indigo
            backdrop-blur-md
            transition-all
            duration-200
            ease-in-out
            hover:tracking-wider
            hover:gap-2.5
            active:scale-90
          "
        >
          <FiZap
            className="
              w-3.5
              h-3.5
            "
          />

          <span>Claim OneMe</span>
        </Link>
      </div>

      {/* Main Public Profile View */}
      <main
        className="
          pt-8
          pb-16
        "
      >
        <PublicProfileView
          user={targetUser}
          projects={targetProjects}
          experience={targetExperience}
          education={targetEducation}
          certifications={targetCertifications}
          achievements={targetAchievements}
          resume={targetResume}
          themeId={targetUser.themeId}
          onOpenExchange={() => setExchangeOpen(true)}
          onOpenQr={() => setQrOpen(true)}
          onOpenShare={() => setShareOpen(true)}
          isLivePreview={false}
        />
      </main>

      {/* Interactive Modals */}
      <ExchangeModal
        isOpen={exchangeOpen}
        onClose={() => setExchangeOpen(false)}
        currentUser={targetUser}
      />

      <QrShareModal
        isOpen={qrOpen}
        onClose={() => setQrOpen(false)}
        user={targetUser}
      />

      <ShareModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        user={targetUser}
      />
    </div>
  );
}
