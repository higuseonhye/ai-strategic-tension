import { NextResponse } from "next/server";
import { attachReflection, requireRoom } from "@/lib/store";
import { generateReflection } from "@/lib/ai";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(
  req: Request,
  { params }: { params: { code: string } }
) {
  try {
    const room = requireRoom(params.code);
    if (!room.finalChoice) {
      return NextResponse.json({ error: "No final decision yet" }, { status: 400 });
    }
    if (room.reflection) {
      return NextResponse.json({ reflection: room.reflection, cached: true });
    }
    const reflection = await generateReflection(room);
    attachReflection(room.code, reflection);
    return NextResponse.json({ reflection });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
