"use client";

import { Badge } from "@/components/ui/badge";
import type { TensionEvent } from "@/lib/types";
import { formatTime } from "@/lib/utils";

const kindLabel: Record<TensionEvent["kind"], string> = {
  destabilizer: "Destabilizer",
  leak: "Leak",
  ultimatum: "Ultimatum",
  reversal: "Reversal",
  "scarcity-spike": "Scarcity",
  "alliance-rupture": "Rupture",
};

const kindTone: Record<TensionEvent["kind"], "danger" | "accent" | "default"> = {
  destabilizer: "danger",
  leak: "accent",
  ultimatum: "danger",
  reversal: "accent",
  "scarcity-spike": "default",
  "alliance-rupture": "danger",
};

export function EventFeed({ events }: { events: TensionEvent[] }) {
  if (events.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-center text-xs uppercase tracking-[0.2em] text-mutedForeground">
        No events yet. The world is holding its breath.
      </div>
    );
  }
  return (
    <ol className="space-y-3">
      {[...events].reverse().map((e) => (
        <li
          key={e.id}
          className="animate-slideUp rounded-lg border border-white/10 bg-black/30 p-3"
        >
          <div className="mb-2 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Badge tone={kindTone[e.kind]}>{kindLabel[e.kind]}</Badge>
              <h4 className="text-sm font-semibold tracking-tight">{e.title}</h4>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-mutedForeground">
              Δ+{e.delta} · {formatTime(e.at)}
            </span>
          </div>
          <p className="text-sm leading-snug text-foreground/90">{e.body}</p>
          {e.hint && (
            <p className="mt-2 border-l-2 border-accent/40 pl-2 text-xs italic text-accent/90">
              {e.hint}
            </p>
          )}
        </li>
      ))}
    </ol>
  );
}
