"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { WORLD_METRIC_LABELS, type PlayerLegacyEntry, type WorldMetrics, type WorldTimelineEvent } from "@/lib/world-types";

type ApiPayload = {
  supabase: boolean;
  metrics: WorldMetrics;
  timeline: WorldTimelineEvent[];
  legacy: PlayerLegacyEntry[];
};

export default function WorldPage() {
  const [data, setData] = useState<ApiPayload | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/world?limit=40");
        const j = await res.json();
        if (!res.ok) throw new Error(j.error || "Failed");
        setData(j);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Failed");
      }
    })();
  }, []);

  if (err) {
    return (
      <main className="min-h-[100dvh] px-4 pb-28 pt-6 sm:px-6">
        <p className="text-danger">{err}</p>
        <Link href="/" className="mt-4 inline-block text-sm text-mutedForeground">
          ← Back
        </Link>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="grid min-h-[100dvh] place-items-center px-4">
        <p className="text-sm uppercase tracking-[0.22em] text-mutedForeground">
          Loading world…
        </p>
      </main>
    );
  }

  const m = data.metrics;

  return (
    <main className="min-h-[100dvh] px-4 pb-28 pt-6 sm:container sm:mx-auto sm:max-w-lg sm:px-6">
      <header className="flex items-center justify-between gap-3">
        <Link
          href="/"
          className="text-[11px] uppercase tracking-[0.22em] text-mutedForeground active:opacity-70"
        >
          ← Engine
        </Link>
        <Badge tone={data.supabase ? "success" : "muted"}>
          {data.supabase ? "DB sync" : "Live memory"}
        </Badge>
      </header>

      <h1 className="mt-6 text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
        Persistent world
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-mutedForeground">
        Every committed session nudges civilization-scale meters and writes a
        public timeline line. No coins — only consequences and reputation shaped
        by play.
      </p>

      <section className="mt-8 space-y-3">
        <h2 className="text-[11px] uppercase tracking-[0.22em] text-mutedForeground">
          World meters
        </h2>
        {(Object.keys(WORLD_METRIC_LABELS) as (keyof WorldMetrics)[]).map((k) => (
          <div key={k} className="space-y-1">
            <div className="flex justify-between text-xs text-mutedForeground">
              <span>{WORLD_METRIC_LABELS[k]}</span>
              <span className="font-mono text-foreground">{m[k]}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary/80 to-accent/80"
                style={{ width: `${m[k]}%` }}
              />
            </div>
          </div>
        ))}
      </section>

      <section className="mt-10">
        <h2 className="text-[11px] uppercase tracking-[0.22em] text-mutedForeground">
          Timeline
        </h2>
        <ol className="mt-3 space-y-3">
          {data.timeline.length === 0 && (
            <li className="text-sm text-mutedForeground">
              No sessions imprinted yet. Finish a room and have the host commit
              a final decision.
            </li>
          )}
          {data.timeline.map((ev) => (
            <li key={ev.id}>
              <Card className="border-white/10">
                <CardHeader className="pb-2">
                  <CardDescription className="text-[10px] uppercase tracking-[0.18em]">
                    Session {ev.sessionIndex} · {ev.scenarioId} · {ev.interactionMode}
                  </CardDescription>
                  <CardTitle className="text-base leading-snug">{ev.headline}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-foreground/90">
                  <p className="leading-relaxed">{ev.narrative}</p>
                  <p className="font-mono text-[11px] text-mutedForeground">
                    Room {ev.sessionCode} · choice {ev.finalChoice} · tension{" "}
                    {ev.tensionTerminal}
                  </p>
                </CardContent>
              </Card>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-10">
        <h2 className="text-[11px] uppercase tracking-[0.22em] text-mutedForeground">
          Strategic reputation (this instance)
        </h2>
        <p className="mt-1 text-xs text-mutedForeground">
          Tags derived from reflection — influence and identity, not XP.
        </p>
        <ul className="mt-3 space-y-2">
          {data.legacy.length === 0 && (
            <li className="text-sm text-mutedForeground">No legacy yet.</li>
          )}
          {data.legacy.map((p) => (
            <li
              key={p.playerKey}
              className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs text-foreground">{p.displayHint}</span>
                <span className="text-[10px] text-mutedForeground">
                  {p.sessionsPlayed} sessions
                </span>
              </div>
              <div className="mt-1 flex flex-wrap gap-1">
                {p.tags.map((t) => (
                  <Badge key={t} tone="accent" className="text-[9px]">
                    {t}
                  </Badge>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <div className="fixed bottom-0 left-0 right-0 border-t border-white/10 bg-background/90 p-4 backdrop-blur-md sm:static sm:mt-10 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
        <div className="mx-auto flex max-w-lg gap-3 sm:max-w-none">
          <Link href="/lobby" className="flex-1">
            <Button size="lg" className="min-h-12 w-full touch-manipulation">
              Enter lobby →
            </Button>
          </Link>
          <Button
            variant="outline"
            size="lg"
            className="min-h-12 flex-1 touch-manipulation"
            onClick={() => {
              void fetch("/api/world?limit=40").then(async (res) => {
                const j = (await res.json()) as ApiPayload;
                if (res.ok) setData(j);
              });
            }}
          >
            Refresh
          </Button>
        </div>
      </div>
    </main>
  );
}
