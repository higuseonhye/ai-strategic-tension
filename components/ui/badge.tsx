import * as React from "react";
import { cn } from "@/lib/utils";

type Tone = "default" | "danger" | "accent" | "success" | "muted";

export function Badge({
  className,
  tone = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  const tones: Record<Tone, string> = {
    default: "bg-white/10 text-foreground",
    danger: "bg-danger/15 text-danger",
    accent: "bg-accent/15 text-accent",
    success: "bg-success/15 text-success",
    muted: "bg-white/5 text-mutedForeground",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider",
        tones[tone],
        className
      )}
      {...props}
    />
  );
}
