import { NextResponse } from "next/server";
import { createRoom } from "@/lib/store";
import type { ScenarioId } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { name?: string; scenarioId?: ScenarioId };
    if (!body.scenarioId) {
      return NextResponse.json({ error: "scenarioId required" }, { status: 400 });
    }
    const { room, playerId } = createRoom({
      hostName: body.name ?? "Host",
      scenarioId: body.scenarioId,
    });
    return NextResponse.json({ code: room.code, playerId, room });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to create room";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
