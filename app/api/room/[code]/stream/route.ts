import { getRoom, subscribe, touchPlayer } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: { code: string } }
) {
  const url = new URL(req.url);
  const playerId = url.searchParams.get("playerId");

  const room = getRoom(params.code);
  if (!room) {
    return new Response(JSON.stringify({ error: "Room not found" }), {
      status: 404,
      headers: { "content-type": "application/json" },
    });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const send = (data: unknown) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch {
          /* connection closed */
        }
      };

      send({ type: "snapshot", room });

      const unsubscribe = subscribe(params.code, (next) => {
        send({ type: "update", room: next });
      });

      const heartbeat = setInterval(() => {
        if (playerId) touchPlayer(params.code, playerId);
        send({ type: "ping", t: Date.now() });
      }, 15000);

      const close = () => {
        clearInterval(heartbeat);
        unsubscribe();
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      };

      // @ts-ignore - request signal available in Node runtime
      req.signal?.addEventListener?.("abort", close);
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream",
      "cache-control": "no-cache, no-transform",
      connection: "keep-alive",
      "x-accel-buffering": "no",
    },
  });
}
