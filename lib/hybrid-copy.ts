/** Framing when humans share a table with synthetic seats (hybrid topology). */
export function hybridFieldFrameCopy(scenarioId: string): { title: string; body: string } {
  const by: Record<string, { title: string; body: string }> = {
    "memory-winter": {
      title: "Hybrid field — humans and seats",
      body:
        "Synthetic agents hold real leverage alongside humans. They negotiate, defect, and ally without your permission. The channel is shared; the graph underneath is not symmetric.",
    },
    "orbital-exodus": {
      title: "Mixed survival geometry",
      body:
        "Every voice in this arc competes for finite exits. Humans carry reputational cost; synthetic seats carry none. Watch who bargains with whom when the pressure spikes.",
    },
    "sovereign-compute": {
      title: "Sovereignty, contested by many species of actor",
      body:
        "Humans and seated agents both move the frame. Trust is not a vibe here — it is an edge that tightens or snaps when events land.",
    },
  };
  return (
    by[scenarioId] ?? {
      title: "Hybrid tension field",
      body:
        "Multiple humans and multiple synthetic seats share one timeline. Irreversible commitment still ends the session — no one gets a rehearsal universe.",
    }
  );
}
