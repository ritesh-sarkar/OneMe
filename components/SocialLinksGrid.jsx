"use client";

import React from "react";
import { motion } from "framer-motion";

//icons
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

//Custom Components and libs
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

  if (!socials || socials.length === 0) {
    return null;
  }

  return (
    <div
      className="
        space-y-3
      "
    >
      <h3
        className="
          text-base
          md:text-lg
          font-semibold
          uppercase
          tracking-wider
          text-secondary
        "
      >
        Connect & Socials
      </h3>

      <div
        className="
          grid
          grid-cols-1
          md:grid-cols-2
          gap-2.5
        "
      >
        {socials.map((soc) => {
          const Icon = ICON_MAP[soc.platform] || FiGlobe;

          return (
            <motion.a
              key={soc.id}
              href={soc.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{
                opacity: 0,
                y: 20,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                ease: "easeInOut",
                duration: 0.2,
                delay: 0,
              }}
              className={`
                  group
                  flex
                  items-center
                  justify-between
                  p-3.5
                  rounded-xl
                  border
                  border-subtle
                  bg-glass
                  backdrop-blur-md
                  transition-all
                  duration-200
                  ease-in-out
                  hover:bg-surface-panel/80
                  hover:border-light
                  hover:scale-102
                  active:scale-95
                  ${cardClass}
                `}
            >
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
                      p-2
                      rounded-lg
                      bg-glass-soft
                      text-accent
                      transition-all
                      duration-200
                      ease-in-out
                      group-hover:bg-accent
                      group-hover:text-primary
                      shrink-0
                    "
                >
                  <Icon
                    className="
                        w-4
                        h-4
                      "
                  />
                </div>

                <div
                  className="
                      min-w-0
                    "
                >
                  <div
                    className="
                        text-sm
                        md:text-base
                        font-medium
                        text-primary
                        group-hover:text-primary
                        truncate
                      "
                  >
                    {soc.label}
                  </div>

                  <div
                    className="
                        text-xs
                        md:text-sm
                        text-tertiary
                        truncate
                      "
                  >
                    {soc.handle || soc.url.replace(/^https?:\/\//, "")}
                  </div>
                </div>
              </div>

              <div
                className="
                    flex
                    items-center
                    gap-1.5
                    opacity-60
                    group-hover:opacity-100
                    transition-opacity
                  "
              >
                <button
                  type="button"
                  onClick={(e) => handleCopy(e, soc)}
                  className="
                      p-1.5
                      rounded-md
                      text-secondary
                      transition-colors
                      hover:bg-glass-soft
                      hover:text-primary
                      cursor-pointer
                    "
                  title="Copy link"
                >
                  {copiedId === soc.id ? (
                    <FiCheck
                      className="
                          w-3.5
                          h-3.5
                          text-success
                        "
                    />
                  ) : (
                    <FiCopy
                      className="
                          w-3.5
                          h-3.5
                        "
                    />
                  )}
                </button>

                <div
                  className="
                      p-1.5
                      text-muted
                      group-hover:text-accent
                    "
                >
                  <FiExternalLink
                    className="
                        w-3.5
                        h-3.5
                      "
                  />
                </div>
              </div>
            </motion.a>
          );
        })}
      </div>
    </div>
  );
}
