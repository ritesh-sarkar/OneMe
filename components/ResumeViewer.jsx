"use client";

import React from "react";
import { FiDownload, FiFileText } from "react-icons/fi";

export function ResumeViewer({ resume, user, cardClass = "" }) {
  if (!resume || (!resume.fileUrl && !resume.summary)) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-base md:text-lg font-semibold uppercase tracking-wider text-secondary">
        Professional Resume
      </h3>

      <div
        className={`p-5 rounded-2xl border border-subtle bg-glass backdrop-blur-md ${cardClass}`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-3 rounded-xl bg-accent-soft text-accent shrink-0">
              <FiFileText className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm md:text-base font-bold text-text-primary">
                {resume.fileName || `${user?.name || "Profile"} — resume summary`}
              </h4>
              {(resume.fileSize || resume.updatedAt) && (
                <div className="flex items-center gap-2 text-xs md:text-sm text-secondary mt-0.5 font-mono">
                  {resume.fileSize && <span>{resume.fileSize}</span>}
                  {resume.fileSize && resume.updatedAt && <span aria-hidden="true">•</span>}
                  {resume.updatedAt && <span>Updated {resume.updatedAt}</span>}
                </div>
              )}
            </div>
          </div>

          {resume.fileUrl && (
            <a
              href={resume.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-base btn-outline inline-flex shrink-0 items-center gap-2 text-sm"
            >
              <FiDownload className="h-4 w-4" />
              View or download resume
            </a>
          )}
        </div>

        {resume.summary && (
          <p className="mt-4 border-t border-subtle pt-3 text-sm md:text-base leading-relaxed text-secondary whitespace-pre-line">
            {resume.summary}
          </p>
        )}
      </div>
    </div>
  );
}
