import { EventEmitter } from "node:events";
import type {
  ChatMessage,
  InteractionMode,
  Phase,
  Player,
  RoomState,
  ScenarioId,
  TensionEvent,
} from "./types";
import { getScenario } from "./scenarios";
import { randomRoomCode, shortId } from "./utils";

type GlobalShape = {
  rooms: Map<string, RoomState>;
  bus: EventEmitter;
};

declare global {
  var __ATE_STORE__: GlobalShape | undefined;
}

function getStore(): GlobalShape {
  if (!globalThis.__ATE_STORE__) {
    const bus = new EventEmitter();
    bus.setMaxListeners(0);
    globalThis.__ATE_STORE__ = {
      rooms: new Map(),
      bus,
    };
  }
  return globalThis.__ATE_STORE__;
}

const PRESENCE_TTL_MS = 60_000;

function emit(code: string, room: RoomState) {
  getStore().bus.emit(`room:${code}`, room);
}

export function subscribe(code: string, listener: (room: RoomState) => void) {
  const bus = getStore().bus;
  const event = `room:${code}`;
  bus.on(event, listener);
  return () => bus.off(event, listener);
}

export function createRoom(opts: {
  hostName: string;
  scenarioId: ScenarioId;
  interactionMode?: InteractionMode;
}): { room: RoomState; playerId: string } {
  const scenario = getScenario(opts.scenarioId);
  if (!scenario) throw new Error(`Unknown scenario: ${opts.scenarioId}`);

  const store = getStore();
  let code = randomRoomCode();
  while (store.rooms.has(code)) code = randomRoomCode();

  const hostId = shortId();
  const host: Player = {
    id: hostId,
    name: opts.hostName.trim() || "Host",
    joinedAt: Date.now(),
    lastSeenAt: Date.now(),
    isHost: true,
  };

  const room: RoomState = {
    code,
    scenarioId: opts.scenarioId,
    phase: "lobby",
    createdAt: Date.now(),
    hostId,
    tension: 12,
    round: 0,
    players: [host],
    events: [],
    messages: [],
    votes: [],
    interactionMode: opts.interactionMode ?? "crisis",
  };

  store.rooms.set(code, room);
  emit(code, room);
  return { room, playerId: hostId };
}

export function joinRoom(opts: {
  code: string;
  name: string;
}): { room: RoomState; playerId: string } {
  const room = requireRoom(opts.code);
  const cap = maxPlayersForMode(room.interactionMode);
  if (room.players.length >= cap) throw new Error(`Room is full (max ${cap}).`);
  if (room.phase !== "lobby") throw new Error("Game already started.");

  const id = shortId();
  const player: Player = {
    id,
    name: opts.name.trim() || `Player ${room.players.length + 1}`,
    joinedAt: Date.now(),
    lastSeenAt: Date.now(),
    isHost: false,
  };
  room.players.push(player);
  emit(room.code, room);
  return { room, playerId: id };
}

export function getRoom(code: string): RoomState | undefined {
  return getStore().rooms.get(code.toUpperCase());
}

export function requireRoom(code: string): RoomState {
  const room = getRoom(code);
  if (!room) throw new Error(`Room ${code} not found`);
  return room;
}

export function touchPlayer(code: string, playerId: string) {
  const room = getRoom(code);
  if (!room) return;
  const player = room.players.find((p) => p.id === playerId);
  if (player) player.lastSeenAt = Date.now();
}

export function setPhase(code: string, phase: Phase) {
  const room = requireRoom(code);
  room.phase = phase;
  emit(code, room);
}

export function startGame(code: string) {
  const room = requireRoom(code);
  const scenario = getScenario(room.scenarioId);
  if (!scenario) throw new Error("Scenario missing");
  const minP = minPlayersForMode(room.interactionMode);
  if (room.players.length < minP) {
    throw new Error(`Need at least ${minP} players for this mode.`);
  }
  if (room.interactionMode === "duel" && room.players.length !== 2) {
    throw new Error("Duel mode requires exactly 2 players.");
  }

  const shuffled = [...scenario.roles].sort(() => Math.random() - 0.5);
  room.players.forEach((p, i) => {
    p.roleId = shuffled[i % shuffled.length].id;
  });

  room.phase = "negotiation";
  room.round = 1;
  room.tension = 22;
  room.events.push({
    id: shortId(),
    at: Date.now(),
    kind: "destabilizer",
    title: "Opening Pressure",
    body: scenario.openingPressure,
    delta: 6,
  });
  emit(code, room);
}

export function advancePhase(code: string) {
  const room = requireRoom(code);
  const order: Phase[] = [
    "lobby",
    "briefing",
    "negotiation",
    "escalation",
    "endgame",
    "decision",
    "reflection",
  ];
  const idx = order.indexOf(room.phase);
  if (idx >= 0 && idx < order.length - 1) {
    room.phase = order[idx + 1];
    emit(code, room);
  }
}

export function appendMessage(code: string, msg: ChatMessage) {
  const room = requireRoom(code);
  room.messages.push(msg);
  if (room.messages.length > 500) room.messages.splice(0, room.messages.length - 500);
  emit(code, room);
}

export function appendEvent(code: string, event: TensionEvent) {
  const room = requireRoom(code);
  room.events.push(event);
  room.tension = clamp(room.tension + event.delta, 0, 100);
  // Auto phase progression — pressure dictates pacing.
  if (room.phase === "briefing" && room.events.length >= 2) {
    room.phase = "negotiation";
  }
  if (room.tension >= 65 && room.phase === "negotiation") {
    room.phase = "escalation";
  }
  if (room.tension >= 88 && room.phase === "escalation") {
    room.phase = "endgame";
  }
  emit(code, room);
}

export function setTension(code: string, value: number) {
  const room = requireRoom(code);
  room.tension = clamp(value, 0, 100);
  emit(code, room);
}

export function recordVote(code: string, playerId: string, choice: string) {
  const room = requireRoom(code);
  const existing = room.votes.find((v) => v.playerId === playerId);
  if (existing) {
    existing.choice = choice;
    existing.at = Date.now();
  } else {
    room.votes.push({ playerId, choice, at: Date.now() });
  }
  emit(code, room);
}

export function commitDecision(code: string, choice: string) {
  const room = requireRoom(code);
  room.finalChoice = choice;
  room.phase = "reflection";
  emit(code, room);
}

export function attachReflection(
  code: string,
  reflection: NonNullable<RoomState["reflection"]>
) {
  const room = requireRoom(code);
  room.reflection = reflection;
  emit(code, room);
}

export function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function publicRoom(room: RoomState): RoomState {
  return room;
}

export function purgeStale() {
  const now = Date.now();
  const store = getStore();
  for (const [code, room] of store.rooms.entries()) {
    if (now - room.createdAt > 6 * 60 * 60 * 1000) {
      store.rooms.delete(code);
    } else {
      room.players = room.players.filter(
        (p) => now - p.lastSeenAt < PRESENCE_TTL_MS * 30
      );
    }
  }
}

function maxPlayersForMode(mode: InteractionMode): number {
  switch (mode) {
    case "duel":
      return 2;
    case "influence":
      return 6;
    case "hidden_faction":
      return 6;
    default:
      return 6;
  }
}

function minPlayersForMode(mode: InteractionMode): number {
  switch (mode) {
    case "duel":
      return 2;
    default:
      return 2;
  }
}
