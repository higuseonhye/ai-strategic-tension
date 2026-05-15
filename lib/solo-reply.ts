import { appendMessage, getRoom } from "./store";
import { generateSoloAgentLine } from "./ai";
import { shortId } from "./utils";

const MIN_GAP_MS = 3000;

/** After a human speaks in solo mode, one or two synthetic seats may reply (async). */
export function queueSoloAgentRepliesIfNeeded(code: string) {
  const room = getRoom(code);
  if (!room || room.phase === "reflection" || room.phase === "lobby") return;
  if (room.interactionMode !== "solo") return;
  const ais = room.players.filter((p) => p.isAi);
  if (ais.length === 0) return;

  const now = Date.now();
  if ((room.lastAiReplyAt ?? 0) + MIN_GAP_MS > now) return;
  room.lastAiReplyAt = now;

  const shuffled = [...ais].sort(() => Math.random() - 0.5);
  const primary = shuffled[0];
  const secondary = shuffled.length > 1 ? shuffled[1] : undefined;

  void (async () => {
    const live = getRoom(code);
    if (!live || live.phase === "reflection" || live.interactionMode !== "solo") return;
    if (!primary) return;
    const t1 = await generateSoloAgentLine(live, primary.id);
    if (t1.trim()) {
      appendMessage(code, {
        id: shortId(),
        at: Date.now(),
        playerId: primary.id,
        playerName: primary.name,
        text: t1.slice(0, 600),
      });
    }
    if (!secondary) return;
    await new Promise((r) => setTimeout(r, 1400));
    const live2 = getRoom(code);
    if (!live2 || live2.phase === "reflection") return;
    const t2 = await generateSoloAgentLine(live2, secondary.id);
    if (t2.trim()) {
      appendMessage(code, {
        id: shortId(),
        at: Date.now(),
        playerId: secondary.id,
        playerName: secondary.name,
        text: t2.slice(0, 600),
      });
    }
  })();
}
