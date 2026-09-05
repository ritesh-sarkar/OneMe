"use client";

import React from "react";

import Link from "next/link";

import { motion } from "framer-motion";

import {
  FiZap,
  FiArrowRight,
  FiShield,
} from "react-icons/fi";

import { Button } from "@/components/Button";

export function FinalCta() {
  return (
    <section
      className="
        py-24
        relative
        overflow-hidden
      "
    >
      <div
        className="
          max-w-5xl
          mx-auto
          px-4
          sm:px-6
          lg:px-8
          text-center
          relative
          z-10
        "
      >
        <div
          className="
            p-10
            sm:p-16
            rounded-3xl
            gradient-bg-primary
            border
            border-light
            glow-indigo
            space-y-6
          "
        >
          <div
            className="
              inline-flex
              items-center
              gap-2
              px-3.5
              py-1
              rounded-full
              bg-accent-soft
              border
              border-light
              text-accent
              text-xs
              font-mono
            "
          >
            <span>
              One person. One identity. One link.
            </span>
          </div>

          <h2
            className="
              text-3xl
              sm:text-5xl
              font-black
              text-primary
              tracking-tight
              leading-tight
            "
          >
            Claim Your Unique OneMe Link Today
          </h2>

          <p
            className="
              text-base
              text-secondary
              max-w-xl
              mx-auto
            "
          >
            Join developers, designers, and innovators presenting their
            digital presence with unparalleled elegance.
          </p>

          <div
            className="
              pt-4
              flex
              flex-col
              sm:flex-row
              items-center
              justify-center
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
                  px-10
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
                className="
                  w-full
                  sm:w-auto
                "
              >
                Explore Directory
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}