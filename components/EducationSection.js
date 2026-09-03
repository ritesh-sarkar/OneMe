'use client';

import React from 'react';
import { FiBookOpen, FiMapPin, FiAward } from 'react-icons/fi';

export function EducationSection({ education = [], cardClass = '' }) {
  if (!education || education.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-secondary">
        Education & Academics
      </h3>

      <div className="space-y-3">
        {education.map((edu) => (
          <div
            key={edu.id}
            className={`p-4 rounded-xl border border-subtle bg-glass hover:bg-surface-panel transition-colors ${cardClass}`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <h4 className="text-sm font-bold text-primary flex items-center gap-2">
                <FiBookOpen className="w-4 h-4 text-accent" />
                {edu.institution}
              </h4>
              <span className="text-xs text-accent font-mono">{edu.period}</span>
            </div>

            <p className="text-xs font-semibold text-secondary mt-1">{edu.degree}</p>

            <div className="flex items-center gap-3 text-xs text-secondary mt-1">
              {edu.location && (
                <span className="flex items-center gap-1">
                  <FiMapPin className="w-3 h-3" />
                  {edu.location}
                </span>
              )}
              {edu.grade && (
                <span className="flex items-center gap-1 text-success font-medium">
                  <FiAward className="w-3 h-3" />
                  {edu.grade}
                </span>
              )}
            </div>

            {edu.description && (
              <p className="text-xs text-secondary mt-2 leading-relaxed">
                {edu.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
