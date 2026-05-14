export type ScenarioId = "memory-winter" | "orbital-exodus" | "sovereign-compute";

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
