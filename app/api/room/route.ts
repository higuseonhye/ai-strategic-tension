import { NextResponse } from "next/server";
import { createRoom } from "@/lib/store";
import type { InteractionMode, ScenarioId } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      name?: string;
      scenarioId?: ScenarioId;
      interactionMode?: InteractionMode;
      aiOpponentEnabled?: boolean;
    };
    if (!body.scenarioId) {
      return NextResponse.json({ error: "scenarioId required" }, { status: 400 });
    }
    const mode = body.interactionMode ?? "crisis";
    if (mode === "hidden_faction") {
      return NextResponse.json(
        { error: "Hidden AI faction mode is not open yet." },
        { status: 400 }
      );
    }
    const { room, playerId } = createRoom({
      hostName: body.name ?? "Host",
      scenarioId: body.scenarioId,
      interactionMode: mode,
      aiOpponentEnabled: mode === "duel" ? body.aiOpponentEnabled : undefined,
    });
    return NextResponse.json({ code: room.code, playerId, room });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to create room";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
