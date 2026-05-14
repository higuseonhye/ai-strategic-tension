import { NextResponse } from "next/server";
import { appendEvent, requireRoom } from "@/lib/store";
import { generateEvent } from "@/lib/ai";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(
  req: Request,
  { params }: { params: { code: string } }
) {
  try {
    const room = requireRoom(params.code);
    if (room.phase === "lobby" || room.phase === "reflection") {
      return NextResponse.json({ error: "Not in play" }, { status: 400 });
    }
    const event = await generateEvent(room);
    appendEvent(room.code, event);
    return NextResponse.json({ event });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
