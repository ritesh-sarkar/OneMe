"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/libs/utils";

export function Card({
  children,
  className,
  variant = "default", // 'default' | 'glass' | 'subtle' | 'interactive'
  hover = false,
  onClick,
  ...props
}) {
  const variants = {
    default: "card-default backdrop-blur-md",
    glass: "card-glass backdrop-blur-xl",
    subtle: "bg-surface-dark/50 border-subtle border",
    interactive: "card-interactive",
  };

  const Component = hover || onClick ? motion.div : "div";
  const motionProps =
    hover || onClick
      ? {
          whileHover: { y: -2, transition: { duration: 0.2 } },
          whileTap: onClick ? { scale: 0.99 } : undefined,
        }
      : {};

  return (
    <Component
      onClick={onClick}
      className={cn(
        "rounded-2xl p-6 text-primary",
        variants[variant],
        className,
      )}
      {...motionProps}
      {...props}
    >
      {children}
    </Component>
  );
}

export function CardHeader({ children, className, ...props }) {
  return (
    <div className={cn("flex flex-col space-y-1.5 pb-4", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className, ...props }) {
  return (
    <h3
      className={cn(
        "text-lg font-semibold tracking-tight text-brand-primary",
        className,
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({ children, className, ...props }) {
  return (
    <p
      className={cn("text-sm text-secondary leading-relaxed", className)}
      {...props}
    >
      {children}
    </p>
  );
}

export function CardContent({ children, className, ...props }) {
  return (
    <div className={cn("pt-0", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className, ...props }) {
  return (
    <div
      className={cn("flex items-center pt-4 border-t border-subtle", className)}
      {...props}
    >
      {children}
    </div>
  );
}
