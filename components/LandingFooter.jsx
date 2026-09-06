"use client";

import React from "react";
import Link from "next/link";

//icons
import { FiHeart, FiGithub, FiTwitter, FiLinkedin } from "react-icons/fi";

export function LandingFooter() {
  return (
    <footer
      className="
        w-full
        border-t
        border-subtle
        bg-surface-dark
        py-12
        text-secondary
        text-xs
        md:text-sm
        flex
        items-center
        justify-center
        gap-4
        md:gap-6
        flex-col
        md:flex-row
      "
    >
      <div
        className="
          max-w-7xl
          mx-auto
          px-4
          md:px-6
          lg:px-8
          flex
          flex-col
          md:flex-row
          items-center
          justify-center
          gap-6
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
          {/* Branding */}
          <div
            className="
              flex
              items-center
              gap-3
            "
          >
            <img
              src="/logo.jpg"
              alt="OneMe Logo"
              className="w-10 h-10 rounded-xl"
            />

            <div>
              <div
                className="
                  font-extrabold
                  text-primary
                  text-sm
                  md:text-base
                "
              >
                OneMe
              </div>

              <div
                className="
                  text-xs
                  md:text-sm
                  text-tertiary
                "
              >
                Your identity. One link.
              </div>
            </div>
          </div>
        </div>

        <div
          className="
            w-full
            text-center
            md:text-left
            text-tertiary
            text-sm
            md:text-base
          "
        >
          <div>
            © {new Date().getFullYear()} OneMe. All rights reserved by{" "}
            <a
              href="https://ritesh-sarkar.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="
                font-bold
                hover:text-text-primary 
                transition-colors
                duration-300
                ease-in-out
                "
            >
              Ritesh Sarkar
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
