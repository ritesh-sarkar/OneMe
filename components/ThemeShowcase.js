"use client";

import React, { useState } from "react";
import { THEMES } from "@/libs/themes";
import { DEMO_USER, DEMO_PROJECTS, DEMO_EXPERIENCE } from "@/libs/mock-data";
import { PublicProfileView } from "@/components/profile/PublicProfileView";
import { FiSliders, FiCheck } from "react-icons/fi";

export function ThemeShowcase() {
  const [selectedThemeId, setSelectedThemeId] = useState("cyberpunk");

  return (
    <section
      id="themes"
      className="py-24 border-t border-subtle bg-surface-dark/60 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
          <span className="text-xs font-semibold uppercase tracking-wider text-cyan font-mono">
            Aesthetic Freedom
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-primary tracking-tight">
            Curated Themes for Every Persona
          </h2>
          <p className="text-sm sm:text-base text-secondary">
            Click on any readymade style below to preview how your OneMe
            identity adapts instantly.
          </p>
        </div>

        {/* Theme Selector Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-4xl mx-auto mb-12">
          {THEMES.map((theme) => {
            const isSelected = selectedThemeId === theme.id;
            return (
              <button
                key={theme.id}
                onClick={() => setSelectedThemeId(theme.id)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  isSelected
                    ? "bg-surface-panel border-cyan text-primary shadow-lg glow-cyan scale-105"
                    : "bg-glass border-subtle text-secondary hover:text-primary hover:bg-surface-panel/60"
                }`}
              >
                <span
                  className="w-3.5 h-3.5 rounded-full shrink-0 border border-white/20"
                  style={{ backgroundColor: theme.accentColor }}
                />
                <span>{theme.name}</span>
                {isSelected && <FiCheck className="w-3.5 h-3.5 text-cyan" />}
              </button>
            );
          })}
        </div>

        {/* Morphing Mini Profile Live Stage */}
        <div className="max-w-lg mx-auto rounded-3xl p-3 bg-surface-dark border border-subtle shadow-2xl overflow-hidden">
          <div className="h-[480px] overflow-y-auto rounded-2xl border border-subtle scrollbar-none transition-all duration-300">
            <PublicProfileView
              user={DEMO_USER}
              projects={DEMO_PROJECTS.slice(0, 2)}
              experience={DEMO_EXPERIENCE.slice(0, 1)}
              themeId={selectedThemeId}
              isLivePreview={true}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
