"use client";

import React from "react";

export function LandingFooter() {
  return (
    <footer
      className="
        w-full
        mt-auto
        border-t
        border-subtle
        bg-surface-dark
        py-8
        text-secondary
        text-xs
        md:text-sm
      "
    >
      <div
        className="
          w-full
          max-w-7xl
          mx-auto
          px-4
          md:px-6
          lg:px-8
          flex
          flex-col
          md:flex-row
          items-center
          md:justify-between
          gap-5
        "
      >
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
            className="h-10 w-10 shrink-0 rounded-xl"
          />
          <div>
            <div className="text-sm font-extrabold text-primary md:text-base">OneMe</div>
            <div className="text-xs text-tertiary md:text-sm">Your identity. One link.</div>
          </div>
        </div>

        <div
          className="
            text-center
            text-tertiary
            text-sm
            md:text-base
          "
        >
          © {new Date().getFullYear()} OneMe. All rights reserved by{" "}
          <a
            href="https://ritesh-sarkar.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold transition-colors duration-300 ease-in-out hover:text-text-primary"
          >
            Ritesh Sarkar
          </a>
        </div>
      </div>
    </footer>
  );
}
