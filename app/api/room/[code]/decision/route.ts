import { NextResponse } from "next/server";
import { commitDecision, recordVote, requireRoom, setPhase } from "@/lib/store";
import { persistSessionWorldOutcome } from "@/lib/world-persist";

export const runtime = "nodejs";

export async function POST(
  req: Request,
  { params }: { params: { code: string } }
) {
  try {
    const body = (await req.json()) as {
      playerId?: string;
      choice?: string;
      commit?: boolean;
    };
    const room = requireRoom(params.code);
    if (!body.playerId || !body.choice) {
      return NextResponse.json({ error: "playerId and choice required" }, { status: 400 });
    }
    const player = room.players.find((p) => p.id === body.playerId);
    if (!player) return NextResponse.json({ error: "not in room" }, { status: 403 });

    if (body.commit) {
      if (player.id !== room.hostId) {
        return NextResponse.json({ error: "Only host may commit final decision" }, { status: 403 });
      }
      commitDecision(room.code, body.choice);
      const after = requireRoom(params.code);
      await persistSessionWorldOutcome(after);
      return NextResponse.json({ ok: true, committed: true });
    }

    if (room.phase !== "decision" && room.phase !== "endgame") {
      setPhase(room.code, "decision");
    }
    recordVote(room.code, player.id, body.choice);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
