-- Phase 3B: publish / unpublish a live game, with an audit log entry, in one transaction.
create function public.set_game_published(
  p_game_id uuid,
  p_published boolean,
  p_admin_id uuid
)
returns void
language plpgsql
set search_path = ''
as $$
begin
  update public.games
  set is_published = p_published
  where id = p_game_id and is_published is distinct from p_published;

  if not found then
    raise exception 'game not found, or it is already in that state';
  end if;

  insert into public.audit_logs (admin_id, action, entity_type, entity_id, details)
  values (
    p_admin_id,
    case when p_published then 'game.publish' else 'game.unpublish' end,
    'game',
    p_game_id,
    '{}'::jsonb
  );
end;
$$;

revoke execute on function public.set_game_published(uuid, boolean, uuid) from public, anon, authenticated;
grant execute on function public.set_game_published(uuid, boolean, uuid) to service_role;

notify pgrst, 'reload schema';