"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { copyToClipboard } from "@/libs/utils";
import { useToast } from "@/context/ToastContext";
import {
  FiCopy,
  FiCheck,
  FiShare2,
  FiLinkedin,
  FiTwitter,
  FiFacebook,
  FiMail,
} from "react-icons/fi";
import { FaWhatsapp, FaTelegram } from "react-icons/fa";

export function ShareModal({ isOpen, onClose, user }) {
  const [copied, setCopied] = useState(false);
  const { success } = useToast();

  const profileUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/@${user?.username || "ritesh"}`
      : `https://oneme.app/@${user?.username || "ritesh"}`;

  const shareTitle = `${user?.name || "Ritesh Sarkar"} on OneMe`;
  const shareText = `Check out ${user?.name}'s personal digital identity and portfolio on OneMe: ${profileUrl}`;

  const handleCopy = () => {
    copyToClipboard(profileUrl);
    setCopied(true);
    success("Profile link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: profileUrl,
        });
        success("Shared successfully!");
      } catch (err) {
        if (err.name !== "AbortError") {
          handleCopy();
        }
      }
    } else {
      handleCopy();
    }
  };

  const shareChannels = [
    {
      name: "WhatsApp",
      icon: FaWhatsapp,
      color: "hover:bg-success",
      url: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`,
    },
    {
      name: "LinkedIn",
      icon: FiLinkedin,
      color: "hover:bg-cyan",
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`,
    },
    {
      name: "X (Twitter)",
      icon: FiTwitter,
      color: "hover:bg-surface-50",
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
    },
    {
      name: "Facebook",
      icon: FiFacebook,
      color: "hover:bg-blue-600",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}`,
    },
    {
      name: "Telegram",
      icon: FaTelegram,
      color: "hover:bg-cyan",
      url: `https://t.me/share/url?url=${encodeURIComponent(profileUrl)}&text=${encodeURIComponent(shareTitle)}`,
    },
    {
      name: "Email",
      icon: FiMail,
      color: "hover:bg-warning",
      url: `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(shareText)}`,
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Share Digital Identity"
      description="Share this OneMe profile link across any social channel or device"
      maxWidth="max-w-md"
    >
      <div className="space-y-5 py-2">
        {/* URL Box */}
        <div className="flex items-center gap-2 p-2 rounded-xl bg-surface-dark border border-subtle">
          <input
            type="text"
            readOnly
            value={profileUrl}
            className="flex-1 bg-transparent px-2 text-xs font-mono text-secondary outline-none select-all"
          />
          <Button
            onClick={handleCopy}
            variant="primary"
            size="sm"
            icon={copied ? FiCheck : FiCopy}
            className="shrink-0"
          >
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>

        {/* Native Web Share Button (if supported) */}
        <Button
          onClick={handleNativeShare}
          variant="outline"
          size="md"
          icon={FiShare2}
          className="w-full justify-center"
        >
          Share via System Sheet
        </Button>

        {/* Channels Grid */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-secondary uppercase tracking-wider">
            Direct Channels
          </span>
          <div className="grid grid-cols-3 gap-2.5">
            {shareChannels.map((channel) => {
              const Icon = channel.icon;
              return (
                <a
                  key={channel.name}
                  href={channel.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border border-subtle bg-glass ${channel.color} hover:text-primary text-secondary transition-all duration-200 group`}
                >
                  <Icon className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-[11px] font-medium">
                    {channel.name}
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
}
