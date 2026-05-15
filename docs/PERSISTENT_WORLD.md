# Persistent interaction world

This document captures the **v2 product direction** layered on top of the
session-based MVP.

## Thesis (unchanged)

- AI-era tools often optimize for **cognitive outsourcing** (summarize, decide,
  think for me).
- The long-term risk is loss of **cognitive participation**.
- **AI must not replace thinking.** It should shape pressure so humans think
  more intensely, socially, and under irreversible stakes.

## What changed

| Before | After |
|--------|--------|
| Disposable session | **Persistent world** remembers outcomes |
| No explicit reward | **Reputation + contribution + legacy** (no XP/coins) |
| Single interaction shape | **Modes**: solo / hybrid / crisis / duel / influence (+ hidden faction) |
| Desktop-first web | **Mobile-first web** (native apps explicitly out of scope for now) |

## World layer (implemented)

1. **Civilization meters** (0–100): stability, climate, orbital, knowledge commons,
   compute access, public trust, diplomatic cohesion.
2. **Timeline events**: every time a host **commits a final decision**, one line
   is appended (headline + narrative + meter deltas). Session indices start in
   the `1800+` band so copy feels like a living chronicle.
3. **Dual storage**
   - **In-memory** (always): works on a single Node instance with zero config.
   - **Supabase** (optional): `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` mirror
     writes for durability / multi-instance. `GET /api/world` reads from Supabase
     when a metrics row exists, otherwise memory.

SQL:

- `supabase/migrations/20260115120000_world_layer.sql` — metrics + timeline
- `supabase/migrations/20260115123000_player_legacy.sql` — optional per-player
  legacy lines merged into `/api/world` when Supabase is configured

## Rewards (implemented, narrative — not financialized)

- **Strategic reputation**: after a reflection report is generated, lightweight
  tags (e.g. *Ruthless Negotiator*, *Consensus Builder*) accrue per anonymized
  player key. Shown on `/world` for this server instance only unless extended to
  DB later.
- **World contribution**: meter deltas per session; tradeoffs are explicit in
  `lib/world-outcome.ts` per scenario × final letter.

## Interaction modes

| Mode | Room cap | Start rule | Notes |
|------|-----------|--------------|-------|
| `solo` | 1 | 1 human (host only) | **ASTP primary entry**: synthetic seats fill other scenario roles; multi-agent replies |
| `crisis` | 6 | ≥2 players | Current flagship |
| `duel` | 2 | 2 humans **or** 1 human + AI adversary (lobby opt-in) | Bilateral pressure; duel UI is two-column dossiers + shared channel |
| `influence` | 6 | ≥2 | Same engine; **primary** player gets lectern + extra start framing |
| `hybrid` | 6 | ≥2 humans | Unused scenario seats become synthetic agents on start; inter-agent banter; `socialGraph` |
| `hidden_faction` | — | disabled | Reserved — requires abuse & trust design |

## API

- `GET /api/world?limit=50` — metrics, timeline, legacy, `supabase` flag.

## Mobile-first

- Root layout: `100dvh`, safe-area padding, `touch-manipulation`.
- `/world`: bottom action bar pattern for small screens.

## Recently shipped (this codebase)

- **Player legacy** — reflection-derived lines can mirror to `player_legacy` in
  Supabase (same service-role pattern as the world layer). Adversary-named rows
  are skipped for privacy in the bump helper.
- **Duel vs AI** — seated `isAi` adversary, throttled reply queue, client cannot
  post as AI; mock reflection includes an adversary row.
- **Solo multi-agent field** — one human host; on start the engine fills every
  other scenario role with `isAi` seats, seeds cross-agent lines, and throttles
  multi-agent replies after human posts (`lib/solo-reply.ts`, `lib/solo-copy.ts`).
- **Hybrid field** — 2–6 humans; remaining scenario seats become synthetic agents;
  `lib/inter-agent-reply.ts` can fire AI↔AI lines on GM events (and rarely after
  human posts); `lib/social-graph.ts` maintains heuristic trust/influence edges
  surfaced in-room via `SocialGraphPanel`.

## Roadmap (not yet built)

- **Hidden AI faction** with audit logs and opt-in rooms only.
- **Seasons** and forked worldlines (A/B universes).
- Richer **privacy controls** for legacy export and cross-instance identity.
