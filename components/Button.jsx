"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/libs/utils";

export function Button({
  children,
  className,
  variant = "primary", // 'primary' | 'secondary' | 'outline' | 'ghost' | 'glow' | 'danger'
  size = "md", // 'sm' | 'md' | 'lg' | 'icon'
  disabled = false,
  isLoading = false,
  onClick,
  type = "button",
  icon: Icon,
  iconRight: IconRight,
  ...props
}) {
  const baseStyles =
    "btn-base focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface-dark select-none disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none";

  const variants = {
    primary: "btn-primary focus:ring-0 focus:ring-offset-0 active:scale-0.85",

    secondary: "btn-secondary active:scale-0.85",

    outline: "btn-outline focus:ring-0 focus:ring-offset-0 active:scale-0.85",

    ghost: "btn-ghost focus:ring-0 focus:ring-offset-0",

    glow: "btn-glow active:scale-0.85",

    danger: "btn-danger focus:ring-0 focus:ring-offset-0",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-6 py-3 text-base gap-2.5 font-semibold",
    icon: "p-2 text-base shrink-0 aspect-square",
  };

  return (
    <motion.button
      type={type}
      whileTap={disabled || isLoading ? undefined : { scale: 0.98 }}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}
      <span>{children}</span>
      {IconRight && !isLoading && <IconRight className="w-4 h-4 shrink-0" />}
    </motion.button>
  );
}
