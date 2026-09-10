"use client";

import React, { useState } from "react";
import Link from "next/link";

//icons
import {
  FiExternalLink,
  FiCopy,
  FiCheck,
  FiRadio,
  FiShare2,
  FiGrid,
  FiZap,
} from "react-icons/fi";

//Custom Components and libs
import { Button } from "@/components/Button";
import { copyToClipboard } from "@/libs/utils";
import { useToast } from "@/context/ToastContext";
import { useProfile } from "@/context/ProfileContext";
import { NotificationCenter } from "@/components/NotificationCenter";
import { QrShareModal } from "@/components/QrShareModal";
import { ShareModal } from "@/components/ShareModal";
import { ExchangeModal } from "@/components/ExchangeModal";

export function Topbar() {
  const { profile } = useProfile();

  const { success } = useToast();

  const [copied, setCopied] = useState(false);

  const [notifOpen, setNotifOpen] = useState(false);

  const [qrOpen, setQrOpen] = useState(false);

  const [shareOpen, setShareOpen] = useState(false);

  const [exchangeOpen, setExchangeOpen] = useState(false);

  const profileUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/@${
          profile?.username || "ritesh"
        }`
      : `https://oneme.app/@${
          profile?.username || "ritesh"
        }`;

  const handleCopyLink = () => {
    copyToClipboard(profileUrl);

    setCopied(true);

    success("Public profile URL copied to clipboard!");

    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <header
        className="
          sticky
          top-0
          z-30
          w-full
          border-b
          border-subtle
          bg-surface-page/80
          backdrop-blur-xl
          px-4
          sm:px-6
          lg:px-8
          h-16
          flex
          items-center
          justify-between
          gap-4
        "
      >
        {/* Left: Status & Live indicator */}

        <div
          className="
            flex
            items-center
            gap-3
            min-w-0
          "
        >
          <div
            className="
              flex
              items-center
              gap-2
              px-3
              py-1.5
              rounded-full
              bg-success-soft
              border
              border-light
              text-success
              text-sm
              md:text-base
              font-mono
              whitespace-nowrap
            "
          >
            <span
              className="
                w-2
                h-2
                rounded-full
                bg-success
                animate-pulse
                shrink-0
              "
            />

            <span>
              Your OneMe is live
            </span>
          </div>

          <span
            className="
              hidden
              sm:inline
              text-sm
              md:text-base
              text-tertiary
              font-mono
              truncate
            "
          >
            oneme.app/@{profile?.username || "ritesh"}
          </span>
        </div>

        {/* Right: Actions & Tools */}

        <div
          className="
            flex
            items-center
            gap-2
            sm:gap-3
            shrink-0
          "
        >
          {/* Quick Copy Link */}

          <Button
            onClick={handleCopyLink}
            variant="outline"
            size="sm"
            icon={copied ? FiCheck : FiCopy}
            className="
              hidden
              sm:inline-flex
              text-sm
              md:text-base
              transition-all
              duration-200
              ease-in-out
              hover:scale-105
              active:scale-95
            "
          >
            {copied ? "Copied" : "Copy Link"}
          </Button>

          {/* Quick OneMe Flow Trigger */}

          <Button
            onClick={() => setExchangeOpen(true)}
            variant="glow"
            size="sm"
            icon={FiZap}
            className="
              text-sm
              md:text-base
              glow-cyan
              transition-all
              duration-200
              ease-in-out
              hover:scale-105
              active:scale-95
            "
          >
            <span>
              OneMe Flow
            </span>
          </Button>

          {/* QR Button */}

          <Button
            onClick={() => setQrOpen(true)}
            variant="outline"
            size="icon"
            title="Identity QR"
            className="
              transition-all
              duration-200
              ease-in-out
              hover:scale-105
              active:scale-95
            "
          >
            <FiGrid className="w-4 h-4" />
          </Button>

          {/* Share Button */}

          <Button
            onClick={() => setShareOpen(true)}
            variant="outline"
            size="icon"
            title="Share Profile"
            className="
              transition-all
              duration-200
              ease-in-out
              hover:scale-105
              active:scale-95
            "
          >
            <FiShare2 className="w-4 h-4" />
          </Button>

          {/* View Public Profile Link */}

          <Link
            href={`/@${profile?.username || "ritesh"}`}
            target="_blank"
            className="
              p-2
              rounded-xl
              border
              border-subtle
              bg-surface-panel
              hover:bg-surface-panel
              text-secondary
              hover:text-text-primary
              transition-all
              duration-200
              ease-in-out
              hover:scale-105
              active:scale-95
            "
            title="Open Public Profile"
          >
            <FiExternalLink className="w-4 h-4" />
          </Link>

          {/* Notification Center Popover */}

          <NotificationCenter />
        </div>
      </header>

      {/* Modals */}

      <QrShareModal
        isOpen={qrOpen}
        onClose={() => setQrOpen(false)}
        user={profile}
      />

      <ShareModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        user={profile}
      />

      <ExchangeModal
        isOpen={exchangeOpen}
        onClose={() => setExchangeOpen(false)}
        currentUser={profile}
      />
    </>
  );
}