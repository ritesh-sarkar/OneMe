"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

// Custom Components and libs
import { PublicProfileView } from "@/components/PublicProfileView";
import { QrShareModal } from "@/components/QrShareModal";
import { ShareModal } from "@/components/ShareModal";
import { ExchangeModal } from "@/components/ExchangeModal";

// Icons
import { FiHome, FiCompass, FiZap, FiArrowLeft } from "react-icons/fi";

export default function DynamicPublicProfilePage() {
  const params = useParams();

  const rawUsername = params?.username;

  //TODO: replace with real data
  const username = (rawUsername || "").replace(/^@/, "").toLowerCase();

  const [publicProfile, setPublicProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState("");
  const [resolvedUsername, setResolvedUsername] = useState("");

  const [exchangeOpen, setExchangeOpen] = useState(false);

  const [qrOpen, setQrOpen] = useState(false);

  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    let active = true;

    fetch(`/api/profiles/${encodeURIComponent(username)}`, { cache: "no-store" })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Profile is unavailable.");
        if (active) {
          setPublicProfile(result);
          setProfileError("");
        }
      })
      .catch((error) => {
        if (active) setProfileError(error.message || "Profile is unavailable.");
      })
      .finally(() => {
        if (active) {
          setResolvedUsername(username);
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [username]);

  const isLoading = loading || resolvedUsername !== username;
  const targetUser = publicProfile?.user;
  const targetProjects = publicProfile?.projects || [];
  const targetExperience = publicProfile?.experience || [];
  const targetEducation = publicProfile?.education || [];
  const targetCertifications = publicProfile?.certifications || [];
  const targetAchievements = publicProfile?.achievements || [];
  const targetResume = publicProfile?.resume || null;

  const handleProfileClick = (event) => {
    const anchor = event.target.closest?.("a[href]");
    if (!anchor) return;

    const href = anchor.getAttribute("href") || "";
    let eventType = "link_click";
    let target = "Profile link";
    if (href.startsWith("mailto:")) {
      eventType = "contact_click";
      target = "Email";
    } else if (href.startsWith("tel:")) {
      eventType = "contact_click";
      target = "Phone";
    } else if (
      (targetResume?.fileUrl && href === targetResume.fileUrl) ||
      /resume|curriculum vitae|download/i.test(anchor.textContent || "")
    ) {
      eventType = "resume_download";
      target = "Resume";
    }

    fetch(`/api/profiles/${encodeURIComponent(targetUser.username)}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventType, target }),
      keepalive: true,
    }).catch((error) => {
      console.error("Unable to submit profile analytics event.", error);
    });
  };

  // Check if unlisted / 404
  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-page flex items-center justify-center">
        <p className="text-sm text-secondary animate-pulse">Loading OneMe profile...</p>
      </div>
    );
  }

  if (profileError || !targetUser) {
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
          {profileError ||
            `The OneMe identity @${username} does not exist or has been made private.`}
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
        onClick={handleProfileClick}
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
        initialUsername={targetUser.username}
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
