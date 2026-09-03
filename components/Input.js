"use client";

import React, { forwardRef } from "react";
import { cn } from "@/libs/utils";

export const Input = forwardRef(function Input(
  {
    className,
    type = "text",
    label,
    error,
    helperText,
    icon: Icon,
    iconRight: IconRight,
    ...props
  },
  ref,
) {
  return (
    <div className="w-full space-y-1.5">
      {label && <label className="form-label">{label}</label>}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 text-secondary pointer-events-none">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          type={type}
          ref={ref}
          className={cn(
            "input-base placeholder:text-muted focus:outline-none disabled:cursor-not-allowed",
            Icon && "pl-10",
            IconRight && "pr-10",
            error && "input-error",
            className,
          )}
          {...props}
        />
        {IconRight && (
          <div className="absolute right-3.5 text-secondary">{IconRight}</div>
        )}
      </div>
      {error && <p className="form-error-text">{error}</p>}
      {helperText && !error && <p className="form-help-text">{helperText}</p>}
    </div>
  );
});

export const Textarea = forwardRef(function Textarea(
  { className, label, error, helperText, rows = 3, ...props },
  ref,
) {
  return (
    <div className="w-full space-y-1.5">
      {label && <label className="form-label">{label}</label>}
      <textarea
        rows={rows}
        ref={ref}
        className={cn(
          "textarea-base placeholder:text-muted focus:outline-none disabled:cursor-not-allowed",
          error && "input-error",
          className,
        )}
        {...props}
      />
      {error && <p className="form-error-text">{error}</p>}
      {helperText && !error && <p className="form-help-text">{helperText}</p>}
    </div>
  );
});
