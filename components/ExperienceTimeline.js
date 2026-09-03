'use client';

import React from 'react';
import { FiBriefcase, FiCalendar, FiMapPin, FiCheckCircle } from 'react-icons/fi';

export function ExperienceTimeline({ experience = [], cardClass = '' }) {
  if (!experience || experience.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-secondary">
        Work Experience
      </h3>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-surface-panel">
        {experience.map((exp) => (
          <div key={exp.id} className="relative group">
            {/* Timeline dot */}
            <div className="absolute -left-6 top-1.5 w-3.5 h-3.5 rounded-full bg-surface-dark border-2 border-accent group-hover:bg-accent transition-colors" />

            <div className={`p-4 rounded-xl border border-subtle bg-glass hover:bg-surface-panel transition-colors ${cardClass}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <h4 className="text-sm font-bold text-primary">{exp.role}</h4>
                <div className="flex items-center gap-1.5 text-xs text-accent font-mono">
                  <FiCalendar className="w-3 h-3" />
                  <span>{exp.period}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-secondary mt-1">
                <span className="font-medium text-secondary">{exp.company}</span>
                {exp.location && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <FiMapPin className="w-2.5 h-2.5" />
                      {exp.location}
                    </span>
                  </>
                )}
              </div>

              {exp.description && (
                <p className="text-xs text-secondary mt-2.5 leading-relaxed">
                  {exp.description}
                </p>
              )}

              {exp.highlights && exp.highlights.length > 0 && (
                <ul className="mt-2.5 space-y-1.5">
                  {exp.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-secondary">
                      <FiCheckCircle className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
