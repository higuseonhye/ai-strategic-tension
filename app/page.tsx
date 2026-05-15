import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SCENARIOS } from "@/lib/scenarios";

export default function LandingPage() {
  return (
    <main className="relative">
      {/* Hero */}
      <section className="container mx-auto max-w-6xl px-6 pt-20 pb-16 sm:pt-28 sm:pb-24">
        <div className="flex items-center gap-3">
          <span className="flex h-2 w-2 rounded-full bg-primary animate-pulseGlow" />
          <span className="text-[11px] uppercase tracking-[0.32em] text-mutedForeground">
            AI Strategic Tension Engine · MVP
          </span>
        </div>
        <h1 className="mt-6 max-w-3xl text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
          The room was under control.
          <br />
          <span className="text-primary">Then everything changed.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-mutedForeground">
          A multiplayer strategy platform where AI is the pressure designer, not
          the protagonist. Players negotiate evolving constraints, shifting
          alliances, and impossible tradeoffs. Strategic thinking emerges as a
          byproduct of tension — not from prompts.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Link href="/lobby">
            <Button size="lg" className="min-h-12 px-7 touch-manipulation">
              Enter the lobby →
            </Button>
          </Link>
          <Link href="/world">
            <Button size="lg" variant="outline" className="min-h-12 touch-manipulation">
              Living world →
            </Button>
          </Link>
          <a
            href="#scenarios"
            className="text-sm uppercase tracking-[0.18em] text-mutedForeground hover:text-foreground"
          >
            See scenarios
          </a>
        </div>

        <dl className="mt-16 grid grid-cols-2 gap-6 sm:grid-cols-4">
          {[
            ["2–6", "Players per room"],
            ["3", "Strategic scenarios"],
            ["7", "Tension primitives"],
            ["1", "Final irreversible decision"],
          ].map(([n, label]) => (
            <div key={label} className="border-l border-white/10 pl-4">
              <dt className="font-mono text-3xl text-foreground">{n}</dt>
              <dd className="mt-1 text-[11px] uppercase tracking-[0.18em] text-mutedForeground">
                {label}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Philosophy */}
      <section className="border-t border-white/5">
        <div className="container mx-auto max-w-6xl grid gap-10 px-6 py-16 md:grid-cols-2">
          <div>
            <Badge tone="muted">Product philosophy</Badge>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">
              People do not enjoy thinking exercises.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-mutedForeground">
              They think deeply during games, negotiations, survival, betrayal,
              and impossible tradeoffs. We don't generate ideas. We generate
              pressure. The thinking is the byproduct.
            </p>
          </div>
          <ul className="space-y-3 text-sm">
            {[
              "Scarcity that forces judgement",
              "Asymmetric information and hidden agendas",
              "Betrayal potential at every turn",
              "Reversals — late-game leverage shifts",
              "Time pressure on irreversible decisions",
              "Impossible tradeoffs with no clean answer",
              "Dynamic systems that destabilize mid-play",
            ].map((line, i) => (
              <li
                key={line}
                className="flex items-start gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-4 py-2.5"
              >
                <span className="mt-0.5 font-mono text-xs text-primary">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-foreground/90">{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Scenarios */}
      <section id="scenarios" className="border-t border-white/5">
        <div className="container mx-auto max-w-6xl px-6 py-16">
          <div className="flex items-end justify-between">
            <div>
              <Badge tone="muted">Opening scenarios</Badge>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                Three crises. No clean exits.
              </h2>
            </div>
            <Link href="/lobby">
              <Button variant="outline">Choose one →</Button>
            </Link>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {SCENARIOS.map((s) => (
              <article
                key={s.id}
                style={{
                  ["--accent" as string]: `hsl(${s.accentHue})`,
                }}
                className="group relative overflow-hidden rounded-xl border border-white/10 bg-card/80 p-5"
              >
                <div
                  className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-25 blur-3xl"
                  style={{ background: "var(--accent)" }}
                />
                <h3 className="text-xl font-semibold tracking-tight">{s.title}</h3>
                <p className="mt-1 text-sm italic text-mutedForeground">{s.tagline}</p>
                <p className="mt-4 text-sm leading-relaxed text-foreground/85">
                  {s.premise}
                </p>
                <div className="mt-4 border-t border-white/5 pt-3 text-[11px] uppercase tracking-[0.16em] text-mutedForeground">
                  Central tension
                </div>
                <p className="mt-1 text-sm text-foreground/90">{s.centralTension}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Loop */}
      <section className="border-t border-white/5">
        <div className="container mx-auto max-w-6xl px-6 py-16">
          <Badge tone="muted">Gameplay loop</Badge>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">
            Nine beats. One ending.
          </h2>
          <ol className="mt-8 grid gap-3 md:grid-cols-3">
            {[
              "Players enter a room (2–6)",
              "AI generates the world and constraint",
              "Secret roles and goals assigned",
              "Realtime negotiation begins",
              "AI injects destabilizing events",
              "Alliances shift, tension rises",
              "Constraints intensify, time shrinks",
              "Final irreversible decision",
              "Strategic Reflection Report",
            ].map((line, i) => (
              <li
                key={line}
                className="rounded-lg border border-white/10 bg-white/[0.02] p-4"
              >
                <span className="font-mono text-xs text-primary">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="mt-2 text-sm text-foreground/90">{line}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <footer className="border-t border-white/5 py-10">
        <div className="container mx-auto flex max-w-6xl items-center justify-between px-6 text-xs text-mutedForeground">
          <span>Strategic Tension Engine · MVP</span>
          <span className="uppercase tracking-[0.22em]">
            AI as pressure designer, not protagonist
          </span>
        </div>
      </footer>
    </main>
  );
}
