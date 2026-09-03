"use client";

import React from "react";
import { motion } from "framer-motion";
import { getThemeById } from "@/libs/themes";
import { ProfileHeader } from "./ProfileHeader";
import { SocialLinksGrid } from "./SocialLinksGrid";
import { ProjectsGrid } from "./ProjectsGrid";
import { SkillsSection } from "./SkillsSection";
import { ExperienceTimeline } from "./ExperienceTimeline";
import { EducationSection } from "./EducationSection";
import { CertificationsSection } from "./CertificationsSection";
import { AchievementsSection } from "./AchievementsSection";
import { ResumeViewer } from "./ResumeViewer";
import { CustomCtaBanner } from "./CustomCtaBanner";
import { FiMail, FiPhone, FiMapPin, FiShield, FiHeart } from "react-icons/fi";

export function PublicProfileView({
  user,
  projects = [],
  experience = [],
  education = [],
  certifications = [],
  achievements = [],
  resume = null,
  themeId = null,
  onOpenExchange,
  onOpenQr,
  onOpenShare,
  isLivePreview = false,
  className = "",
}) {
  const activeThemeId = themeId || user?.themeId || "cyberpunk";
  const theme = getThemeById(activeThemeId);

  // Allow custom theme overrides (custom color, font, card style)
  const customFont = user?.customTheme?.fontFamily || theme.fontFamily;
  const customAccent = user?.customTheme?.accentColor || theme.accentColor;
  const customCardStyle = user?.customTheme?.cardStyle;

  let computedCardClass = theme.cardClass;
  if (customCardStyle === "solid") {
    computedCardClass = "bg-surface-secondary border border-subtle shadow-md";
  } else if (customCardStyle === "minimal") {
    computedCardClass = "bg-surface-dark/40 border border-subtle shadow-none";
  } else if (customCardStyle === "glass") {
    computedCardClass =
      "bg-white/[0.04] border border-light backdrop-blur-xl shadow-xl";
  }

  const sectionVisibility = user?.sectionVisibility || {
    about: true,
    cta: true,
    socials: true,
    projects: true,
    skills: true,
    experience: true,
    education: true,
    certifications: true,
    achievements: true,
    resume: true,
    contact: true,
  };

  const sectionOrder = user?.sectionOrder || [
    "about",
    "cta",
    "socials",
    "projects",
    "skills",
    "experience",
    "education",
    "certifications",
    "achievements",
    "resume",
    "contact",
  ];

  // Render individual sections
  const renderSection = (key) => {
    if (!sectionVisibility[key]) return null;

    switch (key) {
      case "about":
        return user?.bio ? (
          <div key="about" className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-secondary">
              About
            </h3>
            <div
              className={`p-4 sm:p-5 rounded-2xl border ${computedCardClass}`}
            >
              <p className="text-xs sm:text-sm text-secondary leading-relaxed whitespace-pre-line">
                {user.bio}
              </p>
            </div>
          </div>
        ) : null;

      case "cta":
        return (
          <CustomCtaBanner
            key="cta"
            cta={user?.customCta}
            cardClass={computedCardClass}
          />
        );

      case "socials":
        return (
          <SocialLinksGrid
            key="socials"
            socials={user?.socials}
            cardClass={computedCardClass}
          />
        );

      case "projects":
        return (
          <ProjectsGrid
            key="projects"
            projects={projects}
            cardClass={computedCardClass}
          />
        );

      case "skills":
        return (
          <SkillsSection
            key="skills"
            skills={user?.skills}
            cardClass={computedCardClass}
          />
        );

      case "experience":
        return (
          <ExperienceTimeline
            key="experience"
            experience={experience}
            cardClass={computedCardClass}
          />
        );

      case "education":
        return (
          <EducationSection
            key="education"
            education={education}
            cardClass={computedCardClass}
          />
        );

      case "certifications":
        return (
          <CertificationsSection
            key="certifications"
            certifications={certifications}
            cardClass={computedCardClass}
          />
        );

      case "achievements":
        return (
          <AchievementsSection
            key="achievements"
            achievements={achievements}
            cardClass={computedCardClass}
          />
        );

      case "resume":
        return user?.privacy?.showResume !== false ? (
          <ResumeViewer
            key="resume"
            resume={resume}
            user={user}
            cardClass={computedCardClass}
          />
        ) : null;

      case "contact":
        return (
          <div key="contact" className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-secondary">
              Direct Contact
            </h3>
            <div
              className={`p-4 rounded-2xl border grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs ${computedCardClass}`}
            >
              {user?.privacy?.showEmail !== false && user?.email && (
                <a
                  href={`mailto:${user.email}`}
                  className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-glass-soft text-secondary hover:text-primary transition-colors"
                >
                  <div
                    className="p-2 rounded-lg text-primary"
                    style={{
                      backgroundColor: `${customAccent}25`,
                      color: customAccent,
                    }}
                  >
                    <FiMail className="w-4 h-4" />
                  </div>
                  <span className="truncate">{user.email}</span>
                </a>
              )}
              {user?.privacy?.showPhone !== false && user?.phone && (
                <a
                  href={`tel:${user.phone}`}
                  className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-glass-soft text-secondary hover:text-primary transition-colors"
                >
                  <div
                    className="p-2 rounded-lg text-primary"
                    style={{
                      backgroundColor: `${customAccent}25`,
                      color: customAccent,
                    }}
                  >
                    <FiPhone className="w-4 h-4" />
                  </div>
                  <span className="truncate">{user.phone}</span>
                </a>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      style={{
        "--theme-accent": customAccent,
      }}
      className={`min-h-full transition-all duration-300 ${theme.bgClass} ${customFont} ${className}`}
    >
      <div className="max-w-xl mx-auto px-3.5 sm:px-6 py-6 sm:py-10 space-y-6 sm:space-y-8">
        {/* Profile Header */}
        <ProfileHeader
          user={user}
          theme={theme}
          onOpenExchange={onOpenExchange}
          onOpenQr={onOpenQr}
          onOpenShare={onOpenShare}
          isLivePreview={isLivePreview}
        />

        {/* Dynamic Ordered Sections */}
        <div className="space-y-6">
          {sectionOrder.map((sectionKey) => renderSection(sectionKey))}
        </div>

        {/* Profile Footer */}
        <div className="pt-6 border-t border-subtle text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-panel border border-subtle text-[11px] text-secondary">
            <span>Powered by</span>
            <span className="font-bold text-primary tracking-wide">OneMe</span>
            <span>• Your identity. One link.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
