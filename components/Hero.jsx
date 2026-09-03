"use client";

import React from "react";

import Link from "next/link";

import { motion } from "framer-motion";

import { FiZap, FiCompass, FiCheckCircle } from "react-icons/fi";

import { Button } from "@/components/Button";

import { DEMO_USER, DEMO_PROJECTS, DEMO_EXPERIENCE } from "@/libs/mock-data";

import { PublicProfileView } from "@/components/PublicProfileView";

export function Hero() {
  return (
    <section
      className="
        relative
        pt-12
        pb-20
        md:pt-20
        md:pb-32
        overflow-hidden
      "
    >
      {/* Background Glow Spheres */}

      <div
        className="
          absolute
          top-1/4
          left-1/2
          -translate-x-1/2
          -translate-y-1/2
          w-[600px]
          h-[600px]
          gradient-cyan-soft
          rounded-full
          blur-[130px]
          pointer-events-none
        "
      />

      <div
        className="
          absolute
          top-1/3
          left-1/4
          w-72
          h-72
          bg-success-soft
          rounded-full
          blur-[100px]
          pointer-events-none
        "
      />

      <div
        className="
          max-w-7xl
          mx-auto
          px-4
          sm:px-6
          lg:px-8
          relative
          z-10
        "
      >
        <div
          className="
            grid
            grid-cols-1
            lg:grid-cols-12
            gap-12
            lg:gap-8
            items-center
          "
        >
          {/* Left Column: Copy & Actions */}

          <div
            className="
              lg:col-span-6
              space-y-8
              text-center
              lg:text-left
            "
          >
            {/* Pill Tag */}

            <motion.div
              initial={{
                opacity: 0,
                y: 15,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.4,
              }}
              className="
                inline-flex
                items-center
                gap-2
                px-3.5
                py-1.5
                rounded-full
                border
                border-light
                bg-cyan-soft
                backdrop-blur-md
                text-xs
                font-medium
                text-cyan
              "
            >
              <span
                className="
                  flex
                  h-2
                  w-2
                  rounded-full
                  bg-cyan
                  animate-pulse
                "
              />

              <span>Next-Gen Digital Identity & Contact Protocol</span>
            </motion.div>

            {/* Hero Headline */}

            <motion.div
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.5,
                delay: 0.1,
              }}
              className="
                space-y-4
              "
            >
              <h1
                className="
                  text-4xl
                  sm:text-6xl
                  lg:text-6xl
                  font-extrabold
                  tracking-tight
                  text-primary
                  leading-[1.1]
                "
              >
                Your identity.
                <br />
                <span
                  className="
                    gradient-brand-text
                  "
                >
                  One link.
                </span>
              </h1>

              <p
                className="
                  text-base
                  sm:text-lg
                  text-secondary
                  max-w-xl
                  mx-auto
                  lg:mx-0
                  leading-relaxed
                "
              >
                Create a beautiful digital identity that brings your profile,
                portfolio, socials, and contact card together in one place.
                Instant OneMe Flow exchange and real-time vCard download.
              </p>
            </motion.div>

            {/* Action Buttons */}

            <motion.div
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.5,
                delay: 0.2,
              }}
              className="
                flex
                flex-col
                sm:flex-row
                items-center
                justify-center
                lg:justify-start
                gap-4
              "
            >
              <Link
                href="/login"
                className="
                  w-full
                  sm:w-auto
                "
              >
                <Button
                  variant="glow"
                  size="lg"
                  icon={FiZap}
                  className="
                    w-full
                    sm:w-auto
                    px-8
                    glow-cyan
                  "
                >
                  Create your OneMe
                </Button>
              </Link>

              <Link
                href="/discover"
                className="
                  w-full
                  sm:w-auto
                "
              >
                <Button
                  variant="outline"
                  size="lg"
                  icon={FiCompass}
                  className="
                    w-full
                    sm:w-auto
                  "
                >
                  Explore profiles
                </Button>
              </Link>
            </motion.div>

            {/* Social Proof & Features List */}

            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              transition={{
                duration: 0.5,
                delay: 0.3,
              }}
              className="
                pt-6
                border-t
                border-light
                flex
                flex-wrap
                items-center
                justify-center
                lg:justify-start
                gap-6
                text-xs
                text-secondary
                font-mono
              "
            >
              <div
                className="
                  flex
                  items-center
                  gap-1.5
                "
              >
                <FiCheckCircle
                  className="
                    text-success
                  "
                />

                <span>Zero Backend Needed</span>
              </div>

              <div
                className="
                  flex
                  items-center
                  gap-1.5
                "
              >
                <FiCheckCircle
                  className="
                    text-cyan
                  "
                />

                <span>Real-Time .vcf Generator</span>
              </div>

              <div
                className="
                  flex
                  items-center
                  gap-1.5
                "
              >
                <FiCheckCircle
                  className="
                    text-accent
                  "
                />

                <span>OneMe Flow Radar</span>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Interactive Phone / Desktop Preview Mockup */}

          <motion.div
            initial={{
              opacity: 0,
              scale: 0.95,
              y: 20,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            transition={{
              duration: 0.6,
              delay: 0.2,
            }}
            className="
              lg:col-span-6
              relative
              flex
              justify-center
            "
          >
            {/* Ambient Backlight */}

            <div
              className="
                absolute
                inset-0
                gradient-cyan-soft
                rounded-3xl
                blur-2xl
                -z-10
              "
            />

            {/* Device Container Frame */}

            <div
              className="
                w-full
                max-w-sm
                sm:max-w-md
                rounded-[38px]
                p-3.5
                bg-surface-dark/90
                border-4
                border-subtle
                shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)]
                backdrop-blur-2xl
              "
            >
              {/* Speaker Notch / Dynamic Island */}

              <div
                className="
                  w-28
                  h-4
                  bg-surface-deep
                  rounded-full
                  mx-auto
                  mb-3
                  flex
                  items-center
                  justify-center
                  gap-2
                "
              >
                <div
                  className="
                    w-2.5
                    h-2.5
                    rounded-full
                    bg-surface-dark
                  "
                />

                <div
                  className="
                    w-2
                    h-2
                    rounded-full
                    bg-cyan/60
                    animate-pulse
                  "
                />
              </div>

              {/* Scrollable Preview Screen */}

              <div
                className="
                  h-[520px]
                  sm:h-[580px]
                  overflow-y-auto
                  rounded-[26px]
                  bg-surface-dark
                  border
                  border-subtle
                  scrollbar-none
                  shadow-inner
                "
              >
                <PublicProfileView
                  user={DEMO_USER}
                  projects={DEMO_PROJECTS}
                  experience={DEMO_EXPERIENCE}
                  isLivePreview={true}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
