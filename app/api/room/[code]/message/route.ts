import { NextResponse } from "next/server";
import { appendMessage, requireRoom, touchPlayer } from "@/lib/store";
import { shortId } from "@/lib/utils";

export const runtime = "nodejs";

export async function POST(
  req: Request,
  { params }: { params: { code: string } }
) {
  try {
    const body = (await req.json()) as {
      playerId?: string;
      text?: string;
      toPlayerId?: string;
    };
    if (!body.playerId || !body.text) {
      return NextResponse.json({ error: "playerId and text required" }, { status: 400 });
    }
    const room = requireRoom(params.code);
    const player = room.players.find((p) => p.id === body.playerId);
    if (!player) {
      return NextResponse.json({ error: "Player not in room" }, { status: 403 });
    }
    if (player.isAi) {
      return NextResponse.json({ error: "AI cannot post via this endpoint" }, { status: 403 });
    }
    touchPlayer(room.code, player.id);
    const text = body.text.slice(0, 600).trim();
    if (!text) return NextResponse.json({ error: "empty" }, { status: 400 });
    appendMessage(room.code, {
      id: shortId(),
      at: Date.now(),
      playerId: player.id,
      playerName: player.name,
      text,
      isWhisper: Boolean(body.toPlayerId),
      toPlayerId: body.toPlayerId,
    });
    const { queueDuelAdversaryReplyIfNeeded } = await import("@/lib/duel-reply");
    const { queueSoloAgentRepliesIfNeeded } = await import("@/lib/solo-reply");
    queueDuelAdversaryReplyIfNeeded(room.code);
    queueSoloAgentRepliesIfNeeded(room.code);
    const after = requireRoom(params.code);
    if (after.interactionMode === "solo" || after.interactionMode === "hybrid") {
      const { queueInterAgentBanterIfNeeded } = await import("@/lib/inter-agent-reply");
      queueInterAgentBanterIfNeeded(params.code, 0.12);
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
