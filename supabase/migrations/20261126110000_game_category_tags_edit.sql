-- Edit a game's category and tags too. Replaces update_game_details from the previous migration
-- (safe whether or not that one was applied already).

drop function if exists public.update_game_details(uuid, text, text, text, text, text, uuid);

create function public.update_game_details(
  p_game_id uuid,
  p_title text,
  p_description text,
  p_meta_title text,
  p_meta_description text,
  p_thumbnail_url text,   -- null = keep the current thumbnail
  p_category_id uuid,
  p_tags text[],
  p_admin_id uuid
)
returns void
language plpgsql
set search_path = ''
as $$
begin
  if not exists (select 1 from public.categories where id = p_category_id) then
    raise exception 'category not found';
  end if;

  update public.games
  set
    -- All right-hand sides read the OLD row, so this compares before/after correctly.
    is_customized = is_customized
      or title is distinct from p_title
      or description is distinct from p_description
      or tags is distinct from p_tags
      or (p_thumbnail_url is not null and thumbnail_url is distinct from p_thumbnail_url),
    title = p_title,
    description = p_description,
    meta_title = nullif(btrim(p_meta_title), ''),
    meta_description = nullif(btrim(p_meta_description), ''),
    thumbnail_url = coalesce(p_thumbnail_url, thumbnail_url),
    category_id = p_category_id,
    tags = p_tags
  where id = p_game_id;

  if not found then
    raise exception 'game not found';
  end if;

  insert into public.audit_logs (admin_id, action, entity_type, entity_id, details)
  values (
    p_admin_id, 'game.edit', 'game', p_game_id,
    jsonb_build_object('title', p_title, 'thumbnail_changed', p_thumbnail_url is not null)
  );
end;
$$;

revoke execute on function public.update_game_details(uuid, text, text, text, text, text, uuid, text[], uuid) from public, anon, authenticated;
grant execute on function public.update_game_details(uuid, text, text, text, text, text, uuid, text[], uuid) to service_role;

-- Re-approving a provider game keeps manually edited tags too (category is chosen again at approval).
create or replace function public.approve_staged_game(
  p_staged_id uuid,
  p_category_id uuid,
  p_admin_id uuid,
  p_slug text default null
)
returns uuid
language plpgsql
set search_path = ''
as $$
declare
  s public.staged_games%rowtype;
  v_slug text;
  v_game_id uuid;
begin
  select * into s from public.staged_games where id = p_staged_id for update;

  if not found then
    raise exception 'staged game not found';
  end if;
  if s.status <> 'pending' then
    raise exception 'only pending games can be approved (current status: %)', s.status;
  end if;
  if not exists (select 1 from public.categories where id = p_category_id) then
    raise exception 'category not found';
  end if;

  v_slug := coalesce(nullif(btrim(p_slug), ''), s.slug);
  if v_slug is null or v_slug !~ '^[a-z0-9-]+$' then
    raise exception 'invalid slug';
  end if;

  if exists (
    select 1 from public.games g
    where g.slug = v_slug
      and not (g.provider = s.provider and g.provider_game_id = s.provider_game_id)
  ) then
    raise exception 'slug "%" is already used by another game', v_slug;
  end if;

  insert into public.games as g (
    slug, title, description, thumbnail_url, embed_url, category_id,
    tags, devices, provider, provider_game_id, content_hash, is_published
  )
  values (
    v_slug, s.title, s.description, s.thumbnail_url, s.embed_url, p_category_id,
    s.tags, s.devices, s.provider, s.provider_game_id, s.content_hash, true
  )
  on conflict (provider, provider_game_id) do update set
    slug = excluded.slug,
    title = case when g.is_customized then g.title else excluded.title end,
    description = case when g.is_customized then g.description else excluded.description end,
    thumbnail_url = case when g.is_customized then g.thumbnail_url else excluded.thumbnail_url end,
    tags = case when g.is_customized then g.tags else excluded.tags end,
    embed_url = excluded.embed_url,
    category_id = excluded.category_id,
    devices = excluded.devices,
    content_hash = excluded.content_hash,
    is_published = true
  returning g.id into v_game_id;

  update public.staged_games
  set status = 'approved',
      slug = v_slug,
      category_id = p_category_id,
      reviewed_by = p_admin_id,
      reviewed_at = now()
  where id = p_staged_id;

  insert into public.audit_logs (admin_id, action, entity_type, entity_id, details)
  values (
    p_admin_id, 'game.approve', 'game', v_game_id,
    jsonb_build_object('staged_id', p_staged_id, 'slug', v_slug, 'provider', s.provider)
  );

  return v_game_id;
end;
$$;

notify pgrst, 'reload schema';
