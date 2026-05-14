import { NextResponse } from "next/server";
import { joinRoom } from "@/lib/store";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { code?: string; name?: string };
    if (!body.code) {
      return NextResponse.json({ error: "code required" }, { status: 400 });
    }
    const { room, playerId } = joinRoom({
      code: body.code.toUpperCase(),
      name: body.name ?? "Player",
    });
    return NextResponse.json({ code: room.code, playerId, room });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to join room";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
