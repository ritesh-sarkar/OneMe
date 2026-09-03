"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  FiGithub,
  FiLinkedin,
  FiTwitter,
  FiFacebook,
  FiInstagram,
  FiGlobe,
  FiExternalLink,
  FiCopy,
  FiCheck,
} from "react-icons/fi";
import { FaWhatsapp, FaTelegram, FaDiscord, FaYoutube } from "react-icons/fa";
import { copyToClipboard } from "@/libs/utils";
import { useToast } from "@/context/ToastContext";

const ICON_MAP = {
  github: FiGithub,
  linkedin: FiLinkedin,
  x: FiTwitter,
  twitter: FiTwitter,
  facebook: FiFacebook,
  instagram: FiInstagram,
  whatsapp: FaWhatsapp,
  telegram: FaTelegram,
  discord: FaDiscord,
  youtube: FaYoutube,
  website: FiGlobe,
};

export function SocialLinksGrid({ socials = [], cardClass = "" }) {
  const { success } = useToast();
  const [copiedId, setCopiedId] = React.useState(null);

  const handleCopy = (e, soc) => {
    e.preventDefault();
    e.stopPropagation();
    copyToClipboard(soc.url);
    setCopiedId(soc.id);
    success(`Copied ${soc.label} link to clipboard!`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!socials || socials.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-secondary">
        Connect & Socials
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {socials.map((soc) => {
          const Icon = ICON_MAP[soc.platform] || FiGlobe;
          return (
            <motion.a
              key={soc.id}
              href={soc.url}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              className={`group flex items-center justify-between p-3.5 rounded-xl border border-subtle bg-glass hover:bg-surface-panel/80 hover:border-light transition-all duration-200 backdrop-blur-md ${cardClass}`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg bg-glass-soft text-accent group-hover:bg-accent group-hover:text-primary transition-colors duration-200 shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-primary group-hover:text-primary truncate">
                    {soc.label}
                  </div>
                  <div className="text-xs text-muted truncate">
                    {soc.handle || soc.url.replace(/^https?:\/\//, "")}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={(e) => handleCopy(e, soc)}
                  className="p-1.5 rounded-md hover:bg-glass-soft text-secondary hover:text-primary transition-colors"
                  title="Copy link"
                >
                  {copiedId === soc.id ? (
                    <FiCheck className="w-3.5 h-3.5 text-success" />
                  ) : (
                    <FiCopy className="w-3.5 h-3.5" />
                  )}
                </button>
                <div className="p-1.5 text-muted group-hover:text-accent">
                  <FiExternalLink className="w-3.5 h-3.5" />
                </div>
              </div>
            </motion.a>
          );
        })}
      </div>
    </div>
  );
}
