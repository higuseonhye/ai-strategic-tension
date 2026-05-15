import type { PlayerLegacyEntry, WorldMetrics, WorldTimelineEvent } from "./world-types";
import {
  getWorldMetrics,
  getWorldTimeline,
  getPlayerLegacyList,
  recordSessionInWorldMemory,
} from "./world-memory";
import type { RoomState } from "./types";

function supabaseConfigured(): boolean {
  return Boolean(
    process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

async function getAdminClient() {
  if (!supabaseConfigured()) return null;
  const { createClient } = await import("@supabase/supabase-js");
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

const GLOBAL_WORLD_ID =
  process.env.WORLD_ID ?? "00000000-0000-0000-0000-000000000001";

function mergeLegacies(
  db: PlayerLegacyEntry[] | null,
  mem: PlayerLegacyEntry[]
): PlayerLegacyEntry[] {
  const map = new Map<string, PlayerLegacyEntry>();
  for (const e of db ?? []) map.set(e.playerKey, e);
  for (const e of mem) {
    const prev = map.get(e.playerKey);
    if (!prev || e.updatedAt >= prev.updatedAt) map.set(e.playerKey, e);
  }
  return [...map.values()]
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, 40);
}

export async function persistPlayerLegacies(entries: PlayerLegacyEntry[]) {
  const client = await getAdminClient();
  if (!client || entries.length === 0) return;
  for (const e of entries) {
    try {
      await client.from("player_legacy").upsert(
        {
          world_id: GLOBAL_WORLD_ID,
          player_key: e.playerKey,
          display_hint: e.displayHint,
          tags: e.tags,
          sessions_played: e.sessionsPlayed,
          last_contribution: e.lastContribution,
          updated_at: new Date(e.updatedAt).toISOString(),
        },
        { onConflict: "world_id,player_key" }
      );
    } catch {
      /* optional */
    }
  }
}

async function loadPlayerLegacyFromSupabase(): Promise<PlayerLegacyEntry[] | null> {
  const client = await getAdminClient();
  if (!client) return null;
  try {
    const { data } = await client
      .from("player_legacy")
      .select("*")
      .eq("world_id", GLOBAL_WORLD_ID)
      .order("updated_at", { ascending: false })
      .limit(80);
    if (!data?.length) return null;
    return data.map((r) => ({
      playerKey: r.player_key,
      displayHint: r.display_hint,
      tags: r.tags ?? [],
      sessionsPlayed: r.sessions_played,
      lastContribution: (r.last_contribution ??
        {}) as PlayerLegacyEntry["lastContribution"],
      updatedAt: new Date(r.updated_at).getTime(),
    }));
  } catch {
    return null;
  }
}

export async function persistSessionWorldOutcome(room: RoomState) {
  const ev = recordSessionInWorldMemory(room);
  const client = await getAdminClient();
  if (!client) return { persisted: false, event: ev };

  try {
    await client.from("world_events").insert({
      world_id: GLOBAL_WORLD_ID,
      session_code: ev.sessionCode,
      scenario_id: ev.scenarioId,
      interaction_mode: ev.interactionMode,
      final_choice: ev.finalChoice,
      tension_terminal: ev.tensionTerminal,
      session_index: ev.sessionIndex,
      headline: ev.headline,
      narrative: ev.narrative,
      metric_deltas: ev.deltas,
    });

    const m = getWorldMetrics();
    await client.from("world_metrics").upsert(
      {
        world_id: GLOBAL_WORLD_ID,
        stability: m.stability,
        climate: m.climate,
        orbital: m.orbital,
        knowledge_commons: m.knowledgeCommons,
        compute_access: m.computeAccess,
        public_trust: m.publicTrust,
        diplomatic_cohesion: m.diplomaticCohesion,
        session_count: ev.sessionIndex,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "world_id" }
    );
  } catch {
    /* Supabase optional — memory remains source of truth for this process */
  }

  return { persisted: true, event: ev };
}

export async function loadWorldFromSupabaseIfConfigured(): Promise<{
  metrics: WorldMetrics | null;
  events: WorldTimelineEvent[];
} | null> {
  const client = await getAdminClient();
  if (!client) return null;
  try {
    const { data: mrow } = await client
      .from("world_metrics")
      .select("*")
      .eq("world_id", GLOBAL_WORLD_ID)
      .maybeSingle();

    const { data: erows } = await client
      .from("world_events")
      .select("*")
      .eq("world_id", GLOBAL_WORLD_ID)
      .order("created_at", { ascending: false })
      .limit(80);

    const metrics: WorldMetrics | null = mrow
      ? {
          stability: mrow.stability,
          climate: mrow.climate,
          orbital: mrow.orbital,
          knowledgeCommons: mrow.knowledge_commons,
          computeAccess: mrow.compute_access,
          publicTrust: mrow.public_trust,
          diplomaticCohesion: mrow.diplomatic_cohesion,
        }
      : null;

    const events: WorldTimelineEvent[] = (erows ?? []).map((r) => ({
      id: r.id,
      at: new Date(r.created_at).getTime(),
      sessionIndex: r.session_index,
      sessionCode: r.session_code,
      scenarioId: r.scenario_id,
      interactionMode: r.interaction_mode,
      finalChoice: r.final_choice,
      tensionTerminal: r.tension_terminal,
      headline: r.headline,
      narrative: r.narrative,
      deltas: r.metric_deltas ?? {},
    }));

    return { metrics, events };
  } catch {
    return null;
  }
}

export async function getWorldSnapshotForApi(opts?: { timelineLimit?: number }) {
  const limit = opts?.timelineLimit ?? 50;
  const remote = await loadWorldFromSupabaseIfConfigured();
  const dbLegacy = await loadPlayerLegacyFromSupabase();
  const memLegacy = getPlayerLegacyList(60);
  const legacy = mergeLegacies(dbLegacy, memLegacy).slice(0, 30);

  if (remote?.metrics) {
    const timeline = remote.events.length
      ? remote.events.slice(0, limit)
      : getWorldTimeline(limit);
    return {
      supabase: true,
      metrics: remote.metrics,
      timeline,
      legacy,
    };
  }
  return {
    supabase: supabaseConfigured(),
    metrics: getWorldMetrics(),
    timeline: getWorldTimeline(limit),
    legacy,
  };
}
