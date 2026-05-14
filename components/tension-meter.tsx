"use client";

import { cn } from "@/lib/utils";
import { tensionLabel } from "@/lib/utils";

const toneColor: Record<string, string> = {
  low: "from-tension-low to-tension-mid",
  mid: "from-tension-mid to-tension-high",
  high: "from-tension-high to-tension-critical",
  critical: "from-tension-critical to-tension-high",
};

const toneDot: Record<string, string> = {
  low: "bg-tension-low",
  mid: "bg-tension-mid",
  high: "bg-tension-high",
  critical: "bg-tension-critical animate-pulseGlow",
};

export function TensionMeter({ value, compact }: { value: number; compact?: boolean }) {
  const { label, tone } = tensionLabel(value);
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("w-full", compact ? "space-y-1" : "space-y-2")}>
      <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-mutedForeground">
        <span className="flex items-center gap-2">
          <span className={cn("h-2 w-2 rounded-full", toneDot[tone])} />
          Tension
        </span>
        <span className="font-mono text-foreground">
          {Math.round(pct)}
          <span className="text-mutedForeground">/100</span> · {label}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
        <div
          className={cn(
            "h-full rounded-full bg-gradient-to-r transition-[width] duration-700 ease-out",
            toneColor[tone]
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
