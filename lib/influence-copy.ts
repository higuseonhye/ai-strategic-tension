import type { ScenarioId } from "./types";

/** Extra pressure frame for influence rooms (host = primary voice). */
export function influenceFrameCopy(scenarioId: ScenarioId): {
  title: string;
  body: string;
} {
  const blocks: Record<ScenarioId, { title: string; body: string }> = {
    "memory-winter": {
      title: "Influence frame — the cameras are already half-on",
      body:
        "You are not in a closed session. Every line you take will be quoted out of context within the hour. The host speaks first; everyone else fractures the narrative or rides it. There is no neutral chair.",
    },
    "orbital-exodus": {
      title: "Influence frame — the crowd hears before the board does",
      body:
        "You hold the lectern while others weaponize silence. Any concession becomes a headline; any delay becomes cowardice. The host sets tempo; the room decides who survives the soundbite war.",
    },
    "sovereign-compute": {
      title: "Influence frame — sovereignty is performed, not negotiated",
      body:
        "Capitals are watching this feed. The host’s opening line becomes treaty language or trap. Allies test whether you will trade dignity for deterrence. No one gets to be only technical.",
    },
  };
  return blocks[scenarioId];
}
