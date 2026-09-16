"use client";

import React from "react";
import { motion } from "framer-motion";

//icons
import {
  FiGithub,
  FiExternalLink,
  FiStar,
  FiActivity,
} from "react-icons/fi";

//Custom Components and libs
import { Badge } from "@/components/Badge";

export function ProjectsGrid({
  projects = [],
  cardClass = "",
}) {
  if (
    !projects ||
    projects.length === 0
  ) {
    return null;
  }

  return (
    <div
      className="
        space-y-4
      "
    >
      <div
        className="
          flex
          items-center
          justify-between
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
          Featured Projects
        </h3>

        <span
          className="
            text-sm
            md:text-base
            text-tertiary
            font-mono
          "
        >
          {projects.length} showcase
          {projects.length !== 1
            ? "s"
            : ""}
        </span>
      </div>

      <div
        className="
          grid
          grid-cols-1
          gap-4
        "
      >
        {projects.map(
          (project) => (
            <motion.div
              key={project.id}
              whileHover={{
                y: -2,
              }}
              className={`
                group
                rounded-2xl
                border
                border-subtle
                bg-glass
                overflow-hidden
                transition-all
                duration-300
                hover:border-light
                backdrop-blur-md
                flex
                flex-col
                md:flex-row
                ${cardClass}
              `}
            >
              {/* Project Image */}
              {project.image && (
                <div
                  className="
                    md:w-48
                    h-40
                    md:h-auto
                    shrink-0
                    relative
                    overflow-hidden
                    bg-surface-dark
                  "
                >
                  <img
                    src={project.image}
                    alt={project.title}
                    className="
                      w-full
                      h-full
                      object-cover
                      group-hover:scale-105
                      transition-transform
                      duration-500
                    "
                  />

                  <div
                    className="
                      absolute
                      inset-0
                      bg-linear-to-t
                      from-black/80
                      via-transparent
                      to-transparent
                      md:hidden
                    "
                  />
                </div>
              )}

              {/* Project Info */}
              <div
                className="
                  p-5
                  flex-1
                  flex
                  flex-col
                  justify-between
                "
              >
                <div
                  className="
                    space-y-2
                  "
                >
                  <div
                    className="
                      flex
                      items-start
                      justify-between
                      gap-3
                    "
                  >
                    <h4
                      className="
                        text-base
                        md:text-lg
                        font-bold
                        text-primary
                        group-hover:text-accent
                        transition-colors
                      "
                    >
                      {project.title}
                    </h4>


                    {project.status && (
                      <Badge
                        variant="indigo"
                        size="sm"
                        className="
                          shrink-0
                          text-xs
                          md:text-sm
                        "
                      >
                        {project.status}
                      </Badge>
                    )}
                  </div>


                  <p
                    className="
                      text-sm
                      md:text-base
                      text-secondary
                      leading-relaxed
                    "
                  >
                    {project.description}
                  </p>


                  {/* Tech Tags */}
                  {project.technologies && (
                    <div
                      className="
                        flex
                        flex-wrap
                        gap-1.5
                        pt-1
                      "
                    >
                      {project.technologies.map(
                        (
                          tech,
                          i,
                        ) => (
                          <span
                            key={i}
                            className="
                              px-2
                              py-0.5
                              rounded-md
                              text-xs
                              md:text-sm
                              font-medium
                              bg-glass-soft
                              text-secondary
                              border
                              border-subtle
                            "
                          >
                            {tech}
                          </span>
                        ),
                      )}
                    </div>
                  )}
                </div>

                {/* Footer Links & Stats */}
                <div
                  className="
                    flex
                    items-center
                    justify-between
                    pt-4
                    mt-2
                    border-t
                    border-subtle
                  "
                >
                  <div
                    className="
                      flex
                      items-center
                      gap-3
                      text-xs
                      md:text-sm
                      text-secondary
                      font-mono
                    "
                  >
                    {project.metrics && (
                      <span
                        className="
                          flex
                          items-center
                          gap-1
                          text-success
                        "
                      >
                        <FiActivity
                          className="
                            w-3
                            h-3
                          "
                        />

                        {project.metrics}
                      </span>
                    )}

                    {project.stars && (
                      <span
                        className="
                          flex
                          items-center
                          gap-1
                          text-warning
                        "
                      >
                        <FiStar
                          className="
                            w-3
                            h-3
                            fill-warning-soft
                          "
                        />

                        {project.stars}
                      </span>
                    )}
                  </div>

                  <div
                    className="
                      flex
                      items-center
                      gap-2
                    "
                  >
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="
                          p-2
                          rounded-lg
                          bg-glass-soft
                          text-text-secondary
                          transition-all
                          duration-200
                          ease-in-out
                          hover:bg-glass-soft
                          hover:text-text-primary
                          hover:scale-105
                          active:scale-95
                        "
                        title="View GitHub Repository"
                      >
                        <FiGithub
                          className="
                            w-4
                            h-4
                          "
                        />
                      </a>
                    )}

                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="
                          inline-flex
                          items-center
                          gap-1
                          px-3
                          py-1.5
                          rounded-lg
                          bg-accent/90
                          text-primary
                          text-xs
                          md:text-sm
                          font-semibold
                          glow-indigo
                          transition-all
                          duration-200
                          ease-in-out
                          hover:bg-accent
                          hover:tracking-wide
                          hover:gap-1.5
                          active:scale-95
                        "
                      >
                        <span>
                          Live Demo
                        </span>

                        <FiExternalLink
                          className="
                            w-3.5
                            h-3.5
                          "
                        />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ),
        )}
      </div>
    </div>
  );
}