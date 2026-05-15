import type { RoomState } from "./types";

/** Synthetic seat for 1:AI strategic duel. */
export const AI_DUEL_PLAYER_ID = "ate-ai-duel";

export function isAiDuel(room: RoomState): boolean {
  return room.interactionMode === "duel" && Boolean(room.aiOpponentEnabled);
}

export function humanPlayerCount(room: RoomState): number {
  return room.players.filter((p) => !p.isAi).length;
}

export function hasAiAdversary(room: RoomState): boolean {
  return room.players.some((p) => p.isAi);
}

export function isSoloMode(room: RoomState): boolean {
  return room.interactionMode === "solo";
}
