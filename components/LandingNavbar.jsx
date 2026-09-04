"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";


//icons
import { FiZap, FiMenu, FiX, FiCompass, FiArrowRight } from "react-icons/fi";



export function LandingNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { isAuthenticated } = useAuth();

  return (
    <header
      className="
        sticky
        top-0
        z-40
        w-full
        border-b
        border-subtle
        bg-surface-page/80
        backdrop-blur-xl
      "
    >
      <div
        className="
          max-w-7xl
          mx-auto
          px-4
          sm:px-6
          lg:px-8
          h-16
          flex
          items-center
          justify-between
        "
      >

        {/* Brand Logo */}
        <Link
          href="/"
          className="
            flex
            items-center
            gap-2
            group
          "
        >
          <span
            className="
              w-8
              h-8
            "
          >
            <img src="/logo.jpg" alt="OneMe Logo"/>
          </span>

          <div
            className="
              flex
              flex-col
            "
          >
            <span
              className="
                text-lg
                font-black
                tracking-tight
                text-primary
                flex
                items-center
                gap-1
              "
            >
              OneMe
              <span
                className="
                  w-1.5
                  h-1.5
                  rounded-full
                  bg-cyan
                  inline-block
                "
              />
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav
          className="
            hidden
            md:flex
            items-center
            gap-7
            text-sm
            font-medium
            text-secondary
          "
        >
          <a
            href="#how-it-works"
            className="
              hover:text-primary
              transition-colors
            "
          >
            How it Works
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
              flex
              items-center
              gap-1.5
            "
          >
            <FiCompass
              className="
                w-3.5
                h-3.5
                text-cyan
              "
            />

            <span>Discover</span>
          </Link>
        </nav>

        {/* Action Buttons */}
        <div
          className="
            hidden
            sm:flex
            items-center
            gap-3
          "
        >
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="
                inline-flex
                items-center
                gap-2
                px-4
                py-2
                rounded-xl
                bg-accent
                hover:bg-accent
                text-primary
                text-xs
                font-semibold
                glow-indigo
                transition-all
              "
            >
              <span>Dashboard</span>

              <FiArrowRight
                className="
                  w-3.5
                  h-3.5
                "
              />
            </Link>
          ) : (
            <>
              <Link
                href="/"
                className="
                  px-3.5
                  py-1.5
                  rounded-xl
                  text-base
                  font-semibold
                  text-secondary
                  transition-colors
                  duration-300
                  ease-in-out
                  hover:text-primary
                  active:scale-95
                "
              >
                Log in
              </Link>

              <Link
                href="/signup"
                className="
                  btn-secondary
                  inline-flex
                  items-center
                  gap-1.5
                  px-4
                  py-2
                  rounded-xl
                  text-sm
                  font-semibold
                  shadow-md
                  transition-all
                "
              >
                <span>Create your OneMe</span>

                <FiZap
                  className="
                    w-3.5
                    h-3.5
                    text-accent
                  "
                />
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="
            sm:hidden
            p-2
            text-secondary
            hover:text-primary
          "
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <FiX
              className="
                w-6
                h-6
              "
            />
          ) : (
            <FiMenu
              className="
                w-6
                h-6
              "
            />
          )}
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{
              opacity: 0,
              height: 0,
            }}
            animate={{
              opacity: 1,
              height: "auto",
            }}
            exit={{
              opacity: 0,
              height: 0,
            }}
            className="
              sm:hidden
              border-b
              border-subtle
              bg-surface-page
              px-4
              py-5
              space-y-4
            "
          >
            <nav
              className="
                flex
                flex-col
                space-y-3
                text-base
                text-secondary
              "
            >
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="
                  py-1
                "
              >
                How it Works
              </a>

              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="
                  py-1
                "
              >
                Features
              </a>

              <a
                href="#themes"
                onClick={() => setMobileMenuOpen(false)}
                className="
                  py-1
                "
              >
                Themes
              </a>

              <a
                href="#flow"
                onClick={() => setMobileMenuOpen(false)}
                className="
                  py-1
                "
              >
                OneMe Flow
              </a>

              <Link
                href="/discover"
                onClick={() => setMobileMenuOpen(false)}
                className="
                  py-1
                  flex
                  items-center
                  gap-1.5
                "
              >
                <FiCompass
                  className="
                    w-4
                    h-4
                    text-cyan
                  "
                />

                <span>Discover Profiles</span>
              </Link>
            </nav>

            <div
              className="
                pt-3
                border-t
                border-subtle
                flex
                flex-col
                gap-2
              "
            >
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="
                  w-full
                  text-center
                  py-2.5
                  rounded-xl
                  bg-accent
                  text-primary
                  text-xs
                  font-semibold
                "
              >
                Create your OneMe
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
