import { NextResponse } from "next/server";
import { startGame, requireRoom } from "@/lib/store";

export const runtime = "nodejs";

export async function POST(
  req: Request,
  { params }: { params: { code: string } }
) {
  try {
    const body = (await req.json()) as { playerId?: string };
    const room = requireRoom(params.code);
    if (body.playerId !== room.hostId) {
      return NextResponse.json({ error: "Only host may start" }, { status: 403 });
    }
    startGame(params.code);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to start";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
