import { NextResponse } from "next/server";
import { getRoom, touchPlayer } from "@/lib/store";

export const runtime = "nodejs";

export async function GET(
  req: Request,
  { params }: { params: { code: string } }
) {
  const url = new URL(req.url);
  const playerId = url.searchParams.get("playerId");
  const room = getRoom(params.code);
  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }
  if (playerId) touchPlayer(room.code, playerId);
  return NextResponse.json({ room });
}
