/** Framing for solo (1 human vs multi-agent field) on session start. */
export function soloFieldFrameCopy(scenarioId: string): { title: string; body: string } {
  const by: Record<string, { title: string; body: string }> = {
    "memory-winter": {
      title: "Multi-agent field online",
      body:
        "Several synthetic seats hold real leverage in this scenario. They do not agree with each other — or with you. Your job is not to chat; it is to commit under cross-pressure.",
    },
    "orbital-exodus": {
      title: "Survival geometry, populated",
      body:
        "Every seat in this arc represents a different survival logic. The agents will bargain past you if you let them. Force the room to your constraint before the clock does.",
    },
    "sovereign-compute": {
      title: "Sovereignty as a multiplayer object",
      body:
        "You are alone in the room but not alone in the stakes. Agents embody competing powers; listen for where they fracture — that is your opening, not their permission slip.",
    },
  };
  return (
    by[scenarioId] ?? {
      title: "Solo tension field",
      body:
        "Multiple seated agents carry asymmetric goals. They can contradict each other. You still owe the room one irreversible line at the end.",
    }
  );
}
