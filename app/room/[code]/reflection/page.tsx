"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TensionMeter } from "@/components/tension-meter";
import { getScenario } from "@/lib/scenarios";
import type { ReflectionReport, RoomState } from "@/lib/types";

export default function ReflectionPage({ params }: { params: { code: string } }) {
  const code = params.code.toUpperCase();
  const router = useRouter();
  const [room, setRoom] = useState<RoomState | null>(null);
  const [report, setReport] = useState<ReflectionReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const playerId =
          typeof window !== "undefined"
            ? sessionStorage.getItem(`ate:${code}:playerId`)
            : null;
        const stateRes = await fetch(
          `/api/room/${code}${playerId ? `?playerId=${playerId}` : ""}`
        );
        const stateData = await stateRes.json();
        if (!stateRes.ok) throw new Error(stateData.error || "Room not found");
        setRoom(stateData.room);

        if (stateData.room.reflection) {
          setReport(stateData.room.reflection);
          setLoading(false);
          return;
        }

        const res = await fetch(`/api/room/${code}/reflection`, {
          method: "POST",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Reflection failed");
        setReport(data.reflection);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Failed");
      } finally {
        setLoading(false);
      }
    })();
  }, [code]);

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center">
        <div className="text-center text-mutedForeground">
          <div className="font-mono text-sm uppercase tracking-[0.22em]">
            Compiling strategic reflection…
          </div>
          <p className="mt-2 text-xs">
            Pattern matching across negotiations, alliances, and turning points.
          </p>
        </div>
      </main>
    );
  }

  if (err || !room || !report) {
    return (
      <main className="grid min-h-screen place-items-center">
        <div className="text-center">
          <p className="text-danger">{err ?? "Reflection unavailable."}</p>
          <Link href="/" className="mt-4 inline-block text-sm uppercase tracking-[0.2em] text-mutedForeground hover:text-foreground">
            ← Back to engine
          </Link>
        </div>
      </main>
    );
  }

  const scenario = getScenario(room.scenarioId)!;

  return (
    <main className="container mx-auto max-w-5xl px-6 py-12">
      <header className="flex items-center justify-between">
        <Link
          href="/"
          className="text-[11px] uppercase tracking-[0.22em] text-mutedForeground hover:text-foreground"
        >
          ← Engine
        </Link>
        <Badge tone="accent">Reflection</Badge>
      </header>

      <section className="mt-8">
        <p className="text-[11px] uppercase tracking-[0.28em] text-mutedForeground">
          {scenario.title} · Room {room.code}
        </p>
        <h1 className="mt-3 text-4xl font-semibold leading-tight tracking-tight">
          {report.headline}
        </h1>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardDescription className="text-[10px] uppercase tracking-[0.2em]">
                Final framework committed
              </CardDescription>
              <CardTitle className="text-base">
                {room.finalChoice ?? "No agreement"}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription className="text-[10px] uppercase tracking-[0.2em]">
                Tension at decision
              </CardDescription>
              <CardContent className="p-0 pt-3">
                <TensionMeter value={room.tension} />
              </CardContent>
            </CardHeader>
          </Card>
        </div>
      </section>

      <section className="mt-10 space-y-5">
        <Block title="The arc" body={report.arc} />
        <div className="grid gap-5 md:grid-cols-2">
          <Block title="Alliance evolution" body={report.allianceEvolution} />
          <Block title="Persuasion analysis" body={report.persuasionAnalysis} />
        </div>
        <Block title="Betrayal patterns" body={report.betrayalPatterns} />
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Turning points</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3">
              {report.turningPoints.map((t, i) => (
                <li
                  key={i}
                  className="rounded-md border border-white/5 bg-white/[0.02] px-3 py-2 text-sm leading-relaxed"
                >
                  <span className="mr-2 font-mono text-xs text-primary">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {t}
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
        <Block title="Hidden assumptions that drove decisions" body={report.hiddenAssumptions} />
        <Block title="Verdict" body={report.verdict} />
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-semibold tracking-tight">Per-player read</h2>
        <p className="text-sm text-mutedForeground">
          What each player projected, what each held back, what each could have done differently.
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {report.perPlayer.map((p) => (
            <Card key={p.playerName + p.roleName}>
              <CardHeader>
                <CardDescription className="text-[10px] uppercase tracking-[0.2em]">
                  {p.roleName}
                </CardDescription>
                <CardTitle className="text-base">{p.playerName}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="text-foreground/90">{p.summary}</p>
                <p className="text-mutedForeground">
                  <span className="text-[10px] uppercase tracking-[0.18em] text-foreground/70">
                    Style ·{" "}
                  </span>
                  {p.style}
                </p>
                <p className="text-mutedForeground">
                  <span className="text-[10px] uppercase tracking-[0.18em] text-foreground/70">
                    Leverage ·{" "}
                  </span>
                  {p.leverage}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-12 flex flex-wrap items-center gap-3 border-t border-white/5 pt-6">
        <Link href="/lobby">
          <Button size="lg">Run another scenario →</Button>
        </Link>
        <Button
          variant="outline"
          size="lg"
          onClick={() => {
            const text = `Strategic Tension Engine — ${scenario.title}\n\n${report.headline}\n\n${report.arc}`;
            navigator.clipboard.writeText(text);
          }}
        >
          Copy headline
        </Button>
      </section>
    </main>
  );
}

function Block({ title, body }: { title: string; body: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-relaxed text-foreground/90">{body}</p>
      </CardContent>
    </Card>
  );
}
