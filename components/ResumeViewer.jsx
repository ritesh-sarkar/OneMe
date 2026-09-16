"use client";

import React from "react";

//icons
import { FiFileText, FiDownload } from "react-icons/fi";

// Custom Components and libs
import { Button } from "@/components/Button";
import { useToast } from "@/context/ToastContext";

export function ResumeViewer({ resume, user, cardClass = "" }) {
  const { success } = useToast();

  const [downloading, setDownloading] = React.useState(false);

  const handleDownload = () => {
    setDownloading(true);

    setTimeout(() => {
      // Create a mock downloadable resume text/html representation
      const content = `=====================================================

${(user?.name || "JOHN DOE").toUpperCase()} — CURRICULUM VITAE

${user?.title || "Full-Stack Developer"} | ${user?.location || "New York, USA"}

Email: ${user?.email || "john.doe@example.com"} | Phone: ${
        user?.phone || "+1 555-123-4567"
      }

OneMe Profile: https://oneme.app/@${user?.username || "john-doe"}

=====================================================

EXECUTIVE SUMMARY:

${
  resume?.summary ||
  "Experienced Full-Stack Developer specialized in Next.js, React, Node.js, and modern distributed web architectures."
}

SKILLS:

JavaScript (ESNext), React, Next.js, Node.js, Tailwind CSS, Express, MongoDB, REST APIs, Git, Docker, System Design.

EDUCATION:

Bachelor of Science in Computer Science & Engineering

State University | CGPA: 3.85 / 4.00

EXPERIENCE:

1. Lead Frontend Engineer — Digital Solutions Inc. (2023 — Present)

2. Full-Stack Developer — CodeCraft Labs (2021 — 2023)

CERTIFICATIONS:

- Meta Front-End Developer Professional Certificate (Coursera)

- AWS Certified Cloud Practitioner (Amazon Web Services)

=====================================================`;

      const blob = new Blob([content], {
        type: "text/plain;charset=utf-8;",
      });

      const link = document.createElement("a");

      link.href = URL.createObjectURL(blob);

      link.download = `${(user?.name || "John_Doe").replace(
        /\s+/g,
        "_",
      )}_Resume.txt`;

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      URL.revokeObjectURL(link.href);

      setDownloading(false);

      success("Resume file downloaded successfully!", "Resume Downloaded");
    }, 600);
  };

  if (!resume) {
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
        Professional Resume
      </h3>

      <div
        className={`
          p-5
          rounded-2xl
          border
          border-subtle
          bg-glass
          backdrop-blur-md
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
            gap-4
          "
        >
          <div
            className="
              flex
              items-start
              gap-3.5
            "
          >
            <div
              className="
                p-3
                rounded-xl
                bg-accent-soft
                text-accent
                shrink-0
              "
            >
              <FiFileText
                className="
                  w-6
                  h-6
                "
              />
            </div>

            <div>
              <h4
                className="
                  text-sm
                  md:text-base
                  font-bold
                  text-text-primary
                "
              >
                {resume.fileName || `${user?.name || "John Doe"}_Resume.pdf`}
              </h4>

              <div
                className="
                  flex
                  items-center
                  gap-2
                  text-xs
                  md:text-sm
                  text-secondary
                  mt-0.5
                  font-mono
                "
              >
                <span>{resume.fileSize || "1.4 MB"}</span>

                <span>•</span>

                <span>Updated {resume.updatedAt || "Recent"}</span>
              </div>
            </div>
          </div>

          <Button
            onClick={handleDownload}
            isLoading={downloading}
            variant="outline"
            size="sm"
            icon={FiDownload}
            className="
              shrink-0
              text-sm
              md:text-base
              transition-all
              duration-200
              ease-in-out
              hover:scale-102
              hover:tracking-wider
              hover:border-accent/40
              active:scale-95
            "
          >
            Download Resume
          </Button>
        </div>

        {resume.summary && (
          <div
            className="
              mt-4
              pt-3
              border-t
              border-subtle
            "
          >
            <p
              className="
                text-sm
                md:text-base
                text-secondary
                leading-relaxed
                italic
              "
            >
              &ldquo;
              {resume.summary}
              &rdquo;
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
