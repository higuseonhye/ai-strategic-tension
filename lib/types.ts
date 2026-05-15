export type ScenarioId = "memory-winter" | "orbital-exodus" | "sovereign-compute";

/** Room layout: crisis = flagship N:N; duel / influence = alternate pressure shapes; solo = 1 human vs multi-agent field; hybrid = humans + synthetic seats. */
export type InteractionMode =
  | "solo"
  | "crisis"
  | "duel"
  | "influence"
  | "hybrid"
  | "hidden_faction";

/** Directed heuristic edges (trust / attention), not a full graph DB. */
export interface SocialEdge {
  fromId: string;
  toId: string;
  /** -100..100 alignment / rupture pressure */
  trust: number;
  /** 0..100 salience of *to* as lever for *from* */
  influence: number;
  at: number;
}

export interface Role {
  id: string;
  name: string;
  archetype: string;
  publicBrief: string;
  secretGoal: string;
  hiddenLeverage: string;
}

export interface Scenario {
  id: ScenarioId;
  title: string;
  tagline: string;
  premise: string;
  setting: string;
  centralTension: string;
  roles: Role[];
  openingPressure: string;
  eventSeeds: string[];
  finalDecisionPrompt: string;
  accentHue: string;
}

export type Phase =
  | "lobby"
  | "briefing"
  | "negotiation"
  | "escalation"
  | "endgame"
  | "decision"
  | "reflection";

export interface Player {
  id: string;
  name: string;
  roleId?: string;
  joinedAt: number;
  isHost: boolean;
  lastSeenAt: number;
  /** Synthetic seat for 1:AI duel. */
  isAi?: boolean;
}

export type EventKind =
  | "destabilizer"
  | "leak"
  | "ultimatum"
  | "reversal"
  | "scarcity-spike"
  | "alliance-rupture";

export interface TensionEvent {
  id: string;
  at: number;
  kind: EventKind;
  title: string;
  body: string;
  delta: number;
  hint?: string;
}

export interface ChatMessage {
  id: string;
  at: number;
  playerId: string;
  playerName: string;
  text: string;
  isWhisper?: boolean;
  toPlayerId?: string;
}

export interface Vote {
  playerId: string;
  choice: string;
  at: number;
}

export interface RoomState {
  code: string;
  scenarioId: ScenarioId;
  phase: Phase;
  createdAt: number;
  hostId: string;
  tension: number;
  round: number;
  players: Player[];
  events: TensionEvent[];
  messages: ChatMessage[];
  votes: Vote[];
  finalChoice?: string;
  reflection?: ReflectionReport;
  /** Negotiation architecture; default crisis. */
  interactionMode: InteractionMode;
  /** Duel: play against AI with only one human in the room. */
  aiOpponentEnabled?: boolean;
  /** Influence: host is the primary lectern voice. */
  influencePrimaryId?: string;
  /** Throttle AI duel chat replies. */
  lastAiReplyAt?: number;
  /** Throttle synthetic-only cross-talk (solo / hybrid). */
  lastInterAgentAt?: number;
  /** Heuristic trust / influence edges (updated from messages + events). */
  socialGraph?: SocialEdge[];
}

export interface ReflectionReport {
  headline: string;
  arc: string;
  allianceEvolution: string;
  persuasionAnalysis: string;
  betrayalPatterns: string;
  turningPoints: string[];
  hiddenAssumptions: string;
  verdict: string;
  perPlayer: Array<{
    playerName: string;
    roleName: string;
    summary: string;
    style: string;
    leverage: string;
  }>;
}

export interface PublicRoomState extends RoomState {}
