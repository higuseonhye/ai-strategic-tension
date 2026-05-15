import type { InteractionMode, ScenarioId } from "./types";
import type { WorldMetrics, WorldTimelineEvent } from "./world-types";
import { shortId } from "./utils";

type OutcomeRow = {
  headline: string;
  narrative: string;
  deltas: Partial<WorldMetrics>;
};

/** Deterministic story + meter nudges per (scenario, final letter). */
const TABLE: Record<string, OutcomeRow> = {
  "memory-winter|A": {
    headline: "Sovereign rationing locked in — compute borders harden overnight.",
    narrative:
      "Session outcomes tilt toward national stockpiles. Cross-border research corridors thin; trust inside blocs rises while the commons cools.",
    deltas: { computeAccess: -4, diplomaticCohesion: 3, knowledgeCommons: -3, stability: 2 },
  },
  "memory-winter|B": {
    headline: "The Seoul Compute Accord reframes memory as a governed public good.",
    narrative:
      "A capped-draw regime spreads. Small labs breathe again, but fabs face political price caps — sovereign fragmentation accelerates at the edges.",
    deltas: { knowledgeCommons: 5, computeAccess: 2, publicTrust: 3, diplomaticCohesion: -2 },
  },
  "memory-winter|C": {
    headline: "Emergency fab expansion passes — power grids and climate ledgers shudder.",
    narrative:
      "Short-term supply relief arrives with an ecological IOU. Activist coalitions splinter; industrial blocs consolidate pricing power.",
    deltas: { computeAccess: 6, climate: -6, publicTrust: -3, stability: 1 },
  },
  "memory-winter|D": {
    headline: "Architectural pivot votes force a controlled burn of HBM-era stacks.",
    narrative:
      "Incumbents face write-downs; researchers race on neuromorphic rails. Access gyrates wildly before a thinner but freer stack emerges.",
    deltas: { knowledgeCommons: 2, computeAccess: -5, stability: -3, publicTrust: -2 },
  },
  "memory-winter|E": {
    headline: "No accord — markets arbitrate memory while institutions lose the room.",
    narrative:
      "Price spikes and blackouts outrun diplomacy. Trust in multilateral process collapses; opportunistic alliances form in the vacuum.",
    deltas: { publicTrust: -6, stability: -4, diplomaticCohesion: -5, computeAccess: -2 },
  },
  "orbital-exodus|A": {
    headline: "Merit-only manifest freezes a brutal hierarchy into law.",
    narrative:
      "Orbital capacity concentrates in mission-critical chains. Democratic legitimacy frays on the ground while survival odds sharpen in orbit.",
    deltas: { orbital: 4, publicTrust: -5, stability: 2, diplomaticCohesion: -4 },
  },
  "orbital-exodus|B": {
    headline: "Continuity manifest preserves institutions — at a steep human discount.",
    narrative:
      "Command chains and families board first. Underground resistance swells; the launch site perimeter becomes a political weapon.",
    deltas: { stability: 3, publicTrust: -4, diplomaticCohesion: 2, orbital: 2 },
  },
  "orbital-exodus|C": {
    headline: "Public lottery seats force transparency — and a livestreamed moral crucible.",
    narrative:
      "Legitimacy spikes short-term while security frays. The arc becomes about who controls the randomness, not who deserves to live.",
    deltas: { publicTrust: 6, stability: -3, orbital: 1, diplomaticCohesion: -2 },
  },
  "orbital-exodus|D": {
    headline: "Hybrid quotas lock tribal obligations into a brittle peace.",
    narrative:
      "Each bloc gets a slice; nobody is happy. Orbital logistics gain predictability while Earth-side narratives radicalize in parallel.",
    deltas: { diplomaticCohesion: 4, orbital: 3, publicTrust: 1, stability: -1 },
  },
  "orbital-exodus|E": {
    headline: "Abort vote — the manifest dies; collective risk becomes the only truth left.",
    narrative:
      "Perimeter integrity fails first. The world remembers a moment when democracy chose refusal over selection — and paid in time.",
    deltas: { publicTrust: -7, stability: -6, orbital: -4, diplomaticCohesion: -3 },
  },
  "sovereign-compute|A": {
    headline: "Host nation bets on sovereign subsea stacks — alone in the cable corridor.",
    narrative:
      "Independence rallies domestic pride; hegemons quietly prepare cable leverage plays. Compute access bifurcates along fault lines.",
    deltas: { computeAccess: 3, diplomaticCohesion: -5, stability: -2, publicTrust: 2 },
  },
  "sovereign-compute|B": {
    headline: "Hegemon partnership trades autonomy for a security umbrella over fiber routes.",
    narrative:
      "Stability purchases calm markets; sovereign compute dreams narrow to rented capacity inside someone else's treaty perimeter.",
    deltas: { stability: 5, diplomaticCohesion: 3, knowledgeCommons: -2, computeAccess: 1 },
  },
  "sovereign-compute|C": {
    headline: "Rival-bloc alignment smuggles survival through quiet economic reroutes.",
    narrative:
      "Sanctions risk rises in headlines while underground routing keeps lights on. Trust becomes a two-channel phenomenon.",
    deltas: { diplomaticCohesion: -3, computeAccess: 2, stability: 1, publicTrust: -2 },
  },
  "sovereign-compute|D": {
    headline: "Multilateral governance slows the deal — and slows the carrier clock.",
    narrative:
      "Auditors inherit the crisis. Legitimacy accrues slowly while tactical windows close; the world gains procedure at the expense of tempo.",
    deltas: { publicTrust: 4, diplomaticCohesion: 5, computeAccess: -2, stability: 2 },
  },
  "sovereign-compute|E": {
    headline: "No deal — cables stay live while strategy dissolves into brinkmanship.",
    narrative:
      "Markets price war risk into latency. Small nations remember a summit that ended in noise, not architecture.",
    deltas: { stability: -5, publicTrust: -4, diplomaticCohesion: -6, computeAccess: -3 },
  },
};

function fallbackOutcome(
  scenarioId: ScenarioId,
  choice: string
): OutcomeRow {
  return {
    headline: `Session outcome ${choice} shifts the ${scenarioId.replace(/-/g, " ")} arc.`,
    narrative:
      "The world state nudges without a named accord — ambiguity becomes the official record until the next crisis names it.",
    deltas: { stability: -1, publicTrust: -1, diplomaticCohesion: -1 },
  };
}

export function resolveOutcome(
  scenarioId: ScenarioId,
  finalChoice: string
): OutcomeRow {
  const letter = (finalChoice || "X").trim().toUpperCase().slice(0, 1);
  const key = `${scenarioId}|${letter}`;
  return TABLE[key] ?? fallbackOutcome(scenarioId, letter);
}

export function buildWorldTimelineEvent(opts: {
  sessionIndex: number;
  sessionCode: string;
  scenarioId: ScenarioId;
  interactionMode: InteractionMode;
  finalChoice: string;
  tensionTerminal: number;
}): Omit<WorldTimelineEvent, "id" | "at"> & { id?: string; at?: number } {
  const row = resolveOutcome(opts.scenarioId, opts.finalChoice);
  return {
    id: shortId(),
    at: Date.now(),
    sessionIndex: opts.sessionIndex,
    sessionCode: opts.sessionCode,
    scenarioId: opts.scenarioId,
    interactionMode: opts.interactionMode,
    finalChoice: opts.finalChoice,
    tensionTerminal: opts.tensionTerminal,
    headline: row.headline,
    narrative: row.narrative,
    deltas: row.deltas,
  };
}
