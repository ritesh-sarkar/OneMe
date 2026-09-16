"use client";

import React from "react";
import { cn } from "@/libs/utils";

export function Badge({
  children,
  className,
  variant = "default", // 'default' | 'success' | 'warning' | 'indigo' | 'outline' | 'verified'
  size = "md",
  ...props
}) {
  const variants = {
    default: "badge-default",
    success: "badge-success",
    warning: "badge-warning",
    indigo: "badge-indigo",
    outline: "btn-outline text-secondary",
    verified: "badge-verified",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3.5 py-1.5 text-sm font-medium",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium tracking-wide transition-colors",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
