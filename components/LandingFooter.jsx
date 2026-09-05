"use client";

import React from "react";

import Link from "next/link";

import { FiHeart, FiGithub, FiTwitter, FiLinkedin } from "react-icons/fi";

export function LandingFooter() {
  return (
    <footer
      className="
        border-t
        border-subtle
        bg-surface-dark
        py-12
        text-secondary
        text-xs
      "
    >
      <div
        className="
          max-w-7xl
          mx-auto
          px-4
          sm:px-6
          lg:px-8
          space-y-8
        "
      >
        <div
          className="
            flex
            flex-col
            md:flex-row
            items-center
            justify-between
            gap-6
          "
        >
          {/* Brand */}
          <div
            className="
              flex
              items-center
              gap-3
            "
          >
            <div
              className="
                w-8
                h-8
                rounded-xl
                bg-gradient-to-tr
                gradient-brand
                p-0.5
              "
            >
              <div
                className="
                  w-full
                  h-full
                  bg-surface-dark
                  rounded-[10px]
                  flex
                  items-center
                  justify-center
                  font-black
                  text-primary
                  text-xs
                "
              >
                1M
              </div>
            </div>

            <div>
              <div
                className="
                  font-extrabold
                  text-primary
                  text-sm
                "
              >
                OneMe
              </div>

              <div
                className="
                  text-[11px]
                  text-muted
                "
              >
                Your identity. One link.
              </div>
            </div>
          </div>

          {/* Nav */}
          <div
            className="
              flex
              flex-wrap
              items-center
              justify-center
              gap-6
            "
          >
            <a
              href="#how-it-works"
              className="
                hover:text-primary
                transition-colors
              "
            >
              How it works
            </a>

            <a
              href="#features"
              className="
                hover:text-primary
                transition-colors
              "
            >
              Features
            </a>

            <a
              href="#themes"
              className="
                hover:text-primary
                transition-colors
              "
            >
              Themes
            </a>

            <a
              href="#flow"
              className="
                hover:text-primary
                transition-colors
              "
            >
              OneMe Flow
            </a>

            <Link
              href="/discover"
              className="
                hover:text-primary
                transition-colors
              "
            >
              Discover
            </Link>

            <Link
              href="/login"
              className="
                hover:text-primary
                transition-colors
              "
            >
              Demo Login
            </Link>
          </div>

          {/* Socials */}
          <div
            className="
              flex
              items-center
              gap-4
              text-secondary
            "
          >
            <a
              href="https://github.com/riteshsarkar"
              target="_blank"
              rel="noopener noreferrer"
              className="
                hover:text-primary
                transition-colors
              "
            >
              <FiGithub
                className="
                  w-4
                  h-4
                "
              />
            </a>

            <a
              href="https://linkedin.com/in/riteshsarkar"
              target="_blank"
              rel="noopener noreferrer"
              className="
                hover:text-primary
                transition-colors
              "
            >
              <FiLinkedin
                className="
                  w-4
                  h-4
                "
              />
            </a>

            <a
              href="https://x.com/riteshsarkar"
              target="_blank"
              rel="noopener noreferrer"
              className="
                hover:text-primary
                transition-colors
              "
            >
              <FiTwitter
                className="
                  w-4
                  h-4
                "
              />
            </a>
          </div>
        </div>

        <div
          className="
            pt-6
            border-t
            border-subtle
            flex
            flex-col
            sm:flex-row
            items-center
            justify-between
            gap-4
            text-muted
            text-[11px]
          "
        >
          <div>
            © {new Date().getFullYear()} OneMe. All rights reserved. Built as a
            high-fidelity frontend prototype.
          </div>

          <div
            className="
              flex
              items-center
              gap-1.5
            "
          >
            <span>Crafted with</span>

            <FiHeart
              className="
                w-3
                h-3
                text-danger
                fill-danger-soft
              "
            />

            <span>
              by{" "}
              <a
                href="https://ritesh-sarkar.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                Ritesh Sarkar
              </a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
