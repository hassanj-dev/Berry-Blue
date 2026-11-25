-- Phase 4C: anonymous like / dislike counters.

-- No-op if the columns already exist from the first schema.
alter table public.games add column if not exists like_count integer not null default 0 check (like_count >= 0);
alter table public.games add column if not exists dislike_count integer not null default 0 check (dislike_count >= 0);

-- Moves one visitor's vote from p_from to p_to (1 = like, -1 = dislike, 0 = no vote) in one statement.
-- Counts never go below zero. Returns no row if the game does not exist or is not published.
create function public.change_vote(p_game_id uuid, p_from smallint, p_to smallint)
returns table (likes integer, dislikes integer)
language plpgsql
set search_path = ''
as $$
declare
  v_likes integer;
  v_dislikes integer;
begin
  if p_from not in (-1, 0, 1) or p_to not in (-1, 0, 1) or p_from = p_to then
    return;
  end if;

  update public.games as g
  set like_count = greatest(g.like_count + (p_to = 1)::int - (p_from = 1)::int, 0),
      dislike_count = greatest(g.dislike_count + (p_to = -1)::int - (p_from = -1)::int, 0)
  where g.id = p_game_id and g.is_published
  returning g.like_count, g.dislike_count into v_likes, v_dislikes;

  if not found then
    return;
  end if;

  return query select v_likes, v_dislikes;
end;
$$;

revoke execute on function public.change_vote(uuid, smallint, smallint) from public, anon, authenticated;
grant execute on function public.change_vote(uuid, smallint, smallint) to service_role;

notify pgrst, 'reload schema';