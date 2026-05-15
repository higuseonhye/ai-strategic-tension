"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SCENARIOS } from "@/lib/scenarios";
import type { InteractionMode, ScenarioId } from "@/lib/types";
import { ScenarioCard } from "@/components/scenario-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const MODE_OPTIONS: {
  id: InteractionMode;
  title: string;
  body: string;
  disabled?: boolean;
}[] = [
  {
    id: "solo",
    title: "Solo · multi-agent field",
    body: "You vs several seated AI agents — asymmetric goals; they react to you and each other.",
  },
  {
    id: "crisis",
    title: "N:N crisis",
    body: "2–6 players. Alliances, leaks, reversals.",
  },
  {
    id: "duel",
    title: "Strategic duel",
    body: "Exactly 2. Bilateral brinkmanship.",
  },
  {
    id: "influence",
    title: "1:N influence",
    body: "2–6. Fragment a room from one lectern.",
  },
  {
    id: "hybrid",
    title: "Hybrid field",
    body: "2–6 humans + synthetic seats fill unused scenario roles on start.",
  },
  {
    id: "hidden_faction",
    title: "Hidden AI faction",
    body: "Reserved — asymmetry lab.",
    disabled: true,
  },
];

export default function LobbyPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [scenarioId, setScenarioId] = useState<ScenarioId>(SCENARIOS[0].id);
  const [interactionMode, setInteractionMode] = useState<InteractionMode>("solo");
  const [aiDuelOpponent, setAiDuelOpponent] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [busy, setBusy] = useState<"create" | "join" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function createRoom() {
    if (!name.trim()) return setError("Pick a name first.");
    setError(null);
    setBusy("create");
    try {
      const res = await fetch("/api/room", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name,
          scenarioId,
          interactionMode,
          aiOpponentEnabled: interactionMode === "duel" ? aiDuelOpponent : false,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create room");
      sessionStorage.setItem(`ate:${data.code}:playerId`, data.playerId);
      sessionStorage.setItem(`ate:${data.code}:name`, name);
      router.push(`/room/${data.code}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(null);
    }
  }

  async function joinRoom() {
    if (!name.trim()) return setError("Pick a name first.");
    if (!joinCode.trim()) return setError("Enter a room code.");
    setError(null);
    setBusy("join");
    try {
      const code = joinCode.trim().toUpperCase();
      const res = await fetch("/api/room/join", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ code, name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to join");
      sessionStorage.setItem(`ate:${data.code}:playerId`, data.playerId);
      sessionStorage.setItem(`ate:${data.code}:name`, name);
      router.push(`/room/${data.code}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <main className="container mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <Link href="/" className="text-sm uppercase tracking-[0.2em] text-mutedForeground hover:text-foreground">
          ← Strategic Tension Engine
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/world">
            <Badge tone="accent" className="cursor-pointer px-2 py-1 hover:opacity-90">
              World
            </Badge>
          </Link>
          <Badge tone="muted">Lobby</Badge>
        </div>
      </header>

      <div className="mt-10 grid gap-8 md:grid-cols-[1fr_360px]">
        <section>
          <h1 className="text-3xl font-semibold tracking-tight">
            Choose your crisis.
          </h1>
          <p className="mt-2 text-sm text-mutedForeground">
            Each scenario assigns secret roles, hidden goals, and one
            irreversible ending. None of them have a clean answer.
          </p>

          <div className="mt-6">
            <h2 className="text-[11px] uppercase tracking-[0.2em] text-mutedForeground">
              Interaction mode
            </h2>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {MODE_OPTIONS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  disabled={m.disabled}
                  onClick={() => {
                    if (!m.disabled) {
                      setInteractionMode(m.id);
                      if (m.id !== "duel") setAiDuelOpponent(false);
                    }
                  }}
                  className={`rounded-xl border p-4 text-left transition touch-manipulation ${
                    interactionMode === m.id
                      ? "border-primary shadow-[0_0_0_1px_hsl(8_90%_58%/0.5)]"
                      : "border-white/10 hover:border-white/25"
                  } ${m.disabled ? "cursor-not-allowed opacity-40" : ""}`}
                >
                  <div className="text-sm font-semibold">{m.title}</div>
                  <div className="mt-1 text-xs text-mutedForeground">{m.body}</div>
                </button>
              ))}
            </div>
          </div>

          {interactionMode === "duel" && (
            <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4 touch-manipulation">
              <input
                type="checkbox"
                checked={aiDuelOpponent}
                onChange={(e) => setAiDuelOpponent(e.target.checked)}
                className="mt-1 h-4 w-4 accent-primary"
              />
              <span>
                <span className="text-sm font-medium">1:1 vs AI adversary (beta)</span>
                <span className="mt-1 block text-xs text-mutedForeground">
                  Only you join the room; an AI counterparty is injected when the
                  host starts. Human-vs-human duel stays two seats.
                </span>
              </span>
            </label>
          )}

          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {SCENARIOS.map((s) => (
              <ScenarioCard
                key={s.id}
                scenario={s}
                selected={scenarioId === s.id}
                onSelect={() => setScenarioId(s.id)}
              />
            ))}
          </div>
        </section>

        <aside className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Identity</CardTitle>
              <CardDescription>
                The room will know you by this name. So will every alliance and
                every betrayal.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="Your codename (e.g. Halberd, Astra, Park)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={28}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Open a room</CardTitle>
              <CardDescription>
                You become host. You assign roles by starting the game.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={createRoom}
                disabled={busy !== null}
                size="lg"
                className="w-full"
              >
                {busy === "create" ? "Opening room…" : "Create room"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Join an existing room</CardTitle>
              <CardDescription>5-letter room code.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                placeholder="ROOM CODE"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="text-center font-mono tracking-[0.32em]"
              />
              <Button
                onClick={joinRoom}
                disabled={busy !== null}
                variant="outline"
                size="lg"
                className="w-full"
              >
                {busy === "join" ? "Joining…" : "Join"}
              </Button>
            </CardContent>
          </Card>

          {error && (
            <div className="rounded-md border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
              {error}
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}
