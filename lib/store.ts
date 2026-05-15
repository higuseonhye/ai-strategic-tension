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
import { AI_DUEL_PLAYER_ID } from "./mode-utils";
import { influenceFrameCopy } from "./influence-copy";
import { soloFieldFrameCopy } from "./solo-copy";
import { hybridFieldFrameCopy } from "./hybrid-copy";
import { recordSocialSignalFromMessage, recordSocialSignalOnEvent } from "./social-graph";

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
  aiOpponentEnabled?: boolean;
}): { room: RoomState; playerId: string } {
  const scenario = getScenario(opts.scenarioId);
  if (!scenario) throw new Error(`Unknown scenario: ${opts.scenarioId}`);

  const mode = opts.interactionMode ?? "crisis";
  const aiOn = mode === "duel" && Boolean(opts.aiOpponentEnabled);

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
    interactionMode: mode,
    aiOpponentEnabled: aiOn ? true : undefined,
    socialGraph: [],
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
  if (room.players.length >= maxPlayers(room)) {
    throw new Error(`Room is full (max ${maxPlayers(room)}).`);
  }
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
  const minP = minPlayers(room);
  if (room.players.length < minP) {
    throw new Error(`Need at least ${minP} players for this mode.`);
  }

  if (room.interactionMode === "solo") {
    const humans = room.players.filter((p) => !p.isAi);
    if (humans.length !== 1) {
      throw new Error("Solo mode requires exactly one human player (host only).");
    }
    if (room.players.some((p) => p.isAi)) {
      throw new Error("Solo agents are injected only when the session starts.");
    }
    const roles = [...scenario.roles].sort(() => Math.random() - 0.5);
    const human = humans[0]!;
    human.roleId = roles[0]!.id;
    for (let i = 1; i < roles.length; i++) {
      const role = roles[i]!;
      room.players.push({
        id: `ate-solo-${shortId()}`,
        name:
          role.archetype.length > 26 ? `${role.archetype.slice(0, 24)}…` : role.archetype,
        joinedAt: Date.now(),
        lastSeenAt: Date.now(),
        isHost: false,
        isAi: true,
        roleId: role.id,
      });
    }
  } else if (room.interactionMode === "hybrid") {
    const humans = room.players.filter((p) => !p.isAi);
    if (humans.length < 2) {
      throw new Error("Hybrid mode needs at least two human players.");
    }
    if (room.players.some((p) => p.isAi)) {
      throw new Error("Synthetic seats are injected only when the session starts.");
    }
    const roles = [...scenario.roles].sort(() => Math.random() - 0.5);
    const seatCount = Math.min(6, roles.length);
    if (humans.length > seatCount) {
      throw new Error(
        `This scenario tables ${seatCount} seats; fewer humans must leave or pick another scenario.`
      );
    }
    humans.forEach((p, i) => {
      p.roleId = roles[i]!.id;
    });
    for (let h = humans.length; h < seatCount; h++) {
      const role = roles[h]!;
      room.players.push({
        id: `ate-hyb-${shortId()}`,
        name:
          role.archetype.length > 26 ? `${role.archetype.slice(0, 24)}…` : role.archetype,
        joinedAt: Date.now(),
        lastSeenAt: Date.now(),
        isHost: false,
        isAi: true,
        roleId: role.id,
      });
    }
  } else if (room.interactionMode === "duel" && room.aiOpponentEnabled) {
    if (room.players.length !== 1) {
      throw new Error("AI duel requires exactly one human player in the room.");
    }
    if (room.players.some((p) => p.isAi)) {
      throw new Error("AI seat already present.");
    }
    room.players.push({
      id: AI_DUEL_PLAYER_ID,
      name: "Adversary",
      joinedAt: Date.now(),
      lastSeenAt: Date.now(),
      isHost: false,
      isAi: true,
    });
  } else if (room.interactionMode === "duel" && room.players.length !== 2) {
    throw new Error("Duel mode requires exactly 2 human players.");
  }

  if (room.interactionMode !== "solo" && room.interactionMode !== "hybrid") {
    const shuffled = [...scenario.roles].sort(() => Math.random() - 0.5);
    room.players.forEach((p, i) => {
      p.roleId = shuffled[i % shuffled.length]!.id;
    });
  }

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

  if (room.interactionMode === "influence") {
    room.influencePrimaryId = room.hostId;
    const frame = influenceFrameCopy(room.scenarioId);
    room.events.push({
      id: shortId(),
      at: Date.now(),
      kind: "ultimatum",
      title: frame.title,
      body: frame.body,
      delta: 4,
    });
  }

  if (room.interactionMode === "duel" && room.aiOpponentEnabled) {
    room.messages.push({
      id: shortId(),
      at: Date.now(),
      playerId: AI_DUEL_PLAYER_ID,
      playerName: "Adversary",
      text: "I'm not here to agree. Speak in stakes, not slogans.",
    });
  }

  if (room.interactionMode === "solo") {
    const frame = soloFieldFrameCopy(room.scenarioId);
    room.events.push({
      id: shortId(),
      at: Date.now(),
      kind: "ultimatum",
      title: frame.title,
      body: frame.body,
      delta: 5,
    });
    const ais = room.players.filter((p) => p.isAi);
    if (ais[0]) {
      room.messages.push({
        id: shortId(),
        at: Date.now(),
        playerId: ais[0].id,
        playerName: ais[0].name,
        text: "You're alone at the table. That doesn't mean uncontested — watch who bargains with whom.",
      });
    }
    if (ais[1]) {
      room.messages.push({
        id: shortId(),
        at: Date.now(),
        playerId: ais[1].id,
        playerName: ais[1].name,
        text: "Cut the courtesy. Name what you need before this fragments into private wars.",
      });
    }
  }

  if (room.interactionMode === "hybrid") {
    const frame = hybridFieldFrameCopy(room.scenarioId);
    room.events.push({
      id: shortId(),
      at: Date.now(),
      kind: "ultimatum",
      title: frame.title,
      body: frame.body,
      delta: 5,
    });
    const ais = room.players.filter((p) => p.isAi);
    if (ais[0] && ais[1]) {
      room.messages.push({
        id: shortId(),
        at: Date.now(),
        playerId: ais[0].id,
        playerName: ais[0].name,
        text: "Humans are in the channel now — good. We were about to mistake silence for consensus.",
      });
      room.messages.push({
        id: shortId(),
        at: Date.now(),
        playerId: ais[1].id,
        playerName: ais[1].name,
        text: "Consensus is a lie until stakes are named. Someone human: break the politeness.",
      });
    }
  }

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
  recordSocialSignalFromMessage(room, msg);
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
  recordSocialSignalOnEvent(room);
  emit(code, room);
  void import("./inter-agent-reply").then((m) =>
    m.queueInterAgentBanterIfNeeded(code, 0.42)
  );
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
        (p) => p.isAi || now - p.lastSeenAt < PRESENCE_TTL_MS * 30
      );
    }
  }
}

function maxPlayers(room: RoomState): number {
  if (room.interactionMode === "solo") return 1;
  if (room.interactionMode === "duel" && room.aiOpponentEnabled) return 1;
  if (room.interactionMode === "duel") return 2;
  return 6;
}

function minPlayers(room: RoomState): number {
  if (room.interactionMode === "solo") return 1;
  if (room.interactionMode === "duel" && room.aiOpponentEnabled) return 1;
  return 2;
}
