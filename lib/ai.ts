import OpenAI from "openai";
import type {
  ChatMessage,
  EventKind,
  ReflectionReport,
  RoomState,
  Scenario,
  TensionEvent,
} from "./types";
import { getScenario } from "./scenarios";
import { shortId } from "./utils";

const apiKey = process.env.OPENAI_API_KEY;
const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

const client = apiKey ? new OpenAI({ apiKey }) : null;

const SYSTEM_GM = `You are the game master of an AI-native strategic tension simulator.
You are NOT the protagonist. You design pressure. You destabilize. You escalate.
You write in cinematic, terse, present-tense prose. You never lecture.
You never break character. You never refer to yourself as an AI.
Tension is the product. Players think because pressure forces them to.`;

function safeJSON<T>(text: string, fallback: T): T {
  try {
    const cleaned = text
      .trim()
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```$/i, "")
      .trim();
    return JSON.parse(cleaned) as T;
  } catch {
    return fallback;
  }
}

export async function generateEvent(
  room: RoomState
): Promise<TensionEvent> {
  const scenario = getScenario(room.scenarioId);
  if (!scenario) throw new Error("scenario missing");

  const kindPool: EventKind[] = [
    "destabilizer",
    "leak",
    "ultimatum",
    "reversal",
    "scarcity-spike",
    "alliance-rupture",
  ];
  const kind = kindPool[Math.floor(Math.random() * kindPool.length)];

  if (!client) {
    return mockEvent(scenario, room, kind);
  }

  const recentEvents = room.events.slice(-4).map((e) => `- ${e.title}: ${e.body}`).join("\n");
  const recentChat = room.messages.slice(-12).map((m) => `${m.playerName}: ${m.text}`).join("\n");

  const prompt = `Scenario: ${scenario.title}
Premise: ${scenario.premise}
Central tension: ${scenario.centralTension}
Current tension level (0-100): ${room.tension}
Phase: ${room.phase}
Round: ${room.round}

Recent events:
${recentEvents || "(none)"}

Recent negotiation:
${recentChat || "(silence)"}

Generate ONE new destabilizing event of kind "${kind}".
Return strict JSON: { "title": string (max 8 words), "body": string (2-3 sentences, present tense, cinematic), "delta": integer 4..18 (how much tension rises), "hint": string (one-line strategic implication for players, max 14 words) }`;

  try {
    const resp = await client.chat.completions.create({
      model,
      temperature: 0.95,
      messages: [
        { role: "system", content: SYSTEM_GM },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    });
    const raw = resp.choices[0]?.message?.content ?? "{}";
    const parsed = safeJSON<{
      title: string;
      body: string;
      delta: number;
      hint?: string;
    }>(raw, { title: "Pressure rises", body: "Something shifts in the room.", delta: 6 });
    return {
      id: shortId(),
      at: Date.now(),
      kind,
      title: parsed.title || "Pressure rises",
      body: parsed.body || "Something shifts in the room.",
      delta: Math.max(2, Math.min(20, Math.round(parsed.delta) || 6)),
      hint: parsed.hint,
    };
  } catch {
    return mockEvent(scenario, room, kind);
  }
}

function mockEvent(
  scenario: Scenario,
  room: RoomState,
  kind: EventKind
): TensionEvent {
  const seeds = scenario.eventSeeds;
  const used = new Set(room.events.map((e) => e.body));
  const fresh = seeds.filter((s) => !used.has(s));
  const body = (fresh.length ? fresh : seeds)[Math.floor(Math.random() * (fresh.length || seeds.length))];

  const titleByKind: Record<EventKind, string> = {
    destabilizer: "Pressure breaks through",
    leak: "A document surfaces",
    ultimatum: "A clock starts ticking",
    reversal: "The ground tilts",
    "scarcity-spike": "Resources thin",
    "alliance-rupture": "A trust snaps",
  };

  return {
    id: shortId(),
    at: Date.now(),
    kind,
    title: titleByKind[kind],
    body,
    delta: 6 + Math.floor(Math.random() * 9),
    hint: kind === "reversal" ? "Someone in this room just gained leverage." : undefined,
  };
}

export async function generateReflection(
  room: RoomState
): Promise<ReflectionReport> {
  const scenario = getScenario(room.scenarioId);
  if (!scenario) throw new Error("scenario missing");

  if (!client) {
    return mockReflection(room, scenario);
  }

  const transcript = room.messages
    .slice(-80)
    .map((m) => `${m.playerName}: ${m.text}`)
    .join("\n");
  const eventLog = room.events
    .map((e) => `- ${e.title} (Δ${e.delta}): ${e.body}`)
    .join("\n");
  const playerSheet = room.players
    .map((p) => {
      const role = scenario.roles.find((r) => r.id === p.roleId);
      return `- ${p.name} as ${role?.name ?? "Unassigned"} (${role?.archetype ?? "—"})`;
    })
    .join("\n");

  const prompt = `Scenario: ${scenario.title}
Final decision committed: ${room.finalChoice ?? "(none)"}
Tension level at decision: ${room.tension}/100

Players & roles:
${playerSheet}

Event log:
${eventLog || "(none)"}

Negotiation transcript (most recent 80 lines):
${transcript || "(none)"}

Write a Strategic Reflection Report. Tone: intelligent, cinematic, psychologically incisive. Avoid praise. Avoid generic coaching. Name specific moves. Name turning points. Identify hidden assumptions that drove decisions.

Return strict JSON of shape:
{
  "headline": string,            // one-line verdict
  "arc": string,                 // 2-3 sentences narrating the room's strategic arc
  "allianceEvolution": string,   // 2-3 sentences
  "persuasionAnalysis": string,  // 2-3 sentences
  "betrayalPatterns": string,    // 2-3 sentences
  "turningPoints": string[],     // 3-5 bullets, each a concrete moment
  "hiddenAssumptions": string,   // 2-3 sentences
  "verdict": string,             // 2-3 sentences on what this outcome reveals
  "perPlayer": [ { "playerName": string, "roleName": string, "summary": string, "style": string, "leverage": string } ]
}`;

  try {
    const resp = await client.chat.completions.create({
      model,
      temperature: 0.85,
      messages: [
        { role: "system", content: SYSTEM_GM },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    });
    const raw = resp.choices[0]?.message?.content ?? "{}";
    const parsed = safeJSON<ReflectionReport>(raw, mockReflection(room, scenario));
    if (!parsed.perPlayer || !parsed.perPlayer.length) {
      parsed.perPlayer = mockReflection(room, scenario).perPlayer;
    }
    return parsed;
  } catch {
    return mockReflection(room, scenario);
  }
}

function mockReflection(room: RoomState, scenario: Scenario): ReflectionReport {
  const tension = room.tension;
  const finalChoice = room.finalChoice ?? "no agreement";

  const perPlayer = room.players.map((p) => {
    const role = scenario.roles.find((r) => r.id === p.roleId);
    const msgCount = room.messages.filter((m) => m.playerId === p.id).length;
    let style = "Reserved — let others reveal themselves first.";
    if (msgCount > 15) style = "Aggressive — set the tempo of the room.";
    else if (msgCount > 7) style = "Balanced — pushed when leverage was real.";
    return {
      playerName: p.name,
      roleName: role?.name ?? "Observer",
      summary: role
        ? `Played ${role.archetype.toLowerCase()} under ${tension >= 70 ? "extreme" : "moderate"} pressure.`
        : "Did not commit to a role posture.",
      style,
      leverage: role?.hiddenLeverage
        ? `Held: ${role.hiddenLeverage.toLowerCase()}`
        : "Held no hidden leverage.",
    };
  });

  return {
    headline:
      tension >= 80
        ? "The room broke before it bent — and committed anyway."
        : "Pressure held just below the line. Decisions were made cold.",
    arc: `${scenario.title} opened with ${scenario.openingPressure.slice(0, 80)}... and closed on "${finalChoice}". The arc bent from posture to bargaining to a single irrevocable line.`,
    allianceEvolution:
      "Early alliances clustered around shared narratives, not shared interests. As constraints tightened, narrative ties dissolved first, transactional ones lasted longer than expected.",
    persuasionAnalysis:
      "Specificity won over rhetoric. The most effective players named concrete trades; the least effective restated values. Persuasion peaked when speakers conceded one thing before asking for another.",
    betrayalPatterns:
      "Betrayals were rarely sudden. They were pre-announced through smaller defections — a withheld detail, a delayed agreement — that the room chose not to read.",
    turningPoints: room.events.slice(0, 5).map((e) => `${e.title}: ${e.body.slice(0, 90)}`),
    hiddenAssumptions:
      "Two assumptions drove most decisions: that the loudest position was the strongest, and that the final vote would resemble the first one. Both proved costly.",
    verdict: `Final framework committed: ${finalChoice}. The decision survives this room. It may not survive what comes next.`,
    perPlayer,
  };
}

export async function aiNudge(_room: RoomState, _whisper: ChatMessage): Promise<void> {
  return;
}
