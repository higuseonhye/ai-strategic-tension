-- Persistent world layer (Supabase). Service role from Next.js API writes; optional public read later.
-- Seed world id must match lib/world-persist.ts GLOBAL_WORLD_ID default.

create extension if not exists "pgcrypto";

create table if not exists public.worlds (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  created_at timestamptz not null default now()
);

insert into public.worlds (id, slug, name)
values ('00000000-0000-0000-0000-000000000001', 'global', 'Strategic Earth')
on conflict (id) do nothing;

create table if not exists public.world_metrics (
  world_id uuid primary key references public.worlds (id) on delete cascade,
  stability int not null default 52,
  climate int not null default 48,
  orbital int not null default 44,
  knowledge_commons int not null default 46,
  compute_access int not null default 41,
  public_trust int not null default 47,
  diplomatic_cohesion int not null default 49,
  session_count bigint not null default 1841,
  updated_at timestamptz not null default now()
);

insert into public.world_metrics (world_id)
values ('00000000-0000-0000-0000-000000000001')
on conflict (world_id) do nothing;

create table if not exists public.world_events (
  id uuid primary key default gen_random_uuid(),
  world_id uuid not null references public.worlds (id) on delete cascade,
  created_at timestamptz not null default now(),
  session_code text not null,
  scenario_id text not null,
  interaction_mode text not null default 'crisis',
  final_choice text,
  tension_terminal int,
  session_index bigint not null,
  headline text not null,
  narrative text not null,
  metric_deltas jsonb not null default '{}'::jsonb
);

create index if not exists world_events_world_created_idx
  on public.world_events (world_id, created_at desc);
