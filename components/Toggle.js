"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/libs/utils";

export function Toggle({
  checked = false,
  onChange,
  label,
  description,
  disabled = false,
  className,
}) {
  return (
    <label
      className={cn(
        "flex items-center justify-between gap-4 cursor-pointer select-none",
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
    >
      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <span className="text-sm font-medium text-primary">{label}</span>
          )}
          {description && (
            <span className="text-xs text-muted leading-relaxed">
              {description}
            </span>
          )}
        </div>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange && onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-surface-dark",
          checked ? "bg-accent" : "bg-surface-50",
        )}
      >
        <motion.span
          layout
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className={cn(
            "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg transform ring-0 transition duration-200 ease-in-out",
            checked ? "translate-x-5" : "translate-x-0",
          )}
        />
      </button>
    </label>
  );
}
