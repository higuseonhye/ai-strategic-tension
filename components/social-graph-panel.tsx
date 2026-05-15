"use client";

import type { RoomState } from "@/lib/types";

function nameOf(room: RoomState, id: string) {
  return room.players.find((p) => p.id === id)?.name ?? id.slice(0, 6);
}

export function SocialGraphPanel({ room }: { room: RoomState }) {
  const edges = [...(room.socialGraph ?? [])].sort(
    (a, b) => Math.abs(b.trust) + b.influence - (Math.abs(a.trust) + a.influence)
  );

  return (
    <div className="rounded-xl border border-white/10 bg-card/50 p-4">
      <h3 className="text-[10px] font-medium uppercase tracking-[0.22em] text-mutedForeground">
        Trust / influence (heuristic)
      </h3>
      <p className="mt-1 text-[11px] leading-relaxed text-mutedForeground">
        Directed edges tighten from whispers, reply chains, GM events, and synthetic
        lines. Not a scoreboard — a pressure sketch.
      </p>
      {edges.length === 0 ? (
        <p className="mt-3 text-xs text-mutedForeground/80">No edges yet. Speak, whisper, or inject an event.</p>
      ) : (
        <ul className="mt-3 max-h-40 space-y-2 overflow-y-auto text-xs">
          {edges.slice(0, 12).map((e) => (
            <li
              key={`${e.fromId}-${e.toId}-${e.at}`}
              className="flex flex-wrap items-baseline justify-between gap-2 border-b border-white/5 pb-2 last:border-0"
            >
              <span className="text-foreground/90">
                {nameOf(room, e.fromId)}
                <span className="text-mutedForeground"> → </span>
                {nameOf(room, e.toId)}
              </span>
              <span className="font-mono text-[10px] text-mutedForeground">
                T{e.trust >= 0 ? "+" : ""}
                {e.trust} · I{e.influence}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
