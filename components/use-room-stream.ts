"use client";

import { useEffect, useRef, useState } from "react";
import type { RoomState } from "@/lib/types";

export function useRoomStream(code: string | undefined, playerId: string | undefined) {
  const [room, setRoom] = useState<RoomState | null>(null);
  const [connected, setConnected] = useState(false);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!code) return;
    const url = `/api/room/${code}/stream${playerId ? `?playerId=${playerId}` : ""}`;
    const es = new EventSource(url);
    esRef.current = es;
    es.onopen = () => setConnected(true);
    es.onerror = () => setConnected(false);
    es.onmessage = (msg) => {
      try {
        const data = JSON.parse(msg.data);
        if (data.type === "snapshot" || data.type === "update") {
          setRoom(data.room as RoomState);
        }
      } catch {
        /* ignore */
      }
    };
    return () => {
      es.close();
      esRef.current = null;
    };
  }, [code, playerId]);

  return { room, connected };
}
