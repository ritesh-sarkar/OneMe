"use client";

import React from "react";

//icons
import { FiAward, FiCalendar } from "react-icons/fi";

export function AchievementsSection({ achievements = [], cardClass = "" }) {
  if (!achievements || achievements.length === 0) {
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
        Honors & Achievements
      </h3>

      <div
        className="
          space-y-2.5
        "
      >
        {achievements.map((ach) => (
          <div
            key={ach.id}
            className={`
                p-4
                rounded-xl
                border
                border-subtle
                bg-bg-glass
                flex
                items-start
                gap-3.5
                transition-all
                duration-200
                ease-in-out
                hover:bg-bg-secondary
                hover:scale-101
                ${cardClass}
              `}
          >
            <div
              className="
                  p-2.5
                  rounded-xl
                  bg-warning-soft
                  text-warning
                  shrink-0
                  mt-0.5
                "
            >
              <FiAward
                className="
                    w-4
                    h-4
                  "
              />
            </div>

            <div
              className="
                  flex-1
                  space-y-1
                "
            >
              <div
                className="
                    flex
                    flex-col
                    md:flex-row
                    md:items-center
                    justify-between
                    gap-1
                  "
              >
                <h4
                  className="
                      text-base
                      md:text-lg
                      font-bold
                      text-text-primary
                    "
                >
                  {ach.title}
                </h4>

                <div
                  className="
                      flex
                      items-center
                      gap-1
                      text-xs
                      md:text-sm
                      text-tertiary
                      font-mono
                      font-semibold
                      italic
                    "
                >
                  <FiCalendar
                    className="
                        w-3
                        h-3
                        shrink-0
                        -mt-1
                      "
                  />

                  <span>{ach.date}</span>
                </div>
              </div>

              <p
                className="
                    text-sm
                    md:text-base
                    mt-2
                  "
              >
                {ach.organization}
              </p>

              <p
                className="
                    text-sm
                    md:text-base
                    text-secondary
                    leading-relaxed
                    pt-0.5
                  "
              >
                {ach.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
