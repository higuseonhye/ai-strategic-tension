import type { InteractionMode, ScenarioId } from "./types";

/** Civilization-scale meters the world “remembers” (0–100). */
export interface WorldMetrics {
  stability: number;
  climate: number;
  orbital: number;
  knowledgeCommons: number;
  computeAccess: number;
  publicTrust: number;
  diplomaticCohesion: number;
}

/** One irreversible session imprinted on the persistent world. */
export interface WorldTimelineEvent {
  id: string;
  at: number;
  sessionIndex: number;
  sessionCode: string;
  scenarioId: ScenarioId;
  interactionMode: InteractionMode;
  finalChoice: string;
  tensionTerminal: number;
  headline: string;
  narrative: string;
  deltas: Partial<WorldMetrics>;
}

/** Narrative identity — not XP/coins. */
export interface PlayerLegacyEntry {
  playerKey: string;
  displayHint: string;
  tags: string[];
  sessionsPlayed: number;
  lastContribution: Partial<WorldMetrics>;
  updatedAt: number;
}

export const DEFAULT_WORLD_METRICS: WorldMetrics = {
  stability: 52,
  climate: 48,
  orbital: 44,
  knowledgeCommons: 46,
  computeAccess: 41,
  publicTrust: 47,
  diplomaticCohesion: 49,
};

export const WORLD_METRIC_LABELS: Record<keyof WorldMetrics, string> = {
  stability: "Civilization stability",
  climate: "Climate recovery",
  orbital: "Orbital infrastructure",
  knowledgeCommons: "Knowledge commons",
  computeAccess: "Compute accessibility",
  publicTrust: "Public trust",
  diplomaticCohesion: "Diplomatic cohesion",
};
