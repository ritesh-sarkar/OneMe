"use client";

import React from "react";
import { motion } from "framer-motion";

export function SkillsSection({
  skills = [],
  cardClass = "",
}) {
  if (
    !skills ||
    skills.length === 0
  ) {
    return null;
  }

  return (
    <div
      className="
        space-y-4
      "
    >
      <h3
        className="
          text-base
          md:text-lg
          font-semibold
          uppercase
          tracking-wider
          text-secondary
        "
      >
        Skills & Technical Stack
      </h3>

      <div
        className="
          flex
          flex-wrap
          gap-2
        "
      >
        {skills.map(
          (
            skill,
            index,
          ) => {
            const name =
              typeof skill === "string"
                ? skill
                : skill.name;

            const level =
              typeof skill === "object"
                ? skill.level
                : null;

            return (
              <motion.div
                key={index}
                
                className={`
                  group
                  inline-flex
                  items-center
                  gap-2
                  px-3
                  py-1.5
                  rounded-xl
                  border
                  border-subtle
                  bg-surface-deep
                  hover:border-accent/40
                  text-sm
                  md:text-base
                  font-medium
                  text-text-primary
                  backdrop-blur-sm
                  transition-all
                  duration-200
                  ease-in-out
                  hover:scale-103
                  hover:tracking-wide
                  active:scale-95
                  ${cardClass}
                `}
              >
                <span>
                  {name}
                </span>

                {level && (
                  <span
                    className="
                      text-xs
                      md:text-sm
                      px-1.5
                      py-0.2
                      rounded-full
                      bg-glass-soft
                      text-accent
                      font-mono
                    "
                  >
                    {level}
                  </span>
                )}
              </motion.div>
            );
          },
        )}
      </div>
    </div>
  );
}