-- Player legacy (reputation tags) — optional mirror of in-memory world layer.

create table if not exists public.player_legacy (
  world_id uuid not null references public.worlds (id) on delete cascade,
  player_key text not null,
  display_hint text not null,
  tags text[] not null default '{}',
  sessions_played int not null default 0,
  last_contribution jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (world_id, player_key)
);

create index if not exists player_legacy_updated_idx
  on public.player_legacy (world_id, updated_at desc);
