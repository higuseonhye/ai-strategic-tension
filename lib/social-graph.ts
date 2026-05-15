import type { ChatMessage, RoomState } from "./types";

const MAX_EDGES = 48;

function keyOf(fromId: string, toId: string) {
  return `${fromId}\t${toId}`;
}

function upsertEdge(room: RoomState, fromId: string, toId: string, dTrust: number, dInfl: number) {
  if (!room.socialGraph) room.socialGraph = [];
  const g = room.socialGraph;
  const k = keyOf(fromId, toId);
  const idx = g.findIndex((e) => keyOf(e.fromId, e.toId) === k);
  const clampT = (n: number) => Math.max(-100, Math.min(100, n));
  const clampI = (n: number) => Math.max(0, Math.min(100, n));
  const now = Date.now();
  if (idx >= 0) {
    const e = g[idx]!;
    e.trust = clampT(e.trust + dTrust);
    e.influence = clampI(e.influence + dInfl);
    e.at = now;
  } else {
    g.push({
      fromId,
      toId,
      trust: clampT(dTrust),
      influence: clampI(dInfl),
      at: now,
    });
    if (g.length > MAX_EDGES) {
      g.sort((a, b) => a.at - b.at);
      g.splice(0, g.length - MAX_EDGES);
    }
  }
}

/** Heuristic updates from a public or whisper line (cheap, explainable rules). */
export function recordSocialSignalFromMessage(room: RoomState, msg: ChatMessage) {
  if (!room.socialGraph) room.socialGraph = [];
  const others = room.players.filter((p) => p.id !== msg.playerId);
  if (others.length === 0) return;

  if (msg.toPlayerId) {
    upsertEdge(room, msg.playerId, msg.toPlayerId, 7, 6);
    upsertEdge(room, msg.toPlayerId, msg.playerId, 2, 3);
    return;
  }

  const recent = room.messages
    .filter((m) => m.id !== msg.id && m.playerId !== msg.playerId && !m.toPlayerId)
    .slice(-6)
    .reverse()[0];
  if (recent && Date.now() - recent.at < 180_000) {
    upsertEdge(room, msg.playerId, recent.playerId, 3, 2);
    upsertEdge(room, recent.playerId, msg.playerId, 1, 1);
  }

  if (room.players.find((p) => p.id === msg.playerId)?.isAi) {
    const humans = room.players.filter((p) => !p.isAi);
    const h = humans[Math.floor(Math.random() * humans.length)];
    if (h) upsertEdge(room, h.id, msg.playerId, -1, 4);
  }
}

/** Pressure from GM events: random directed strain involving at least one human. */
export function recordSocialSignalOnEvent(room: RoomState) {
  if (!room.socialGraph) room.socialGraph = [];
  const humans = room.players.filter((p) => !p.isAi);
  const ais = room.players.filter((p) => p.isAi);
  if (humans.length === 0) return;
  const a = humans[Math.floor(Math.random() * humans.length)]!;
  const pool = ais.length ? [...humans, ...ais] : humans;
  const candidates = pool.filter((p) => p.id !== a.id);
  if (candidates.length === 0) return;
  const b = candidates[Math.floor(Math.random() * candidates.length)]!;
  upsertEdge(room, a.id, b.id, -4, 5);
  upsertEdge(room, b.id, a.id, -2, 3);
}
