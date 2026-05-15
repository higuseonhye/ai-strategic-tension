"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRoomStream } from "@/components/use-room-stream";
import { TensionMeter } from "@/components/tension-meter";
import { ChatPanel } from "@/components/chat-panel";
import { EventFeed } from "@/components/event-feed";
import { RoleDossier } from "@/components/role-dossier";
import { PlayerList, PlayerCount } from "@/components/player-list";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getScenario } from "@/lib/scenarios";
import type { InteractionMode, Phase, Role, RoomState } from "@/lib/types";
import { humanPlayerCount } from "@/lib/mode-utils";
import { cn } from "@/lib/utils";

const PHASE_LABEL: Record<Phase, string> = {
  lobby: "Lobby",
  briefing: "Briefing",
  negotiation: "Negotiation",
  escalation: "Escalation",
  endgame: "Endgame",
  decision: "Decision",
  reflection: "Reflection",
};

const MODE_LABEL: Record<InteractionMode, string> = {
  crisis: "N:N crisis",
  duel: "Strategic duel",
  influence: "1:N influence",
  hidden_faction: "Hidden faction",
};

export default function RoomPage({ params }: { params: { code: string } }) {
  const code = params.code.toUpperCase();
  const router = useRouter();
  const [playerId, setPlayerId] = useState<string | undefined>();

  useEffect(() => {
    const id = sessionStorage.getItem(`ate:${code}:playerId`) || undefined;
    if (!id) {
      router.replace(`/lobby?join=${code}`);
      return;
    }
    setPlayerId(id);
  }, [code, router]);

  const { room, connected } = useRoomStream(code, playerId);
  const scenario = useMemo(
    () => (room ? getScenario(room.scenarioId) : undefined),
    [room]
  );

  // Auto-route to reflection page once final decision committed
  useEffect(() => {
    if (room?.phase === "reflection") {
      router.replace(`/room/${code}/reflection`);
    }
  }, [room?.phase, code, router]);

  if (!playerId || !room || !scenario) {
    return (
      <main className="grid min-h-screen place-items-center">
        <div className="text-center text-mutedForeground">
          <p className="text-sm uppercase tracking-[0.2em]">
            Connecting to room {code}…
          </p>
        </div>
      </main>
    );
  }

  const me = room.players.find((p) => p.id === playerId);
  const isHost = me?.id === room.hostId;
  const myRole = scenario.roles.find((r) => r.id === me?.roleId);
  const playing = room.phase !== "lobby";

  return (
    <main className="container mx-auto max-w-7xl px-4 py-6">
      {/* Top bar */}
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-[11px] uppercase tracking-[0.22em] text-mutedForeground hover:text-foreground"
          >
            ← Engine
          </Link>
          <span className="text-mutedForeground">/</span>
          <h1 className="text-lg font-semibold tracking-tight">
            {scenario.title}
          </h1>
          <Badge tone={connected ? "success" : "danger"}>
            {connected ? "Live" : "Reconnecting"}
          </Badge>
          <Badge tone="muted">{PHASE_LABEL[room.phase]}</Badge>
          <Badge tone="accent">{MODE_LABEL[room.interactionMode]}</Badge>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-mutedForeground">
            Room
            <code className="rounded bg-white/5 px-2 py-1 font-mono text-foreground">
              {room.code}
            </code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(room.code);
              }}
              className="text-[10px] uppercase tracking-[0.22em] text-mutedForeground hover:text-foreground"
            >
              Copy
            </button>
          </div>
          <PlayerCount
            players={room.players}
            max={room.interactionMode === "duel" ? 2 : 6}
          />
        </div>
      </header>

      {!playing ? (
        <LobbyView
          code={code}
          isHost={isHost}
          room={room}
          selfId={playerId}
          scenarioTitle={scenario.title}
        />
      ) : (
        <PlayView
          room={room}
          playerId={playerId}
          isHost={isHost}
          myRoleName={myRole?.name}
        />
      )}
    </main>
  );
}

function LobbyView({
  code,
  isHost,
  room,
  selfId,
  scenarioTitle,
}: {
  code: string;
  isHost: boolean;
  room: RoomState;
  selfId: string;
  scenarioTitle: string;
}) {
  const [starting, setStarting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const cap = room.interactionMode === "duel" ? 2 : 6;
  const canStart =
    room.interactionMode === "duel" && room.aiOpponentEnabled
      ? room.players.length === 1
      : room.interactionMode === "duel"
        ? room.players.length === 2
        : room.players.length >= 2;

  async function start() {
    setStarting(true);
    setErr(null);
    try {
      const res = await fetch(`/api/room/${code}/start`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ playerId: selfId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    } finally {
      setStarting(false);
    }
  }

  return (
    <div className="mt-8 grid gap-8 md:grid-cols-[1fr_320px]">
      <section className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{scenarioTitle} — pre-briefing</CardTitle>
            <CardDescription>
              Share the room code with up to {cap - 1} other player
              {cap > 2 ? "s" : ""}. Roles are assigned the moment the host
              starts the session, and they are irreversible.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-white/10 bg-black/40 p-6">
              <p className="text-[10px] uppercase tracking-[0.22em] text-mutedForeground">
                Room code
              </p>
              <p className="mt-1 font-mono text-5xl tracking-[0.18em]">{code}</p>
              <p className="mt-3 text-xs text-mutedForeground">
                {room.interactionMode === "duel"
                  ? "Duel mode: exactly two humans. No spectators."
                  : "The room is live once two players are present. Start with as few as two — every scenario scales."}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tension primitives in play</CardTitle>
            <CardDescription>
              These are the levers the AI game master will pull. Plan for them.
              Or be surprised by them.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-2 text-sm sm:grid-cols-2">
              {[
                "Scarcity spikes",
                "Asymmetric information",
                "Betrayal potential",
                "Reversal moments",
                "Time pressure",
                "Impossible tradeoffs",
              ].map((line) => (
                <li
                  key={line}
                  className="rounded-md border border-white/5 bg-white/[0.02] px-3 py-2 text-foreground/90"
                >
                  {line}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      <aside className="space-y-5">
        <Card>
          <CardHeader>
            <CardTitle>Players in this room</CardTitle>
            <CardDescription>
              {room.players.length}/{cap} —{" "}
              {room.interactionMode === "duel" && room.aiOpponentEnabled
                ? "need exactly 1 human; AI joins on start."
                : room.interactionMode === "duel"
                  ? "need exactly 2 humans."
                  : "minimum 2 to start."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PlayerList room={room} selfId={selfId} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Start the session</CardTitle>
            <CardDescription>
              Only the host can begin. Once started, no one new joins.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isHost ? (
              <Button
                onClick={start}
                disabled={starting || !canStart}
                size="lg"
                className="w-full"
              >
                {starting ? "Igniting…" : "Begin the crisis"}
              </Button>
            ) : (
              <div className="rounded-md border border-white/10 bg-white/[0.02] p-3 text-sm text-mutedForeground">
                Waiting for the host to start. Roles will appear the moment
                they do.
              </div>
            )}
            {err && (
              <div className="rounded-md border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
                {err}
              </div>
            )}
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}

function PlayView({
  room,
  playerId,
  isHost,
  myRoleName,
}: {
  room: RoomState;
  playerId: string;
  isHost: boolean;
  myRoleName?: string;
}) {
  const r = room;
  const scenario = getScenario(r.scenarioId)!;
  const myRole = scenario.roles.find(
    (x) => x.id === r.players.find((p) => p.id === playerId)?.roleId
  );
  const opponent = r.players.find((p) => p.id !== playerId);
  const oppRole =
    opponent && !opponent.isAi
      ? scenario.roles.find((x) => x.id === opponent.roleId)
      : undefined;
  const humans = Math.max(1, humanPlayerCount(r));
  const isDuel = r.interactionMode === "duel";

  const [eventBusy, setEventBusy] = useState(false);
  const [decisionBusy, setDecisionBusy] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  async function triggerEvent() {
    setEventBusy(true);
    setErrMsg(null);
    try {
      const res = await fetch(`/api/room/${r.code}/event`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Event failed");
      }
    } catch (e) {
      setErrMsg(e instanceof Error ? e.message : "Event failed");
    } finally {
      setEventBusy(false);
    }
  }

  const choices = parseChoices(scenario.finalDecisionPrompt);
  const myVote = r.votes.find((v: any) => v.playerId === playerId)?.choice;

  async function castVote(choice: string) {
    setDecisionBusy(true);
    setErrMsg(null);
    try {
      const res = await fetch(`/api/room/${r.code}/decision`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ playerId, choice }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Vote failed");
      }
    } catch (e) {
      setErrMsg(e instanceof Error ? e.message : "Vote failed");
    } finally {
      setDecisionBusy(false);
    }
  }

  async function commitFinal() {
    if (!myVote) return;
    setCommitting(true);
    setErrMsg(null);
    try {
      const res = await fetch(`/api/room/${r.code}/decision`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ playerId, choice: myVote, commit: true }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Commit failed");
      }
    } catch (e) {
      setErrMsg(e instanceof Error ? e.message : "Commit failed");
    } finally {
      setCommitting(false);
    }
  }

  const showDecisionPanel =
    r.phase === "endgame" || r.phase === "decision" || r.tension >= 80;

  const channelTitle =
    r.interactionMode === "duel"
      ? "Duel channel"
      : r.interactionMode === "influence"
        ? "Influence chamber"
        : "Negotiation channel";

  const decisionPanel = showDecisionPanel && (
    <Card className={cn(r.tension >= 90 && "ring-2 ring-primary/40 animate-pulseGlow")}>
      <CardHeader>
        <CardTitle className="text-base">Final framework</CardTitle>
        <CardDescription className="text-xs">
          {scenario.finalDecisionPrompt.split("\n\n")[0]}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {choices.map((c) => (
          <button
            key={c.letter}
            onClick={() => castVote(c.letter)}
            disabled={decisionBusy}
            className={cn(
              "group w-full min-h-11 rounded-md border px-3 py-2 text-left text-sm transition touch-manipulation",
              myVote === c.letter
                ? "border-primary bg-primary/10 text-foreground"
                : "border-white/10 bg-white/[0.02] hover:border-white/30"
            )}
          >
            <span className="font-mono text-xs text-primary">{c.letter}.</span>{" "}
            {c.text}
            <span className="ml-2 text-[10px] uppercase tracking-[0.16em] text-mutedForeground">
              {countVotes(r.votes, c.letter)}/{humans}
            </span>
          </button>
        ))}
        {isHost && (
          <Button
            className="mt-3 min-h-12 w-full touch-manipulation"
            size="lg"
            onClick={commitFinal}
            disabled={!myVote || committing}
          >
            {committing ? "Committing…" : "Commit final decision (irreversible)"}
          </Button>
        )}
        {!isHost && (
          <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-mutedForeground">
            Host commits the final decision when the room is ready.
          </p>
        )}
        {errMsg && (
          <div className="mt-2 rounded-md border border-danger/30 bg-danger/10 p-2 text-xs text-danger">
            {errMsg}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const eventPanel = (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Event feed</CardTitle>
          {isHost && r.phase !== "decision" && (
            <Button
              size="sm"
              variant="outline"
              className="min-h-9 touch-manipulation"
              onClick={triggerEvent}
              disabled={eventBusy}
            >
              {eventBusy ? "…" : "Inject event"}
            </Button>
          )}
        </div>
        <CardDescription className="text-xs">
          The AI destabilizes when the room cools down too much.
        </CardDescription>
      </CardHeader>
      <CardContent className="max-h-[min(50vh,420px)] overflow-y-auto">
        <EventFeed events={r.events} />
      </CardContent>
    </Card>
  );

  if (isDuel) {
    return (
      <div className="mt-6 flex flex-col gap-5">
        <div className="grid gap-4 md:grid-cols-2">
          <RoleDossier role={myRole} />
          {opponent?.isAi ? (
            <AiOpponentCard />
          ) : oppRole && opponent ? (
            <ReadOnlyOpponentCard name={opponent.name} role={oppRole} />
          ) : (
            <Card className="border-dashed border-white/20 p-5 text-sm text-mutedForeground">
              Waiting for opponent…
            </Card>
          )}
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-3 lg:sticky lg:top-4 lg:self-start">
            <TensionMeter value={r.tension} />
            <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-mutedForeground">
              <span>Round {r.round}</span>
              <span>{r.events.length} events</span>
            </div>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Players</CardTitle>
                <CardDescription className="text-xs">
                  Two seats. No neutral ground.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PlayerList room={r} selfId={playerId} showRoles />
              </CardContent>
            </Card>
          </div>

          <section className="flex min-h-[min(70vh,560px)] flex-col overflow-hidden rounded-xl border border-white/10 bg-card/60 lg:col-span-2">
            <div className="border-b border-white/5 px-4 py-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium">{channelTitle}</h2>
                <span className="text-[10px] uppercase tracking-[0.2em] text-mutedForeground">
                  {myRoleName ? `Speaking as ${myRoleName}` : "Observer"}
                </span>
              </div>
            </div>
            <ChatPanel room={r} playerId={playerId} />
          </section>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {eventPanel}
          {decisionPanel}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 grid gap-5 lg:grid-cols-[300px_1fr_320px]">
      {/* Left rail — dossier + players */}
      <aside className="space-y-5 lg:sticky lg:top-4 lg:self-start">
        <div className="space-y-3">
          <TensionMeter value={r.tension} />
          <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-mutedForeground">
            <span>Round {r.round}</span>
            <span>{r.events.length} events</span>
          </div>
        </div>

        <RoleDossier role={myRole} />

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Players</CardTitle>
            <CardDescription className="text-xs">
              Only your role is visible. Others show archetypes only.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PlayerList room={r} selfId={playerId} showRoles />
          </CardContent>
        </Card>
      </aside>

      {/* Center — chat */}
      <section className="flex h-[calc(100vh-220px)] min-h-[520px] flex-col overflow-hidden rounded-xl border border-white/10 bg-card/60">
        <div className="border-b border-white/5 px-4 py-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium">{channelTitle}</h2>
            <span className="text-[10px] uppercase tracking-[0.2em] text-mutedForeground">
              {myRoleName ? `Speaking as ${myRoleName}` : "Observer"}
            </span>
          </div>
        </div>
        <ChatPanel room={r} playerId={playerId} />
      </section>

      {/* Right rail — events + decision */}
      <aside className="space-y-5">
        {eventPanel}
        {decisionPanel}
      </aside>
    </div>
  );
}

function ReadOnlyOpponentCard({ name, role }: { name: string; role: Role }) {
  return (
    <Card className="border-white/15">
      <CardHeader className="pb-2">
        <CardDescription className="text-[10px] uppercase tracking-[0.2em]">
          Opponent · public brief only
        </CardDescription>
        <CardTitle className="text-base">{name}</CardTitle>
        <p className="text-xs text-mutedForeground">{role.archetype}</p>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-relaxed text-foreground/90">{role.publicBrief}</p>
      </CardContent>
    </Card>
  );
}

function AiOpponentCard() {
  return (
    <Card className="border-danger/30 bg-danger/[0.07]">
      <CardHeader className="pb-2">
        <CardDescription className="text-[10px] uppercase tracking-[0.2em]">
          1:AI adversary
        </CardDescription>
        <CardTitle className="text-base">Adversary</CardTitle>
        <p className="text-xs text-mutedForeground">
          Strategic counterweight — not a tutor. Pressure only.
        </p>
      </CardHeader>
      <CardContent className="text-sm leading-relaxed text-foreground/85">
        Replies are terse, confrontational, and throttled. Your job is to survive
        the frame long enough to commit an irreversible line.
      </CardContent>
    </Card>
  );
}

function parseChoices(prompt: string): Array<{ letter: string; text: string }> {
  const lines = prompt.split("\n").filter(Boolean);
  const out: Array<{ letter: string; text: string }> = [];
  for (const line of lines) {
    const m = line.match(/^([A-E])\)\s*(.+)$/);
    if (m) out.push({ letter: m[1], text: m[2] });
  }
  return out;
}

function countVotes(votes: Array<{ choice: string }>, letter: string) {
  return votes.filter((v) => v.choice === letter).length;
}
