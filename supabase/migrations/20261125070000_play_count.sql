-- Phase 4B: count one play of a published game.
create function public.increment_play_count(p_game_id uuid)
returns integer
language plpgsql
set search_path = ''
as $$
declare
  v_count integer;
begin
  update public.games
  set play_count = play_count + 1
  where id = p_game_id and is_published
  returning play_count into v_count;

  return v_count;  -- null if the game does not exist or is not published
end;
$$;

revoke execute on function public.increment_play_count(uuid) from public, anon, authenticated;
grant execute on function public.increment_play_count(uuid) to service_role;

notify pgrst, 'reload schema';