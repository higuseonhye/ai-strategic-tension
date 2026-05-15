"use client";

import { Badge } from "@/components/ui/badge";
import type { Player, RoomState } from "@/lib/types";
import { getScenario } from "@/lib/scenarios";
import { cn } from "@/lib/utils";

export function PlayerList({
  room,
  selfId,
  showRoles = false,
}: {
  room: RoomState;
  selfId: string;
  showRoles?: boolean;
}) {
  const scenario = getScenario(room.scenarioId);
  return (
    <ul className="space-y-2">
      {room.players.map((p) => {
        const role = scenario?.roles.find((r) => r.id === p.roleId);
        const isMe = p.id === selfId;
        const live = p.isAi || Date.now() - p.lastSeenAt < 30_000;
        const lectern =
          room.interactionMode === "influence" &&
          room.influencePrimaryId === p.id;
        return (
          <li
            key={p.id}
            className={cn(
              "flex items-center justify-between rounded-lg border border-white/10 bg-black/30 px-3 py-2"
            )}
          >
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  live ? "bg-success animate-pulseGlow" : "bg-mutedForeground"
                )}
              />
              <div>
                <div className="flex items-center gap-2 text-sm font-medium">
                  {p.name}
                  {p.isAi && <Badge tone="danger">AI</Badge>}
                  {isMe && <Badge tone="accent">You</Badge>}
                  {p.isHost && <Badge tone="muted">Host</Badge>}
                  {lectern && <Badge tone="accent">Lectern</Badge>}
                </div>
                {showRoles && role && (
                  <p className="text-[11px] text-mutedForeground">
                    {p.isAi
                      ? "Strategic adversary — not a helper."
                      : isMe
                        ? role.name
                        : role.archetype}
                  </p>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function PlayerCount({
  players,
  max = 6,
}: {
  players: Player[];
  max?: number;
}) {
  return (
    <span className="font-mono text-xs text-mutedForeground">
      {players.length}/{max}
    </span>
  );
}
