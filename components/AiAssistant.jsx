"use client";

import React, { useState } from "react";

//icons
import { FiCpu, FiZap, FiCheck, FiRefreshCw } from "react-icons/fi";

//Custom Components and libs
import { Button } from "@/components/Button";
import { Textarea } from "@/components/Input";
import { useProfile } from "@/context/ProfileContext";
import { useToast } from "@/context/ToastContext";

export default function AiAssistantPage() {
  const { profile, updateProfile } = useProfile();

  const { success, error: toastError } = useToast();

  const [prompt, setPrompt] = useState(
    "I am a CSE student and full-stack developer who builds React & Next.js web applications.",
  );

  const [isGenerating, setIsGenerating] = useState(false);

  const [hasGenerated, setHasGenerated] = useState(false);

  const [genTagline, setGenTagline] = useState("");

  const [genBio, setGenBio] = useState("");

  const [genCta, setGenCta] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleGenerate = async () => {
    setIsGenerating(true);
    setErrorMessage("");
    try {
      const response = await fetch("/api/ai/profile-copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "AI suggestions could not be generated.");
      setGenTagline(result.suggestions.tagline);
      setGenBio(result.suggestions.bio);
      setGenCta(result.suggestions.cta);
      setHasGenerated(true);
      success("AI suggestions generated. Review them before applying.");
    } catch (error) {
      setErrorMessage(error.message || "AI suggestions could not be generated.");
      toastError(error.message || "AI suggestions could not be generated.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyToProfile = () => {
    updateProfile({
      tagline: genTagline,
      bio: genBio,
      customCta: {
        ...(profile.customCta || {}),
        text: genCta,
      },
    });

    success("AI generated copy applied directly to your OneMe profile!", "Profile Updated");
  };

  return (
    <div className="space-y-8">
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
        <div>
          <h1
            className="
              text-2xl
              md:text-3xl
              font-black
              text-text-primary
              tracking-tight
              flex
              items-center
              gap-2.5
            "
          >
            <FiCpu className="text-accent" />

            <span>AI Profile Assistant</span>
          </h1>

          <p
            className="
              text-sm
              md:text-base
              text-secondary
              leading-relaxed
            "
          >
            Generate high-converting headlines, bios, and CTAs tailored to your skillset.
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
        {/* Left: Input Prompt */}

        <div
          className="
            lg:col-span-6
            p-6
            sm:p-8
            rounded-3xl
            bg-glass
            border
            border-subtle
            backdrop-blur-xl
            shadow-xl
            space-y-6
            transition-all
            duration-200
            ease-in-out
          "
        >
          <div className="space-y-2">
            <h3
              className="
                text-base
                md:text-lg
                font-bold
                text-text-primary
              "
            >
              Describe Your Background & Focus
            </h3>

            <p
              className="
                text-sm
                md:text-base
                text-secondary
                leading-relaxed
              "
            >
              Provide keywords, your current focus, target roles, or notable achievements.
            </p>
          </div>

          <Textarea
            rows={5}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            maxLength={2000}
            placeholder="e.g. I am a full-stack engineer building Next.js apps with a focus on web performance..."
          />
          <p className="text-xs leading-relaxed text-tertiary">
            Your prompt is sent to Google Gemini to generate suggestions. Do not include passwords
            or sensitive personal information.
          </p>

          <div
            className="
              flex
              flex-wrap
              gap-2
            "
          >
            <span
              className="
                text-sm
                md:text-base
                text-tertiary
                py-1
              "
            >
              Quick prompts:
            </span>

            {[
              "Full-Stack Developer",
              "UI/UX Product Designer",
              "AI & ML Systems Engineer",
              "CSE Student looking for internships",
            ].map((p, i) => (
              <button
                key={i}
                type="button"
                onClick={() =>
                  setPrompt(`I am a ${p.toLowerCase()} focused on modern tech stacks.`)
                }
                className="
                  px-2.5
                  py-1
                  rounded-lg
                  bg-surface-dark
                  border
                  border-subtle
                  text-xs
                  md:text-sm
                  text-secondary
                  hover:text-text-primary
                  transition-all
                  duration-200
                  ease-in-out
                  hover:scale-105
                  active:scale-95
                "
              >
                {p}
              </button>
            ))}
          </div>

          <Button
            onClick={handleGenerate}
            isLoading={isGenerating}
            disabled={prompt.trim().length < 20}
            variant="glow"
            size="lg"
            className="
              w-full
              justify-center
              transition-all
              duration-200
              ease-in-out
              hover:scale-[1.02]
              active:scale-[0.98]
            "
            icon={FiZap}
          >
            Generate Identity Copy
          </Button>
        </div>

        {/* Right: Output Suggestions */}

        <div
          className="
            lg:col-span-6
            p-6
            sm:p-8
            rounded-3xl
            bg-glass
            border
            border-subtle
            backdrop-blur-xl
            shadow-xl
            space-y-6
            transition-all
            duration-200
            ease-in-out
          "
        >
          <div
            className="
              flex
              items-center
              justify-between
              gap-3
              border-b
              border-subtle
              pb-3
            "
          >
            <h3
              className="
                text-base
                md:text-lg
                font-bold
                text-text-primary
              "
            >
              Generated Suggestions
            </h3>

            <span
              className="
                text-xs
                md:text-sm
                px-2
                py-0.5
                rounded-full
                bg-success-soft
                text-success
                border
                border-light
                font-mono
                shrink-0
              "
            >
              {hasGenerated ? "Review Before Applying" : "No Suggestions Yet"}
            </span>
          </div>

          {errorMessage && (
            <p
              role="alert"
              className="rounded-xl border border-light bg-danger-soft p-3 text-sm text-danger"
            >
              {errorMessage}
            </p>
          )}

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label
                className="
                  text-sm
                  md:text-base
                  font-semibold
                  text-accent
                "
              >
                Generated Tagline
              </label>

              <input
                type="text"
                value={genTagline}
                onChange={(e) => setGenTagline(e.target.value)}
                maxLength={200}
                className="
                  w-full
                  p-3
                  rounded-xl
                  bg-surface-dark
                  border
                  border-subtle
                  text-sm
                  md:text-base
                  text-text-primary
                  focus:outline-none
                  focus:border-accent
                  transition-all
                  duration-200
                  ease-in-out
                "
              />
            </div>

            <div className="space-y-1.5">
              <label
                className="
                  text-sm
                  md:text-base
                  font-semibold
                  text-accent
                "
              >
                Generated Executive Bio
              </label>

              <textarea
                rows={4}
                value={genBio}
                onChange={(e) => setGenBio(e.target.value)}
                maxLength={1500}
                className="
                  w-full
                  p-3
                  rounded-xl
                  bg-surface-dark
                  border
                  border-subtle
                  text-sm
                  md:text-base
                  text-text-primary
                  focus:outline-none
                  focus:border-accent
                  leading-relaxed
                  transition-all
                  duration-200
                  ease-in-out
                "
              />
            </div>

            <div className="space-y-1.5">
              <label
                className="
                  text-sm
                  md:text-base
                  font-semibold
                  text-accent
                "
              >
                Generated CTA Title
              </label>

              <input
                type="text"
                value={genCta}
                onChange={(e) => setGenCta(e.target.value)}
                maxLength={100}
                className="
                  w-full
                  p-3
                  rounded-xl
                  bg-surface-dark
                  border
                  border-subtle
                  text-sm
                  md:text-base
                  text-text-primary
                  focus:outline-none
                  focus:border-accent
                  transition-all
                  duration-200
                  ease-in-out
                "
              />
            </div>
          </div>

          <div
            className="
              flex
              flex-col
              sm:flex-row
              items-center
              gap-3
              pt-2
            "
          >
            <Button
              onClick={handleGenerate}
              disabled={prompt.trim().length < 20}
              variant="outline"
              size="md"
              icon={FiRefreshCw}
              className="
                w-full
                sm:flex-1
                transition-all
                duration-200
                ease-in-out
                hover:scale-105
                active:scale-95
              "
            >
              Regenerate
            </Button>

            <Button
              onClick={handleApplyToProfile}
              disabled={!hasGenerated}
              variant="primary"
              size="md"
              icon={FiCheck}
              className="
                w-full
                sm:flex-1
                transition-all
                duration-200
                ease-in-out
                hover:scale-105
                active:scale-95
              "
            >
              Apply to Profile
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
