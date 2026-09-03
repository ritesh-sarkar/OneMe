"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FiExternalLink,
  FiCopy,
  FiCheck,
  FiBell,
  FiRadio,
  FiShare2,
  FiGrid,
  FiZap,
} from "react-icons/fi";
import { Button } from "@/components/ui/Button";
import { copyToClipboard } from "@/libs/utils";
import { useToast } from "@/context/ToastContext";
import { useProfile } from "@/context/ProfileContext";
import { NotificationCenter } from "./NotificationCenter";
import { QrShareModal } from "@/components/qr/QrShareModal";
import { ShareModal } from "@/components/profile/ShareModal";
import { ExchangeModal } from "@/components/exchange/ExchangeModal";

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
      ? `${window.location.origin}/@${profile?.username || "ritesh"}`
      : `https://oneme.app/@${profile?.username || "ritesh"}`;

  const handleCopyLink = () => {
    copyToClipboard(profileUrl);
    setCopied(true);
    success("Public profile URL copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <header className="sticky top-0 z-30 w-full border-b border-subtle bg-surface-page/80 backdrop-blur-xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Status & Live indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success-soft border border-light text-success text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span>Your OneMe is live</span>
          </div>

          <span className="hidden sm:inline text-xs text-muted font-mono">
            oneme.app/@{profile?.username || "ritesh"}
          </span>
        </div>

        {/* Right: Actions & Tools */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Copy Link */}
          <Button
            onClick={handleCopyLink}
            variant="outline"
            size="sm"
            icon={copied ? FiCheck : FiCopy}
            className="hidden sm:inline-flex text-xs"
          >
            {copied ? "Copied" : "Copy Link"}
          </Button>

          {/* Quick OneMe Flow Trigger */}
          <Button
            onClick={() => setExchangeOpen(true)}
            variant="glow"
            size="sm"
            icon={FiZap}
            className="text-xs glow-cyan"
          >
            <span>OneMe Flow</span>
          </Button>

          {/* QR Button */}
          <Button
            onClick={() => setQrOpen(true)}
            variant="outline"
            size="icon"
            title="Identity QR"
          >
            <FiGrid className="w-4 h-4" />
          </Button>

          {/* Share Button */}
          <Button
            onClick={() => setShareOpen(true)}
            variant="outline"
            size="icon"
            title="Share Profile"
          >
            <FiShare2 className="w-4 h-4" />
          </Button>

          {/* View Public Profile Link */}
          <Link
            href={`/@${profile?.username || "ritesh"}`}
            target="_blank"
            className="p-2 rounded-xl border border-subtle bg-surface-panel hover:bg-surface-panel text-secondary hover:text-primary transition-colors"
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
