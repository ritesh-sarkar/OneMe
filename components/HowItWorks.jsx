"use client";

import React from "react";

import { motion } from "framer-motion";

import { FiUserPlus, FiSliders, FiShare2, FiZap } from "react-icons/fi";

const STEPS = [
  {
    step: "01",
    title: "Create",
    description:
      "Set up your digital identity in seconds. Upload custom avatar & banner, add your projects, career milestones, socials, and contact cards.",
    icon: FiUserPlus,
    color: "gradient-cyan-soft",
  },
  {
    step: "02",
    title: "Customize",
    description:
      "Choose from 8 distinct aesthetic presets or fine-tune design tokens with accent colors, card layers, and typography.",
    icon: FiSliders,
    color: "gradient-accent-soft",
  },
  {
    step: "03",
    title: "Share",
    description:
      "One link for your bio, social profiles, or instant high-res QR code. Download ready-to-use digital vCards.",
    icon: FiShare2,
    color: "bg-pink-soft",
  },
  {
    step: "04",
    title: "Connect",
    description:
      "Exchange contacts with nearby peers via OneMe Flow radar or dynamic QR without typing a single phone number.",
    icon: FiZap,
    color: "bg-success-soft",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="
        py-20
        border-t
        border-subtle
        bg-surface-dark/40
        relative
      "
    >
      <div
        className="
          max-w-7xl
          mx-auto
          px-4
          md:px-6
          lg:px-8
        "
      >
        <div
          className="
            text-center
            max-w-2xl
            mx-auto
            space-y-3
            mb-16
          "
        >
          <span
            className="
              text-xs
              font-semibold
              uppercase
              tracking-wider
              text-cyan
              font-mono
            "
          >
            Seamless Workflow
          </span>

          <h2
            className="
              text-3xl
              md:text-4xl
              font-extrabold
              text-primary
              tracking-tight
            "
          >
            How OneMe Works
          </h2>

          <p
            className="
              text-sm
              md:text-base
              text-secondary
            "
          >
            From setup to handshake, OneMe turns your professional presence into
            an active digital connection hub.
          </p>
        </div>

        <div
          className="
            grid
            grid-cols-1
            md:grid-cols-2
            lg:grid-cols-4
            gap-6
            relative
          "
        >
          {STEPS.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.step}
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.1,
                }}
                className="
                  relative
                  rounded-2xl
                  p-6
                  bg-surface-deep/50
                  border
                  border-subtle
                  hover:border-light
                  transition-all
                  group
                  backdrop-blur-sm
                "
              >
                <div
                  className="
                    flex
                    items-center
                    justify-between
                    mb-4
                  " 
                >
                  <div
                    className={`
                      w-12
                      h-12
                      rounded-xl
                      bg-linear-to-tr
                      ${item.color}
                      p-0.75
                      shadow-lg
                      group-hover:scale-110
                      transition-transform
                    `}
                  >
                    <div
                      className="
                        w-full
                        h-full
                        bg-surface-dark
                        rounded-lg
                        flex
                        items-center
                        justify-center
                        text-primary
                      "
                    >
                      <Icon
                        className="
                          w-5
                          h-5
                        "
                      />
                    </div>
                  </div>

                  <span
                    className="
                      text-2xl
                      font-black
                      text-accent-muted
                      font-mono
                      group-hover:text-muted
                      transition-colors
                    "
                  >
                    {item.step}
                  </span>
                </div>

                <h3
                  className="
                    text-lg
                    font-bold
                    text-primary
                    mb-2
                    md:text-xl
                  "
                >
                  {item.title}
                </h3>

                <p
                  className="
                    text-sm
                    md:text-base
                    text-secondary
                    leading-relaxed
                  "
                >
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
