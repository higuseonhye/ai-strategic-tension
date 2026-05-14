"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "default" | "ghost" | "outline" | "danger" | "subtle" | "accent";
type Size = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantClasses: Record<Variant, string> = {
  default:
    "bg-primary text-primaryForeground hover:bg-primary/90 shadow-[0_0_24px_-8px_rgba(245,76,50,0.6)]",
  ghost: "bg-transparent hover:bg-white/5 text-foreground",
  outline:
    "border border-white/10 bg-white/0 hover:bg-white/5 text-foreground",
  danger:
    "bg-danger text-white hover:bg-danger/90",
  subtle:
    "bg-white/5 text-foreground hover:bg-white/10",
  accent:
    "bg-accent text-black hover:bg-accent/90",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md font-medium tracking-tight transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:cursor-not-allowed disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    />
  )
);
Button.displayName = "Button";
