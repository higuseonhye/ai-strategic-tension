"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { ChatMessage, RoomState } from "@/lib/types";
import { cn, formatTime } from "@/lib/utils";

export function ChatPanel({
  room,
  playerId,
  disabled,
}: {
  room: RoomState;
  playerId: string;
  disabled?: boolean;
}) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const me = room.players.find((p) => p.id === playerId);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [room.messages.length]);

  async function send() {
    const value = text.trim();
    if (!value || sending) return;
    setSending(true);
    try {
      await fetch(`/api/room/${room.code}/message`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ playerId, text: value }),
      });
      setText("");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div
        ref={scrollRef}
        className="flex-1 space-y-2 overflow-y-auto px-4 py-3"
      >
        {room.messages.length === 0 && (
          <div className="flex h-full items-center justify-center text-center text-xs uppercase tracking-[0.2em] text-mutedForeground">
            <span className="max-w-[260px]">
              The room is silent. Tension builds in the silence too.
            </span>
          </div>
        )}
        {room.messages.map((m) => (
          <Bubble key={m.id} msg={m} mine={m.playerId === playerId} />
        ))}
      </div>
      <div className="border-t border-white/5 bg-black/30 p-3">
        <div className="flex items-center gap-2">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder={
              me
                ? `Speak as ${me.name}…`
                : "Join the room to speak"
            }
            disabled={disabled || !me}
          />
          <Button onClick={send} disabled={disabled || !me || !text.trim() || sending}>
            Send
          </Button>
        </div>
        <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-mutedForeground">
          Public channel · every word is on the record
        </p>
      </div>
    </div>
  );
}

function Bubble({ msg, mine }: { msg: ChatMessage; mine: boolean }) {
  return (
    <div
      className={cn(
        "animate-slideUp flex w-full",
        mine ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-lg border px-3 py-2 text-sm leading-snug",
          mine
            ? "border-primary/30 bg-primary/10 text-foreground"
            : "border-white/10 bg-white/[0.03] text-foreground"
        )}
      >
        <div className="mb-1 flex items-center justify-between gap-3 text-[10px] uppercase tracking-[0.18em] text-mutedForeground">
          <span>{msg.playerName}</span>
          <span className="font-mono">{formatTime(msg.at)}</span>
        </div>
        <p className="whitespace-pre-wrap">{msg.text}</p>
      </div>
    </div>
  );
}
