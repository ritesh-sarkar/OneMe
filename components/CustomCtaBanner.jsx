"use client";

import React from "react";

import { motion } from "framer-motion";

import {
  FiArrowRight,
  FiZap,
} from "react-icons/fi";

export function CustomCtaBanner({
  cta,
  cardClass = "",
}) {
  if (!cta || !cta.enabled) return null;

  return (
    <motion.a
      href={cta.url || "mailto:hello@oneme.app"}
      target={cta.url?.startsWith("http") ? "_blank" : undefined}
      rel="noopener noreferrer"
      whileHover={{
        scale: 1.01,
        y: -2,
      }}
      whileTap={{
        scale: 0.99,
      }}
      className={`
        relative
        group
        overflow-hidden
        block
        p-5
        rounded-2xl
        border
        transition-all
        duration-300
        ${
          cta.style === "glow"
            ? "gradient-accent-soft border-accent-soft glow-indigo hover:border-accent"
            : cta.style === "gradient"
              ? "bg-linear-to-r gradient-brand text-primary border-transparent shadow-lg"
              : "bg-surface-panel border-light hover:border-accent/50"
        }
        ${cardClass}
      `}
    >
      <div
        className="
          flex
          items-center
          justify-between
          gap-4
          relative
          z-10
        "
      >
        <div className="flex items-center gap-3.5">
          <div
            className="
              p-2.5
              rounded-xl
              bg-accent-soft
              text-accent
              transition-all
              duration-200
              ease-in-out
              group-hover:scale-110
            "
          >
            <FiZap className="w-5 h-5" />
          </div>

          <div>
            <h4
              className="
                text-base
                md:text-lg
                font-bold
                text-text-primary
                transition-all
                duration-200
                ease-in-out
                group-hover:text-accent
              "
            >
              {cta.text || "Hire Me"}
            </h4>

            {cta.subtitle && (
              <p
                className="
                  text-sm
                  md:text-base
                  text-success
                  font-semibold
                  mt-0.5
                "
              >
                {cta.subtitle}
              </p>
            )}
          </div>
        </div>

        <div
          className="
            p-2
            rounded-xl
            bg-glass-soft
            group-hover:bg-accent
            group-hover:text-primary
            text-secondary
            transition-all
            duration-200
            ease-in-out
            shrink-0
          "
        >
          <FiArrowRight
            className="
              w-4
              h-4
              group-hover:translate-x-0.5
              transition-transform
            "
          />
        </div>
      </div>
    </motion.a>
  );
}