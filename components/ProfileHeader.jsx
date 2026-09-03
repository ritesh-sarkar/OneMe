"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  FiMapPin,
  FiCheckCircle,
  FiDownload,
  FiShare2,
  FiGrid,
  FiZap,
} from "react-icons/fi";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { downloadVCard } from "@/libs/vcard";
import { useToast } from "@/context/ToastContext";

export function ProfileHeader({
  user,
  theme,
  onOpenExchange,
  onOpenQr,
  onOpenShare,
  isLivePreview = false,
}) {
  const { success } = useToast();

  const handleSaveContact = () => {
    downloadVCard(user);
    success("Contact downloaded as vCard (.vcf)", "Contact Saved");
  };

  const accentColor =
    user?.customTheme?.accentColor || theme?.accentColor || "#00f2fe";

  return (
    <div className="relative flex flex-col items-center text-center">
      {/* Banner */}
      <div className="w-full h-32 sm:h-44 rounded-2xl overflow-hidden relative mb-[-44px] sm:mb-[-50px] border border-light shadow-inner bg-surface-dark">
        {user?.banner ? (
          <img
            src={user.banner}
            alt="Profile Banner"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full gradient-bg-primary" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      </div>

      {/* Avatar Container */}
      <div className="relative group z-10">
        <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full p-1 bg-surface-dark/90 backdrop-blur-md border-2 border-white/20 shadow-2xl overflow-hidden">
          <img
            src={
              user?.avatar ||
              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600"
            }
            alt={user?.name || "Avatar"}
            className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        {user?.isVerified && (
          <div
            className="absolute bottom-1 right-1 p-1 sm:p-1.5 rounded-full text-primary shadow-lg border-2 border-subtle"
            style={{ backgroundColor: accentColor }}
            title="Verified OneMe Identity"
          >
            <FiCheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-surface-dark" />
          </div>
        )}
      </div>

      {/* Name and Handle */}
      <div className="mt-3 sm:mt-4 space-y-1">
        <div className="flex items-center justify-center gap-2">
          <h1 className="text-xl sm:text-3xl font-bold tracking-tight text-primary">
            {user?.name || "Ritesh Sarkar"}
          </h1>
        </div>
        <p
          className="text-xs sm:text-sm font-medium"
          style={{ color: accentColor }}
        >
          @{user?.username || "ritesh"}
        </p>
      </div>

      {/* Title & Tagline */}
      <div className="mt-1.5 max-w-lg space-y-1 px-2">
        <h2 className="text-xs sm:text-base font-semibold text-primary">
          {user?.title || "Full-Stack Developer"}
        </h2>
        {user?.tagline && (
          <p className="text-[11px] sm:text-xs text-secondary italic">
            &ldquo;{user.tagline}&rdquo;
          </p>
        )}
      </div>

      {/* Metadata Badges */}
      <div className="mt-2.5 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
        {user?.privacy?.showLocation !== false && user?.location && (
          <Badge
            variant="outline"
            size="sm"
            className="gap-1 text-secondary bg-glass text-[10px] sm:text-xs"
          >
            <FiMapPin className="w-3 h-3 text-danger" />
            {user.location}
          </Badge>
        )}
        {user?.status && (
          <Badge
            variant="success"
            size="sm"
            className="gap-1.5 text-[10px] sm:text-xs"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            {user.status}
          </Badge>
        )}
      </div>

      {/* Primary Action Buttons */}
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2 w-full max-w-md">
        <Button
          onClick={handleSaveContact}
          variant="primary"
          size="sm"
          icon={FiDownload}
          className="flex-1 font-medium text-xs py-2"
        >
          Save Contact
        </Button>

        {onOpenExchange && (
          <Button
            onClick={onOpenExchange}
            variant="glow"
            size="sm"
            icon={FiZap}
            className="flex-1 text-xs py-2"
          >
            OneMe Flow
          </Button>
        )}

        <div className="flex items-center gap-1.5">
          {onOpenQr && (
            <Button
              onClick={onOpenQr}
              variant="outline"
              size="icon"
              title="Show QR Code"
              aria-label="QR Code"
              className="p-2"
            >
              <FiGrid className="w-4 h-4" />
            </Button>
          )}

          {onOpenShare && (
            <Button
              onClick={onOpenShare}
              variant="outline"
              size="icon"
              title="Share Profile"
              aria-label="Share"
              className="p-2"
            >
              <FiShare2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
