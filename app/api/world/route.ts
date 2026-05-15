import { NextResponse } from "next/server";
import { getWorldSnapshotForApi } from "@/lib/world-persist";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const limit = Math.min(
    100,
    Math.max(10, parseInt(url.searchParams.get("limit") || "50", 10) || 50)
  );
  const snapshot = await getWorldSnapshotForApi({ timelineLimit: limit });
  return NextResponse.json(snapshot);
}
