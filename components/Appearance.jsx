
"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  FiSliders,
  FiCheck,
  FiDroplet,
  FiType,
  FiLayers,
} from "react-icons/fi";

// Custom Components and libs
import { THEMES, getThemeById } from "@/libs/themes";

// Contexts
import { useProfile } from "@/context/ProfileContext";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/ToastContext";

// Custom Components
import { PublicProfileView } from "@/components/PublicProfileView";

const COLOR_PRESETS = [
  {
    label: "Electric Cyan",
    hex: "#00f2fe",
  },
  {
    label: "Neon Magenta",
    hex: "#fe019a",
  },
  {
    label: "Arctic Sky",
    hex: "#38bdf8",
  },
  {
    label: "Radioactive Lime",
    hex: "#a3e635",
  },
  {
    label: "Royal Emerald",
    hex: "#10b981",
  },
  {
    label: "Metallic Gold",
    hex: "#facc15",
  },
  {
    label: "Cosmic Violet",
    hex: "#c084fc",
  },
  {
    label: "Sunset Peach",
    hex: "#ff6b6b",
  },
  {
    label: "Pure White",
    hex: "#ffffff",
  },
];

const FONT_OPTIONS = [
  {
    label: "Modern Sans",
    value: "font-sans",
  },
  {
    label: "Developer Mono",
    value: "font-mono",
  },
  {
    label: "Editorial Serif",
    value: "font-serif",
  },
];

const CARD_STYLE_OPTIONS = [
  {
    label: "Glassmorphism",
    value: "glass",
  },
  {
    label: "Solid Charcoal",
    value: "solid",
  },
  {
    label: "Minimal Outline",
    value: "minimal",
  },
];

export default function AppearancePage() {
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

  const {
    currentThemeId,
    setTheme,
    updateCustomOptions,
  } = useTheme();

  const { success } = useToast();

  const selectedThemeId =
    profile.themeId ||
    currentThemeId ||
    "cyberpunk";

  const activeCustomTheme =
    profile.customTheme || {};

  const handleSelectTheme = (themeId) => {
    const themeObj = getThemeById(themeId);

    if (!themeObj) {
      return;
    }

    updateProfile({
      themeId,
      customTheme: {
        ...activeCustomTheme,
        accentColor: themeObj.accentColor,
        fontFamily: themeObj.fontFamily,
      },
    });

    setTheme(themeId);

    success(`Applied "${themeObj.name}" theme!`);
  };

  const handleCustomColor = (colorHex) => {
    updateCustomOptions({
      accentColor: colorHex,
    });

    updateProfile({
      customTheme: {
        ...activeCustomTheme,
        accentColor: colorHex,
      },
    });

    success("Accent color token updated.");
  };

  const handleFontFamily = (fontFamily) => {
    updateCustomOptions({
      fontFamily,
    });

    updateProfile({
      customTheme: {
        ...activeCustomTheme,
        fontFamily,
      },
    });

    success("Typography updated.");
  };

  const handleCardStyle = (cardStyle) => {
    updateCustomOptions({
      cardStyle,
    });

    updateProfile({
      customTheme: {
        ...activeCustomTheme,
        cardStyle,
      },
    });

    success(`Card layer style set to ${cardStyle}.`);
  };

  return (
    <div
      className="
        space-y-8
      "
    >
      {/* Header */}
      <div
        className="
          flex
          flex-col
          md:flex-row
          md:items-center
          justify-between
          gap-4
        "
      >
        <div
          className="
            space-y-1
          "
        >
          <h1
            className="
              text-2xl
              md:text-3xl
              font-black
              text-text-primary
              tracking-tight
            "
          >
            Theme & Appearance Studio
          </h1>

          <p
            className="
              text-sm
              md:text-base
              text-secondary
            "
          >
            Select an aesthetic preset or customize bespoke visual tokens
            with real-time live preview.
          </p>
        </div>
      </div>

      <div
        className="
          grid
          grid-cols-1
          lg:grid-cols-12
          gap-8
          items-start
        "
      >
        {/* Left: Theme Pickers and Custom Controls */}
        <div
          className="
            lg:col-span-7
            space-y-6
          "
        >
          {/* Preset Themes Grid */}
          <div
            className="
              p-6
              md:p-8
              rounded-3xl
              bg-glass
              border
              border-subtle
              backdrop-blur-xl
              shadow-xl
              space-y-5
            "
          >
            <h3
              className="
                text-base
                md:text-lg
                font-bold
                text-text-primary
                border-b
                border-subtle
                pb-3
                flex
                items-center
                gap-2
              "
            >
              <FiSliders
                className="
                  w-4
                  h-4
                  text-cyan
                  shrink-0
                "
              />

              <span>
                Readymade Preset Themes ({THEMES.length})
              </span>
            </h3>

            <div
              className="
                grid
                grid-cols-1
                md:grid-cols-2
                gap-3.5
              "
            >
              {THEMES.map((theme) => {
                const isSelected =
                  selectedThemeId === theme.id;

                return (
                  <motion.div
                    key={theme.id}
                    whileHover={{
                      y: -2,
                    }}
                    whileTap={{
                      scale: 0.98,
                    }}
                    onClick={() =>
                      handleSelectTheme(theme.id)
                    }
                    className={`
                      p-4
                      rounded-2xl
                      border
                      transition-all
                      duration-200
                      ease-in-out
                      cursor-pointer
                      flex
                      flex-col
                      justify-between
                      space-y-3
                      ${
                        isSelected
                          ? "bg-surface-panel/90 border-cyan shadow-lg glow-cyan"
                          : "bg-surface-dark/70 border-subtle hover:border-light"
                      }
                    `}
                  >
                    <div
                      className="
                        flex
                        items-start
                        justify-between
                        gap-2
                      "
                    >
                      <div
                        className="
                          flex
                          items-center
                          gap-2.5
                          min-w-0
                        "
                      >
                        <span
                          className="
                            w-4
                            h-4
                            rounded-full
                            border
                            border-white/20
                            shrink-0
                          "
                          style={{
                            backgroundColor: theme.accentColor,
                          }}
                        />

                        <h4
                          className="
                            text-sm
                            md:text-base
                            font-bold
                            text-text-primary
                          "
                        >
                          {theme.name}
                        </h4>
                      </div>

                      {isSelected && (
                        <span
                          className="
                            p-1
                            rounded-full
                            bg-cyan
                            text-surface-dark
                            shrink-0
                          "
                        >
                          <FiCheck
                            className="
                              w-3
                              h-3
                            "
                          />
                        </span>
                      )}
                    </div>

                    <p
                      className="
                        text-sm
                        md:text-base
                        text-secondary
                        leading-snug
                      "
                    >
                      {theme.tagline}
                    </p>

                    <div
                      className={`
                        w-full
                        h-1.5
                        rounded-full
                        bg-linear-to-r
                        ${theme.previewGradient}
                        opacity-90
                      `}
                    />
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Custom Visual Tokens Controls */}
          <div
            className="
              p-6
              md:p-8
              rounded-3xl
              bg-glass
              border
              border-subtle
              backdrop-blur-xl
              shadow-xl
              space-y-6
            "
          >
            {/* Accent Color */}
            <h3
              className="
                text-base
                md:text-lg
                font-bold
                text-text-primary
                border-b
                border-subtle
                pb-3
                flex
                items-center
                gap-2
              "
            >
              <FiDroplet
                className="
                  w-4
                  h-4
                  text-accent
                  shrink-0
                "
              />

              <span>
                Accent Color Token
              </span>
            </h3>

            <div
              className="
                flex
                flex-wrap
                gap-2.5
              "
            >
              {COLOR_PRESETS.map((color) => {
                const isCurrent =
                  activeCustomTheme.accentColor === color.hex;

                return (
                  <button
                    key={color.hex}
                    type="button"
                    onClick={() =>
                      handleCustomColor(color.hex)
                    }
                    className={`
                      flex
                      items-center
                      gap-2
                      px-3
                      py-2
                      rounded-xl
                      border
                      transition-all
                      duration-200
                      ease-in-out
                      hover:scale-105
                      active:scale-95
                      text-sm
                      md:text-base
                      font-medium
                      ${
                        isCurrent
                          ? "bg-surface-panel border-white text-text-primary shadow-md"
                          : "bg-surface-dark border-subtle hover:border-light text-secondary"
                      }
                    `}
                  >
                    <span
                      className="
                        w-3.5
                        h-3.5
                        rounded-full
                        border
                        border-white/20
                        shrink-0
                      "
                      style={{
                        backgroundColor: color.hex,
                      }}
                    />

                    <span>
                      {color.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Typography */}
            <div
              className="
                space-y-3
                pt-2
              "
            >
              <label
                className="
                  text-sm
                  md:text-base
                  font-semibold
                  text-secondary
                  flex
                  items-center
                  gap-2
                "
              >
                <FiType
                  className="
                    w-4
                    h-4
                    text-cyan
                    shrink-0
                  "
                />

                <span>
                  Typography Style
                </span>
              </label>

              <div
                className="
                  grid
                  grid-cols-1
                  sm:grid-cols-3
                  gap-3
                "
              >
                {FONT_OPTIONS.map((font) => {
                  const isCurrent =
                    activeCustomTheme.fontFamily === font.value;

                  return (
                    <button
                      key={font.value}
                      type="button"
                      onClick={() =>
                        handleFontFamily(font.value)
                      }
                      className={`
                        py-2.5
                        px-3
                        rounded-xl
                        border
                        text-sm
                        md:text-base
                        font-semibold
                        transition-all
                        duration-200
                        ease-in-out
                        hover:scale-105
                        active:scale-95
                        ${
                          isCurrent
                            ? "bg-accent border-accent text-text-primary shadow-md"
                            : "bg-surface-dark border-subtle hover:border-accent text-text-primary"
                        }
                      `}
                    >
                      {font.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Card Layer Style */}
            <div
              className="
                space-y-3
                pt-2
              "
            >
              <label
                className="
                  text-sm
                  md:text-base
                  font-semibold
                  text-secondary
                  flex
                  items-center
                  gap-2
                "
              >
                <FiLayers
                  className="
                    w-4
                    h-4
                    text-success
                    shrink-0
                  "
                />

                <span>
                  Card Layer Style
                </span>
              </label>

              <div
                className="
                  grid
                  grid-cols-1
                  sm:grid-cols-3
                  gap-3
                "
              >
                {CARD_STYLE_OPTIONS.map((style) => {
                  const isCurrent =
                    activeCustomTheme.cardStyle === style.value;

                  return (
                    <button
                      key={style.value}
                      type="button"
                      onClick={() =>
                        handleCardStyle(style.value)
                      }
                      className={`
                        py-2.5
                        px-3
                        rounded-xl
                        border
                        text-sm
                        md:text-base
                        font-semibold
                        transition-all
                        duration-200
                        ease-in-out
                        hover:scale-105
                        active:scale-95
                        ${
                          isCurrent
                            ? "bg-accent border-accent text-text-primary shadow-md"
                            : "bg-surface-dark border-subtle hover:border-accent text-text-primary"
                        }
                      `}
                    >
                      {style.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Live Identity Preview */}
        <div
          className="
            lg:col-span-5
            space-y-3
            lg:sticky
            lg:top-24
          "
        >
          <div
            className="
              flex
              items-center
              justify-between
              px-1
            "
          >
            <span
              className="
                text-xs
                md:text-sm
                font-bold
                uppercase
                tracking-wider
                text-tertiary
                font-mono
                flex
                items-center
                gap-1.5
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

              Live Theme Preview
            </span>
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
                user={profile}
                projects={projects}
                experience={experience}
                education={education}
                certifications={certifications}
                achievements={achievements}
                resume={resume}
                themeId={selectedThemeId}
                isLivePreview={true}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
