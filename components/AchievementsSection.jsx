'use client';

import React from 'react';
import { FiAward, FiCalendar } from 'react-icons/fi';

export function AchievementsSection({ achievements = [], cardClass = '' }) {
  if (!achievements || achievements.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-secondary">
        Honors & Achievements
      </h3>

      <div className="space-y-2.5">
        {achievements.map((ach) => (
          <div
            key={ach.id}
            className={`p-4 rounded-xl border border-subtle bg-glass hover:bg-surface-panel transition-colors flex items-start gap-3.5 ${cardClass}`}
          >
            <div className="p-2.5 rounded-xl bg-warning-soft text-warning shrink-0 mt-0.5">
              <FiAward className="w-4 h-4" />
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <h4 className="text-sm font-bold text-primary">{ach.title}</h4>
                <div className="flex items-center gap-1 text-[11px] text-muted font-mono">
                  <FiCalendar className="w-3 h-3" />
                  <span>{ach.date}</span>
                </div>
              </div>
              <p className="text-xs font-medium text-warning/90">{ach.organization}</p>
              <p className="text-xs text-secondary leading-relaxed pt-0.5">
                {ach.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
