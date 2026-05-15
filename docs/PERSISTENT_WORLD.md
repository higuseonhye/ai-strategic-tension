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
| Single interaction shape | **Modes**: crisis / duel / influence (+ hidden faction later) |
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

SQL: `supabase/migrations/20260115120000_world_layer.sql`

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
| `crisis` | 6 | ≥2 players | Current flagship |
| `duel` | 2 | **Exactly** 2 | Bilateral pressure |
| `influence` | 6 | ≥2 | Same engine; framing for 1:N persuasion rooms |
| `hidden_faction` | — | disabled | Reserved — requires abuse & trust design |

## API

- `GET /api/world?limit=50` — metrics, timeline, legacy, `supabase` flag.

## Mobile-first

- Root layout: `100dvh`, safe-area padding, `touch-manipulation`.
- `/world`: bottom action bar pattern for small screens.

## Roadmap (not yet built)

- Persist **player legacy** to Supabase with privacy controls.
- **Mode 2 / 3** bespoke AI seating (AI as seated adversary / board) without
  hijacking the human channel.
- **Hidden AI faction** with audit logs and opt-in rooms only.
- **Seasons** and forked worldlines (A/B universes).
