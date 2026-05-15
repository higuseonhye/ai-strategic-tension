import type { WorldMetrics, WorldTimelineEvent } from "./world-types";
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
  if (remote?.metrics) {
    const timeline = remote.events.length
      ? remote.events.slice(0, limit)
      : getWorldTimeline(limit);
    return {
      supabase: true,
      metrics: remote.metrics,
      timeline,
      legacy: getPlayerLegacyList(30),
    };
  }
  return {
    supabase: supabaseConfigured(),
    metrics: getWorldMetrics(),
    timeline: getWorldTimeline(limit),
    legacy: getPlayerLegacyList(30),
  };
}
