"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/libs/utils";

export function Tabs({ tabs, activeTab, onChange, className }) {
  return (
    <div
      className={cn(
        "flex items-center gap-1 p-1 rounded-xl bg-surface-deep border border-subtle max-w-full overflow-x-auto scrollbar-none",
        className,
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "relative flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap select-none",
              isActive
                ? "text-primary"
                : "text-secondary hover:text-primary hover:bg-surface-panel/50",
            )}
          >
            {isActive && (
              <motion.div
                layoutId="activeTabBadge"
                className="absolute inset-0 rounded-lg bg-surface-panel border border-light shadow-sm"
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              {Icon && <Icon className="w-3.5 h-3.5" />}
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={cn(
                    "px-1.5 py-0.2 rounded-full text-[10px] font-semibold",
                    isActive
                      ? "bg-glass-soft text-accent"
                      : "bg-surface-panel text-secondary",
                  )}
                >
                  {tab.count}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
