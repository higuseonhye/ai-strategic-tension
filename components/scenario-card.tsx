"use client";

import { Badge } from "@/components/ui/badge";
import type { Scenario } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ScenarioCard({
  scenario,
  selected,
  onSelect,
}: {
  scenario: Scenario;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      style={{
        ["--accent" as string]: `hsl(${scenario.accentHue})`,
      }}
      className={cn(
        "group relative flex h-full w-full flex-col gap-3 overflow-hidden rounded-xl border bg-card/80 p-5 text-left transition-all",
        selected
          ? "border-[var(--accent)] shadow-[0_0_0_1px_var(--accent),0_0_40px_-12px_var(--accent)]"
          : "border-white/10 hover:border-white/25"
      )}
    >
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-30 blur-3xl transition group-hover:opacity-50"
        style={{ background: "var(--accent)" }}
      />
      <div className="flex items-center justify-between">
        <Badge tone="muted">Scenario</Badge>
        {selected && <Badge tone="accent">Selected</Badge>}
      </div>
      <h3 className="text-xl font-semibold tracking-tight">{scenario.title}</h3>
      <p className="text-sm italic text-mutedForeground">{scenario.tagline}</p>
      <p className="text-sm leading-relaxed text-foreground/90">{scenario.premise}</p>
      <div className="mt-auto flex flex-wrap gap-2 pt-2">
        {scenario.roles.slice(0, 4).map((r) => (
          <span
            key={r.id}
            className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-0.5 text-[10px] uppercase tracking-[0.12em] text-mutedForeground"
          >
            {r.archetype}
          </span>
        ))}
        {scenario.roles.length > 4 && (
          <span className="text-[10px] uppercase tracking-[0.12em] text-mutedForeground">
            +{scenario.roles.length - 4} more
          </span>
        )}
      </div>
    </button>
  );
}
