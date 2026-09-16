"use client";

import React from "react";

import {
  FiBookOpen,
  FiMapPin,
  FiAward,
} from "react-icons/fi";

export function EducationSection({
  education = [],
  cardClass = "",
}) {
  if (
    !education ||
    education.length === 0
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
        Education & Academics
      </h3>

      <div
        className="
          space-y-3
        "
      >
        {education.map(
          (edu) => (
            <div
              key={edu.id}
              className={`
                p-4
                rounded-xl
                border
                border-subtle
                bg-glass
                hover:bg-surface-panel
                transition-all
                duration-200
                ease-in-out
                ${cardClass}
              `}
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
                    flex
                    items-center
                    gap-2
                  "
                >
                  <FiBookOpen
                    className="
                      w-4
                      h-4
                      text-accent
                    "
                  />

                  {edu.institution}
                </h4>

                <span
                  className="
                    text-xs
                    md:text-sm
                    text-accent
                    font-mono
                  "
                >
                  {edu.period}
                </span>
              </div>

              <p
                className="
                  text-sm
                  md:text-base
                  font-semibold
                  text-secondary
                  mt-1
                "
              >
                {edu.degree}
              </p>

              <div
                className="
                  flex
                  items-center
                  gap-3
                  text-xs
                  md:text-sm
                  text-secondary
                  mt-1
                "
              >
                {edu.location && (
                  <span
                    className="
                      flex
                      items-center
                      gap-1
                    "
                  >
                    <FiMapPin
                      className="
                        w-3
                        h-3
                      "
                    />

                    {edu.location}
                  </span>
                )}

                {edu.grade && (
                  <span
                    className="
                      flex
                      items-center
                      gap-1
                      text-success
                      font-medium
                    "
                  >
                    <FiAward
                      className="
                        w-3
                        h-3
                      "
                    />

                    {edu.grade}
                  </span>
                )}
              </div>

              {edu.description && (
                <p
                  className="
                    text-sm
                    md:text-base
                    text-secondary
                    mt-2
                    leading-relaxed
                  "
                >
                  {edu.description}
                </p>
              )}
            </div>
          ),
        )}
      </div>
    </div>
  );
}