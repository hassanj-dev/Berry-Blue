-- Phase 3C-4: remember which provider game ids were in each feed, and list live games that disappeared.

create table public.provider_feed_seen (
  provider text not null references public.providers (provider) on delete cascade,
  provider_game_id text not null,
  last_seen_at timestamptz not null default now(),
  primary key (provider, provider_game_id)
);

alter table public.provider_feed_seen enable row level security;
revoke all on public.provider_feed_seen from anon, authenticated;
grant all on public.provider_feed_seen to service_role;

create function public.mark_feed_seen(p_provider text, p_ids text[])
returns integer
language plpgsql
set search_path = ''
as $$
declare
  n integer;
begin
  insert into public.provider_feed_seen (provider, provider_game_id, last_seen_at)
  select distinct p_provider, x, now() from unnest(p_ids) as x
  on conflict (provider, provider_game_id) do update set last_seen_at = excluded.last_seen_at;

  get diagnostics n = row_count;
  return n;
end;
$$;

-- Published games of a provider that were not in the feed of its latest completed import.
create function public.games_missing_from_feed(p_provider text)
returns table (out_id uuid, out_slug text, out_title text)
language sql
stable
set search_path = ''
as $$
  with last_batch as (
    select max(started_at) as started_at
    from public.import_batches
    where provider = p_provider and status = 'completed'
  )
  select g.id, g.slug, g.title
  from public.games g, last_batch lb
  where g.provider = p_provider
    and g.is_published
    and lb.started_at is not null
    and not exists (
      select 1 from public.provider_feed_seen s
      where s.provider = g.provider
        and s.provider_game_id = g.provider_game_id
        and s.last_seen_at >= lb.started_at
    )
  order by g.title;
$$;

revoke execute on function public.mark_feed_seen(text, text[]) from public, anon, authenticated;
revoke execute on function public.games_missing_from_feed(text) from public, anon, authenticated;
grant execute on function public.mark_feed_seen(text, text[]) to service_role;
grant execute on function public.games_missing_from_feed(text) to service_role;

notify pgrst, 'reload schema';