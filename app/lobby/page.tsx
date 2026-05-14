"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SCENARIOS } from "@/lib/scenarios";
import type { ScenarioId } from "@/lib/types";
import { ScenarioCard } from "@/components/scenario-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function LobbyPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [scenarioId, setScenarioId] = useState<ScenarioId>(SCENARIOS[0].id);
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
        body: JSON.stringify({ name, scenarioId }),
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
    <main className="container mx-auto max-w-6xl px-6 py-12">
      <header className="flex items-center justify-between">
        <Link href="/" className="text-sm uppercase tracking-[0.2em] text-mutedForeground hover:text-foreground">
          ← Strategic Tension Engine
        </Link>
        <Badge tone="muted">Lobby</Badge>
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
