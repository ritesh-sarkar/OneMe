"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

//icons
import { FiRadio, FiZap, FiArrowRight } from "react-icons/fi";

//Custom Components and libs
import { Button } from "@/components/Button";
import { ExchangeModal } from "@/components/ExchangeModal";

export function FlowDemo() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <section
      id="flow"
      className="
        py-24
        relative
        overflow-hidden
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
            rounded-3xl
            p-8
            md:p-14
            gradient-bg-primary
            border
            border-light
            backdrop-blur-2xl
            relative
            overflow-hidden
          "
        >

          {/* Glowing Ambient Halo */}
          <div
            className="
              absolute
              top-0
              right-0
              w-96
              h-96
              bg-cyan/15
              rounded-full
              blur-3xl
              pointer-events-none
            "
          />

          <div
            className="
              grid
              grid-cols-1
              lg:grid-cols-12
              gap-10
              items-center
              relative
              z-10
            "
          >

            {/* Left Description */}
            <div
              className="
                lg:col-span-6
                space-y-6
                text-center
                lg:text-left
              "
            >
              <div
                className="
                  inline-flex
                  items-center
                  gap-2
                  px-3
                  py-1
                  rounded-full
                  bg-cyan-soft
                  border
                  border-light
                  text-cyan
                  text-xs
                  md:text-sm
                  font-mono
                "
              >
                <FiRadio
                  className="
                    w-3.5
                    h-3.5
                    animate-pulse
                    text-cyan
                  "
                />

                <span>Mutual-consent contact exchange</span>
              </div>

              <h2
                className="
                  text-3xl
                  md:text-4xl
                  font-extrabold
                  text-primary
                  tracking-tight
                  leading-tight
                "
              >
                OneMe Flow Contact Protocol
              </h2>

              <p
                className="
                  text-sm
                  md:text-base
                  text-secondary
                  leading-relaxed
                "
              >
                Invite a verified OneMe member by username, select the contact
                details you consent to share, and wait for them to approve and
                choose their own details before either connection is saved.
              </p>


              {/* Flow Steps Graphic */}
              <div
                className="
                  flex
                  flex-wrap
                  items-center
                  justify-center
                  lg:justify-start
                  gap-2
                  pt-2
                  text-xs
                  md:text-sm
                  font-mono
                  text-secondary
                "
              >
                <span
                  className="
                    px-2.5
                    py-1
                    rounded-lg
                    bg-surface-deep
                    border
                    border-subtle
                  "
                >
                  1. Invite
                </span>

                <span
                  className="
                    text-cyan
                  "
                >
                  →
                </span>

                <span
                  className="
                    px-2.5
                    py-1
                    rounded-lg
                    bg-surface-deep
                    border
                    border-subtle
                  "
                >
                  2. Request
                </span>

                <span
                  className="
                    text-cyan
                  "
                >
                  →
                </span>

                <span
                  className="
                    px-2.5
                    py-1
                    rounded-lg
                    bg-surface-deep
                    border
                    border-subtle
                  "
                >
                  3. Accept
                </span>

                <span
                  className="
                    text-cyan
                  "
                >
                  →
                </span>

                <span
                  className="
                    px-2.5
                    py-1
                    rounded-lg
                    bg-success-soft
                    text-success
                    border
                    border-light
                  "
                >
                  4. Connect
                </span>
              </div>

              <div
                className="
                  pt-2
                "
              >
                <Button
                  onClick={() => setModalOpen(true)}
                  variant="glow"
                  size="lg"
                  icon={FiZap}
                  className="
                    glow-cyan
                  "
                >
                  Try Interactive OneMe Flow
                </Button>
              </div>
            </div>


            {/* Right Interactive Mock Card */}
            <div
              className="
                lg:col-span-6
                flex
                justify-center
              "
            >
              <div
                className="
                  w-full
                  max-w-sm
                  rounded-2xl
                  p-5
                  bg-surface-dark/80
                  border
                  border-light
                  shadow-2xl
                  space-y-4
                "
              >
                <div
                  className="
                    flex
                    items-center
                    justify-between
                    pb-3
                    border-b
                    border-subtle
                  "
                >
                  <div
                    className="
                      flex
                      items-center
                      gap-2
                      text-xs
                      md:text-sm
                      text-cyan
                      font-mono
                    "
                  >
                    <FiRadio
                      className="
                        w-4
                        h-4
                        animate-pulse
                      "
                    />

                    <span>Illustrative interface preview</span>
                  </div>

                  <span
                    className="
                      text-xs
                      md:text-sm
                      font-semibold
                      px-2
                      py-0.5
                      rounded-full
                      bg-success-soft
                      text-success
                      border
                      border-light
                    "
                  >
                    Example
                  </span>
                </div>

                <div
                  className="
                    space-y-2.5
                  "
                >
                  <div
                    className="
                      p-3
                      rounded-xl
                      bg-surface-deep
                      border
                      border-light
                      flex
                      items-center
                      justify-between
                    "
                  >
                    <div
                      className="
                        flex
                        items-center
                        gap-2.5
                      "
                    >
                      <img
                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200"
                        alt="Sarah Khan"
                        className="
                          w-9
                          h-9
                          rounded-full
                          object-cover
                        "
                      />

                      <div>
                        <div
                          className="
                            text-xs
                            md:text-sm
                            font-bold
                            text-primary
                          "
                        >
                          Sarah Khan
                        </div>

                        <div
                          className="
                            text-xs
                            text-secondary
                          "
                        >
                          Lead Product Designer
                        </div>
                      </div>
                    </div>

                    <span
                      className="
                        text-xs
                        md:text-sm
                        font-semibold
                        text-success
                      "
                    >
                      Example member
                    </span>
                  </div>

                  <div
                    className="
                      p-3
                      rounded-xl
                      bg-glass
                      border
                      border-subtle
                      flex
                      items-center
                      justify-between
                    "
                  >
                    <div
                      className="
                        flex
                        items-center
                        gap-2.5
                      "
                    >
                      <img
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200"
                        alt="John Doe"
                        className="
                          w-9
                          h-9
                          rounded-full
                          object-cover
                        "
                      />

                      <div>
                        <div
                          className="
                            text-xs
                            font-bold
                            text-primary
                          "
                        >
                          John Doe
                        </div>

                        <div
                          className="
                            text-xs
                            md:text-sm
                            text-secondary
                          "
                        >
                          Senior Software Engineer
                        </div>
                      </div>
                    </div>

                    <span
                      className="
                        text-xs
                        md:text-sm
                        font-semibold
                        text-cyan
                      "
                    >
                      Example member
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setModalOpen(true)}
                  className="
                    w-full
                    py-2.5
                    rounded-xl
                    bg-cyan
                    hover:bg-cyan
                    text-surface-dark
                    text-xs
                    md:text-sm
                    font-bold
                    flex
                    items-center
                    justify-center
                    gap-2
                    transition-colors
                    shadow-lg
                    glow-cyan
                  "
                >
                  <span>Start OneMe Flow</span>

                  <FiArrowRight
                    className="
                      w-3.5
                      h-3.5
                    "
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ExchangeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </section>
  );
}
