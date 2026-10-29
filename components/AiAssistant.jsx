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

  const { success } = useToast();

  const [prompt, setPrompt] = useState(
    "I am a CSE student and full-stack developer who builds React & Next.js web applications.",
  );

  const [isGenerating, setIsGenerating] = useState(false);

  const [hasGenerated, setHasGenerated] = useState(false);

  const [genTagline, setGenTagline] = useState(
    "Building high-impact digital experiences with code.",
  );

  const [genBio, setGenBio] = useState(
    "Passionate Full-Stack Developer specializing in modern JavaScript ecosystems, Next.js, and scalable web architectures. Dedicated to clean engineering, responsive UI design systems, and building tools that empower developers.",
  );

  const [genCta, setGenCta] = useState("Let’s Build Something Amazing");

  const handleGenerate = () => {
    setIsGenerating(true);

    setTimeout(() => {
      setIsGenerating(false);

      setHasGenerated(true);

      if (
        prompt.toLowerCase().includes("design") ||
        prompt.toLowerCase().includes("figma")
      ) {
        setGenTagline(
          "Designing human-centric software interfaces with pixel precision.",
        );

        setGenBio(
          "Product Designer & Frontend Engineer creating elegant design systems and memorable digital experiences. Bridging Figma workflows with clean React code.",
        );

        setGenCta("Discuss Design Collaboration");
      } else if (
        prompt.toLowerCase().includes("ai") ||
        prompt.toLowerCase().includes("machine learning")
      ) {
        setGenTagline(
          "Engineering distributed ML pipelines and intelligent systems.",
        );

        setGenBio(
          "Systems Architect and Developer focused on deploying large language models, high-throughput APIs, and scalable infrastructure.",
        );

        setGenCta("Connect on AI Research");
      } else {
        setGenTagline(
          "Building robust, high-performance web applications with code.",
        );

        setGenBio(
          "Full-Stack Engineer dedicated to modern web standards, React, Next.js, and performant backend APIs. Focused on scalable architectures and clean code craftsmanship.",
        );

        setGenCta("Hire Me for Projects");
      }

      success("AI suggestions generated based on your input!");
    }, 1000);
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

    success(
      "AI generated copy applied directly to your OneMe profile!",
      "Profile Updated",
    );
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
            Generate high-converting headlines, bios, and CTAs tailored to your
            skillset.
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
              Provide keywords, your current focus, target roles, or notable
              achievements.
            </p>
          </div>

          <Textarea
            rows={5}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. I am a full-stack engineer building Next.js apps with a focus on web performance..."
          />

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
                  setPrompt(
                    `I am a ${p.toLowerCase()} focused on modern tech stacks.`,
                  )
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
              Ready to Apply
            </span>
          </div>

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
