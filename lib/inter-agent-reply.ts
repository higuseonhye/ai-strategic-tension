import { appendMessage, getRoom } from "./store";
import { generateInterAgentLine } from "./ai";
import { shortId } from "./utils";

const MIN_GAP_MS = 4500;

/** Synthetic seats spar without a human line (solo / hybrid), throttled. */
export function queueInterAgentBanterIfNeeded(code: string, chance = 0.38) {
  const room = getRoom(code);
  if (!room || room.phase === "reflection" || room.phase === "lobby") return;
  if (room.interactionMode !== "solo" && room.interactionMode !== "hybrid") return;
  const ais = room.players.filter((p) => p.isAi);
  if (ais.length < 2) return;
  if (Math.random() > chance) return;

  const now = Date.now();
  if ((room.lastInterAgentAt ?? 0) + MIN_GAP_MS > now) return;
  room.lastInterAgentAt = now;

  const shuffled = [...ais].sort(() => Math.random() - 0.5);
  const first = shuffled[0]!;
  const second = shuffled[1]!;

  void (async () => {
    const live = getRoom(code);
    if (!live || live.phase === "reflection") return;
    if (live.interactionMode !== "solo" && live.interactionMode !== "hybrid") return;
    const t1 = await generateInterAgentLine(live, first.id, second.id, "open");
    if (t1.trim()) {
      appendMessage(code, {
        id: shortId(),
        at: Date.now(),
        playerId: first.id,
        playerName: first.name,
        text: t1.slice(0, 600),
      });
    }
    await new Promise((r) => setTimeout(r, 950));
    const live2 = getRoom(code);
    if (!live2 || live2.phase === "reflection") return;
    if (live2.interactionMode !== "solo" && live2.interactionMode !== "hybrid") return;
    const t2 = await generateInterAgentLine(live2, second.id, first.id, "counter");
    if (t2.trim()) {
      appendMessage(code, {
        id: shortId(),
        at: Date.now(),
        playerId: second.id,
        playerName: second.name,
        text: t2.slice(0, 600),
      });
    }
  })();
}
