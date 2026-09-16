"use client";

import React from "react";

import {
  FiAward,
  FiExternalLink,
  FiCheckCircle,
} from "react-icons/fi";

import { Badge } from "@/components/Badge";

export function CertificationsSection({
  certifications = [],
  cardClass = "",
}) {
  if (
    !certifications ||
    certifications.length === 0
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
        Licenses & Certifications
      </h3>

      <div
        className="
          grid
          grid-cols-1
          md:grid-cols-2
          gap-3
        "
      >
        {certifications.map(
          (cert) => (
            <div
              key={cert.id}
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
                flex
                flex-col
                justify-between
                ${cardClass}
              `}
            >
              <div
                className="
                  space-y-1.5
                "
              >
                <div
                  className="
                    flex
                    items-start
                    justify-between
                    gap-2
                  "
                >
                  <div
                    className="
                      p-2
                      rounded-lg
                      bg-accent-soft
                      text-accent
                      shrink-0
                    "
                  >
                    <FiAward
                      className="
                        w-4
                        h-4
                      "
                    />
                  </div>

                  {cert.badge && (
                    <Badge
                      variant="indigo"
                      size="sm"
                      className="
                        text-sm
                        md:text-base
                      "
                    >
                      {cert.badge}
                    </Badge>
                  )}
                </div>

                <h4
                  className="
                    text-base
                    md:text-lg
                    font-bold
                    text-text-primary
                    pt-1
                    mb-4
                  "
                >
                  {cert.name}
                </h4>

                <p
                  className="
                    text-sm
                    md:text-base
                    text-secondary
                    font-semibold
                    mb-2
                  "
                >
                  {cert.issuer}
                </p>
              </div>

              <div
                className="
                  flex
                  items-center
                  justify-between
                  pt-3
                  mt-2
                  border-t
                  border-subtle
                  text-sm
                  md:text-base
                  text-tertiary
                  font-mono
                  italic
                "
              >
                <span>
                  Issued {cert.issueDate}
                </span>

                {cert.verifyUrl && (
                  <a
                    href={cert.verifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="
                      inline-flex
                      items-center
                      text-sm
                      md:text-base
                      gap-1
                      text-accent
                      font-medium
                      transition-all
                      duration-200
                      ease-in-out
                      hover:gap-1.5
                      active:scale-95
                      hover:text-accent
                      hover:tracking-wide
                    "
                  >
                    <span>
                      Verify
                    </span>

                    <FiExternalLink
                      className="
                        w-3
                        h-3
                      "
                    />
                  </a>
                )}
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  );
}