-- Phase 3C-3: embed health checks for published games.

create table public.game_health (
  game_id uuid primary key references public.games (id) on delete cascade,
  last_checked_at timestamptz not null default now(),
  last_ok boolean not null,
  last_http_status integer,
  last_error text,
  consecutive_failures integer not null default 0 check (consecutive_failures >= 0),
  last_ok_at timestamptz
);

alter table public.game_health enable row level security;
revoke all on public.game_health from anon, authenticated;
grant all on public.game_health to service_role;

-- One check result in, one row updated, in a single statement. Returns the failures-in-a-row count.
create function public.record_health_check(
  p_game_id uuid,
  p_ok boolean,
  p_http_status integer,
  p_error text
)
returns integer
language plpgsql
set search_path = ''
as $$
declare
  v_failures integer;
begin
  insert into public.game_health as h
    (game_id, last_checked_at, last_ok, last_http_status, last_error, consecutive_failures, last_ok_at)
  values (
    p_game_id,
    now(),
    p_ok,
    p_http_status,
    case when p_ok then null else left(p_error, 500) end,
    case when p_ok then 0 else 1 end,
    case when p_ok then now() else null end
  )
  on conflict (game_id) do update set
    last_checked_at = now(),
    last_ok = excluded.last_ok,
    last_http_status = excluded.last_http_status,
    last_error = excluded.last_error,
    consecutive_failures = case when excluded.last_ok then 0 else h.consecutive_failures + 1 end,
    last_ok_at = case when excluded.last_ok then now() else h.last_ok_at end
  returning h.consecutive_failures into v_failures;

  return v_failures;
end;
$$;

revoke execute on function public.record_health_check(uuid, boolean, integer, text) from public, anon, authenticated;
grant execute on function public.record_health_check(uuid, boolean, integer, text) to service_role;

notify pgrst, 'reload schema';