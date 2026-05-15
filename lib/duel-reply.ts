import { appendMessage, getRoom } from "./store";
import { generateDuelAdversaryLine } from "./ai";
import { shortId } from "./utils";

const MIN_GAP_MS = 2800;

/** After a human speaks in AI duel, optionally append an adversary line (async). */
export function queueDuelAdversaryReplyIfNeeded(code: string) {
  const room = getRoom(code);
  if (!room || room.phase === "reflection" || room.phase === "lobby") return;
  if (room.interactionMode !== "duel" || !room.aiOpponentEnabled) return;
  const ai = room.players.find((p) => p.isAi);
  if (!ai) return;

  const now = Date.now();
  if ((room.lastAiReplyAt ?? 0) + MIN_GAP_MS > now) return;
  room.lastAiReplyAt = now;

  void (async () => {
    const live = getRoom(code);
    if (!live || live.phase === "reflection") return;
    const text = await generateDuelAdversaryLine(live);
    if (!text.trim()) return;
    appendMessage(code, {
      id: shortId(),
      at: Date.now(),
      playerId: ai.id,
      playerName: ai.name,
      text: text.slice(0, 600),
    });
  })();
}
