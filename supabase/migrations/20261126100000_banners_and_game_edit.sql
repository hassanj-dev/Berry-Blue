-- Admin editing: homepage banners, game SEO fields, safe manual edits of games.

-- 1) Games: SEO title tag + meta description, and a flag that protects manual edits
--    from being overwritten when a provider game is approved again.
alter table public.games
  add column meta_title text check (meta_title is null or char_length(meta_title) <= 70),
  add column meta_description text check (meta_description is null or char_length(meta_description) <= 160),
  add column is_customized boolean not null default false;

-- 2) Homepage banners (the slider on the home page).
create table public.home_banners (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 100),
  tag text check (tag is null or char_length(tag) <= 30),
  description text check (description is null or char_length(description) <= 200),
  image_url text not null,
  link_url text not null,
  sort_order integer not null default 0 check (sort_order >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index home_banners_order_idx on public.home_banners (sort_order, created_at);

create trigger home_banners_set_updated_at
  before update on public.home_banners
  for each row execute function public.set_updated_at();

alter table public.home_banners enable row level security;

-- Visitors only ever see active banners. Only the secret key can write.
create policy "Public can read active banners"
  on public.home_banners for select
  to anon, authenticated
  using (is_active);

grant select on public.home_banners to anon, authenticated;
grant all on public.home_banners to service_role;

-- 3) Storage bucket for banner images (public read, written by the admin server only).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('banners', 'banners', true, 2097152, array['image/webp'])
on conflict (id) do nothing;

-- 4) (update_game_details lives in the next migration, with category and tags.)

-- 5) Approving a provider game again must not undo manual edits.
--    Same function as before; only the ON CONFLICT part respects is_customized.
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
    embed_url = excluded.embed_url,
    category_id = excluded.category_id,
    tags = excluded.tags,
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
