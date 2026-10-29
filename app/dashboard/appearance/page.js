'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  FiSliders,
  FiCheck,
  FiDroplet,
  FiType,
  FiLayers,
  FiSparkles,
} from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { THEMES, getThemeById } from '@/lib/themes';
import { useProfile } from '@/context/ProfileContext';
import { useTheme } from '@/context/ThemeContext';
import { useToast } from '@/context/ToastContext';
import { PublicProfileView } from '@/components/profile/PublicProfileView';

const COLOR_PRESETS = [
  { label: 'Electric Cyan', hex: '#00f2fe' },
  { label: 'Neon Magenta', hex: '#fe019a' },
  { label: 'Arctic Sky', hex: '#38bdf8' },
  { label: 'Radioactive Lime', hex: '#a3e635' },
  { label: 'Royal Emerald', hex: '#10b981' },
  { label: 'Metallic Gold', hex: '#facc15' },
  { label: 'Cosmic Violet', hex: '#c084fc' },
  { label: 'Sunset Peach', hex: '#ff6b6b' },
  { label: 'Pure White', hex: '#ffffff' },
];

export default function AppearancePage() {
  const { profile, projects, experience, education, certifications, achievements, resume, updateProfile } = useProfile();
  const { currentThemeId, setTheme, customOptions, updateCustomOptions } = useTheme();
  const { success } = useToast();

  const selectedThemeId = profile.themeId || currentThemeId || 'cyberpunk';
  const activeCustomTheme = profile.customTheme || {};

  const handleSelectTheme = (themeId) => {
    const themeObj = getThemeById(themeId);
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
    updateCustomOptions({ accentColor: colorHex });
    updateProfile({
      customTheme: {
        ...activeCustomTheme,
        accentColor: colorHex,
      },
    });
    success('Accent color token updated.');
  };

  const handleFontFamily = (fontFamily) => {
    updateCustomOptions({ fontFamily });
    updateProfile({
      customTheme: {
        ...activeCustomTheme,
        fontFamily,
      },
    });
    success('Typography updated.');
  };

  const handleCardStyle = (cardStyle) => {
    updateCustomOptions({ cardStyle });
    updateProfile({
      customTheme: {
        ...activeCustomTheme,
        cardStyle,
      },
    });
    success(`Card layer style set to ${cardStyle}.`);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-primary tracking-tight">
            Theme & Appearance Studio
          </h1>
          <p className="text-xs sm:text-sm text-secondary">
            Select an aesthetic preset or customize bespoke visual tokens with real-time live preview.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Theme Pickers and Custom Controls */}
        <div className="lg:col-span-7 space-y-6">
          {/* Preset Themes Grid */}
          <div className="p-6 sm:p-8 rounded-3xl bg-glass border border-subtle backdrop-blur-xl shadow-xl space-y-5">
            <h3 className="text-sm font-bold text-primary border-b border-subtle pb-3 flex items-center gap-2">
              <FiSliders className="w-4 h-4 text-cyan" />
              <span>Readymade Preset Themes ({THEMES.length})</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {THEMES.map((theme) => {
                const isSelected = selectedThemeId === theme.id;
                return (
                  <motion.div
                    key={theme.id}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelectTheme(theme.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                      isSelected
                        ? 'bg-surface-panel/90 border-cyan shadow-lg glow-cyan'
                        : 'bg-surface-dark/70 border-subtle hover:border-light'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-4 h-4 rounded-full border border-white/20 shrink-0"
                          style={{ backgroundColor: theme.accentColor }}
                        />
                        <h4 className="text-xs font-bold text-primary">{theme.name}</h4>
                      </div>
                      {isSelected && (
                        <span className="p-1 rounded-full bg-cyan text-surface-dark">
                          <FiCheck className="w-3 h-3" />
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-secondary leading-snug">
                      {theme.tagline}
                    </p>

                    <div
                      className={`w-full h-1.5 rounded-full bg-gradient-to-r ${theme.previewGradient} opacity-90`}
                    />
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Custom Visual Tokens Controls */}
          <div className="p-6 sm:p-8 rounded-3xl bg-glass border border-subtle backdrop-blur-xl shadow-xl space-y-6">
            <h3 className="text-sm font-bold text-primary border-b border-subtle pb-3 flex items-center gap-2">
              <FiDroplet className="w-4 h-4 text-accent" />
              <span>Accent Color Token</span>
            </h3>

            <div className="flex flex-wrap gap-2.5">
              {COLOR_PRESETS.map((color) => {
                const isCurrent = activeCustomTheme.accentColor === color.hex;
                return (
                  <button
                    key={color.hex}
                    type="button"
                    onClick={() => handleCustomColor(color.hex)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all text-xs font-medium ${
                      isCurrent
                        ? 'bg-surface-panel border-white text-primary shadow-md'
                        : 'bg-surface-dark border-subtle hover:border-light text-secondary'
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-white/20"
                      style={{ backgroundColor: color.hex }}
                    />
                    <span>{color.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="space-y-3 pt-2">
              <label className="text-xs font-semibold text-secondary flex items-center gap-2">
                <FiType className="w-4 h-4 text-cyan" />
                <span>Typography Style</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Modern Sans', value: 'font-sans' },
                  { label: 'Developer Mono', value: 'font-mono' },
                  { label: 'Editorial Serif', value: 'font-serif' },
                ].map((f) => {
                  const isCurrent = activeCustomTheme.fontFamily === f.value;
                  return (
                    <button
                      key={f.value}
                      type="button"
                      onClick={() => handleFontFamily(f.value)}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                        isCurrent
                          ? 'bg-accent border-accent text-primary shadow-md'
                          : 'bg-surface-dark border-subtle hover:border-accent text-primary'
                      }`}
                    >
                      {f.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <label className="text-xs font-semibold text-secondary flex items-center gap-2">
                <FiLayers className="w-4 h-4 text-success" />
                <span>Card Layer Style</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Glassmorphism', value: 'glass' },
                  { label: 'Solid Charcoal', value: 'solid' },
                  { label: 'Minimal Outline', value: 'minimal' },
                ].map((style) => {
                  const isCurrent = activeCustomTheme.cardStyle === style.value;
                  return (
                    <button
                      key={style.value}
                      type="button"
                      onClick={() => handleCardStyle(style.value)}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                        isCurrent
                          ? 'bg-accent border-accent text-primary shadow-md'
                          : 'bg-surface-dark border-subtle hover:border-accent text-primary'
                      }`}
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
        <div className="lg:col-span-5 space-y-3 sticky top-24">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-secondary font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              Live Theme Preview
            </span>
          </div>

          <div className="rounded-[32px] p-3 bg-surface-dark border border-subtle shadow-2xl">
            <div className="h-[620px] overflow-y-auto rounded-[22px] bg-surface-dark border border-subtle scrollbar-none shadow-inner">
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
