-- Phase 4E: visitor reports about a game.
create table public.game_reports (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games (id) on delete cascade,
  reason text not null check (reason in ('not_loading', 'broken_controls', 'inappropriate', 'other')),
  created_at timestamptz not null default now()
);

create index game_reports_game_id_idx on public.game_reports (game_id);

-- RLS on with no policies: anon and authenticated cannot read or write.
alter table public.game_reports enable row level security;

revoke all on table public.game_reports from public, anon, authenticated, service_role;
grant select, insert on table public.game_reports to service_role;

notify pgrst, 'reload schema';