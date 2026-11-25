-- Phase 3C-2: category and tag mappings.

-- Provider ki category -> hamari category. provider_category normalized hoti hai (lowercase, ek space).
create table public.category_mappings (
  provider text not null references public.providers (provider) on delete cascade,
  provider_category text not null
    check (provider_category <> '' and provider_category = lower(btrim(provider_category))),
  category_id uuid not null references public.categories (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (provider, provider_category)
);

-- Provider ka tag -> hamara tag. our_tag null ka matlab: yeh tag hata do.
create table public.tag_mappings (
  provider text not null references public.providers (provider) on delete cascade,
  provider_tag text not null check (provider_tag ~ '^[a-z0-9-]+$'),
  our_tag text check (our_tag is null or our_tag ~ '^[a-z0-9-]+$'),
  created_at timestamptz not null default now(),
  primary key (provider, provider_tag)
);

alter table public.category_mappings enable row level security;
alter table public.tag_mappings enable row level security;
revoke all on public.category_mappings, public.tag_mappings from anon, authenticated;
grant all on public.category_mappings, public.tag_mappings to service_role;

-- Naya mapping add hone ke baad: pending games ki khali category bhar do.
create function public.apply_category_mappings(p_provider text)
returns integer
language plpgsql
set search_path = ''
as $$
declare
  n integer;
begin
  update public.staged_games sg
  set category_id = cm.category_id
  from public.category_mappings cm
  where sg.provider = p_provider
    and sg.status = 'pending'
    and sg.category_id is null
    and cm.provider = sg.provider
    and cm.provider_category = lower(btrim(regexp_replace(sg.provider_category, '\s+', ' ', 'g')));

  get diagnostics n = row_count;
  return n;
end;
$$;

revoke execute on function public.apply_category_mappings(text) from public, anon, authenticated;
grant execute on function public.apply_category_mappings(text) to service_role;

-- approve_staged_game: ab tags ko saaf karta aur tag_mappings lagata hai (baqi wohi jo pehle tha).
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
  v_tags text[];
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

  -- Tags: saaf karo (lowercase, a-z0-9 aur dash), mapping lagao. Mapped-to-null tag hat jata hai.
  select coalesce(array_agg(distinct coalesce(tm.our_tag, n.norm)), '{}')
  into v_tags
  from (
    select nullif(btrim(regexp_replace(lower(btrim(t)), '[^a-z0-9]+', '-', 'g'), '-'), '') as norm
    from unnest(s.tags) as t
  ) n
  left join public.tag_mappings tm
    on tm.provider = s.provider and tm.provider_tag = n.norm
  where n.norm is not null
    and (tm.provider_tag is null or tm.our_tag is not null);

  insert into public.games (
    slug, title, description, thumbnail_url, embed_url, category_id,
    tags, devices, provider, provider_game_id, content_hash, is_published
  )
  values (
    v_slug, s.title, s.description, s.thumbnail_url, s.embed_url, p_category_id,
    v_tags, s.devices, s.provider, s.provider_game_id, s.content_hash, true
  )
  on conflict (provider, provider_game_id) do update set
    slug = excluded.slug,
    title = excluded.title,
    description = excluded.description,
    thumbnail_url = excluded.thumbnail_url,
    embed_url = excluded.embed_url,
    category_id = excluded.category_id,
    tags = excluded.tags,
    devices = excluded.devices,
    content_hash = excluded.content_hash,
    is_published = true
  returning id into v_game_id;

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
    jsonb_build_object('staged_id', p_staged_id, 'slug', v_slug, 'provider', s.provider, 'tags', v_tags)
  );

  return v_game_id;
end;
$$;

revoke execute on function public.approve_staged_game(uuid, uuid, uuid, text) from public, anon, authenticated;
grant execute on function public.approve_staged_game(uuid, uuid, uuid, text) to service_role;