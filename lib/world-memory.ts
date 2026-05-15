import type { RoomState } from "./types";
import type { PlayerLegacyEntry, WorldMetrics, WorldTimelineEvent } from "./world-types";
import { DEFAULT_WORLD_METRICS } from "./world-types";
import { buildWorldTimelineEvent } from "./world-outcome";

type GlobalWorld = {
  metrics: WorldMetrics;
  events: WorldTimelineEvent[];
  sessionSeq: number;
  legacy: Map<string, PlayerLegacyEntry>;
};

declare global {
  var __ATE_WORLD__: GlobalWorld | undefined;
}

function world(): GlobalWorld {
  if (!globalThis.__ATE_WORLD__) {
    globalThis.__ATE_WORLD__ = {
      metrics: { ...DEFAULT_WORLD_METRICS },
      events: [],
      sessionSeq: 1841,
      legacy: new Map(),
    };
  }
  return globalThis.__ATE_WORLD__;
}

export function getWorldMetrics(): WorldMetrics {
  return { ...world().metrics };
}

export function getWorldTimeline(limit = 80): WorldTimelineEvent[] {
  const ev = world().events;
  return ev.slice(-limit).reverse();
}

export function getPlayerLegacyList(limit = 40): PlayerLegacyEntry[] {
  return [...world().legacy.values()]
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, limit);
}

function clampMetric(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

export function applyDeltasToMemory(deltas: Partial<WorldMetrics>) {
  const w = world();
  (Object.keys(deltas) as (keyof WorldMetrics)[]).forEach((k) => {
    const d = deltas[k];
    if (typeof d === "number") {
      w.metrics[k] = clampMetric(w.metrics[k] + d);
    }
  });
}

const TAG_POOL = [
  "Alliance Architect",
  "Ruthless Negotiator",
  "Stability Defender",
  "Chaos Opportunist",
  "Ethical Dissenter",
  "Silent Manipulator",
  "Consensus Builder",
] as const;

function tagFromStyle(style: string): string {
  const s = style.toLowerCase();
  if (s.includes("aggressive")) return "Ruthless Negotiator";
  if (s.includes("reserved")) return "Silent Manipulator";
  if (s.includes("balanced")) return "Consensus Builder";
  const idx = style.length % TAG_POOL.length;
  return TAG_POOL[idx];
}

function playerKey(name: string): string {
  const n = name.trim().toLowerCase().slice(0, 24);
  let h = 0;
  for (let i = 0; i < n.length; i++) h = (h * 31 + n.charCodeAt(i)) >>> 0;
  return `p_${h.toString(16)}`;
}

export function bumpPlayerLegacyFromReflection(room: RoomState) {
  const w = world();
  const ref = room.reflection;
  if (!ref) return;
  for (const row of ref.perPlayer) {
    const key = playerKey(row.playerName);
    const tag = tagFromStyle(row.style);
    const prev = w.legacy.get(key);
    const tags = new Set(prev?.tags ?? []);
    tags.add(tag);
    let arr = [...tags];
    if (arr.length > 4) arr = arr.slice(-4);
    w.legacy.set(key, {
      playerKey: key,
      displayHint: `${row.playerName.slice(0, 2)}·${row.playerName.slice(-1)}`,
      tags: arr,
      sessionsPlayed: (prev?.sessionsPlayed ?? 0) + 1,
      lastContribution: { publicTrust: 1 },
      updatedAt: Date.now(),
    });
  }
}

/** Called when host commits irreversible decision (reflection phase begins). */
export function recordSessionInWorldMemory(room: RoomState): WorldTimelineEvent {
  const w = world();
  w.sessionSeq += 1;
  const ev = buildWorldTimelineEvent({
    sessionIndex: w.sessionSeq,
    sessionCode: room.code,
    scenarioId: room.scenarioId,
    interactionMode: room.interactionMode ?? "crisis",
    finalChoice: room.finalChoice ?? "?",
    tensionTerminal: room.tension,
  }) as WorldTimelineEvent;

  applyDeltasToMemory(ev.deltas);
  w.events.push(ev);
  if (w.events.length > 500) w.events.splice(0, w.events.length - 500);
  return ev;
}
