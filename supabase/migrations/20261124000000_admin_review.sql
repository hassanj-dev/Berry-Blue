-- Phase 3B: audit log aur admin review functions (approve / reject).

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references auth.users (id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index audit_logs_created_idx on public.audit_logs (created_at desc);

alter table public.audit_logs enable row level security;
revoke all on public.audit_logs from anon, authenticated;
grant all on public.audit_logs to service_role;

-- Approve = game live (insert ya update), staged row "approved", audit log: sab ek transaction mein.
create function public.approve_staged_game(
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

  -- Takraav: yeh slug kisi AUR game ka hai (wohi provider + wohi id ho to woh update hai, takraav nahi).
  if exists (
    select 1 from public.games g
    where g.slug = v_slug
      and not (g.provider = s.provider and g.provider_game_id = s.provider_game_id)
  ) then
    raise exception 'slug "%" is already used by another game', v_slug;
  end if;

  insert into public.games (
    slug, title, description, thumbnail_url, embed_url, category_id,
    tags, devices, provider, provider_game_id, content_hash, is_published
  )
  values (
    v_slug, s.title, s.description, s.thumbnail_url, s.embed_url, p_category_id,
    s.tags, s.devices, s.provider, s.provider_game_id, s.content_hash, true
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
    jsonb_build_object('staged_id', p_staged_id, 'slug', v_slug, 'provider', s.provider)
  );

  return v_game_id;
end;
$$;

create function public.reject_staged_game(
  p_staged_id uuid,
  p_admin_id uuid,
  p_reason text default null
)
returns void
language plpgsql
set search_path = ''
as $$
begin
  update public.staged_games
  set status = 'rejected', reviewed_by = p_admin_id, reviewed_at = now()
  where id = p_staged_id and status = 'pending';

  if not found then
    raise exception 'only pending games can be rejected';
  end if;

  insert into public.audit_logs (admin_id, action, entity_type, entity_id, details)
  values (
    p_admin_id, 'game.reject', 'staged_game', p_staged_id,
    jsonb_build_object('reason', p_reason)
  );
end;
$$;

-- Sirf server (secret key) in functions ko chala sakta hai. Supabase naye functions anon/authenticated ko
-- bhi de deta hai, is liye teeno se explicitly wapas liya.
revoke execute on function public.approve_staged_game(uuid, uuid, uuid, text) from public, anon, authenticated;
revoke execute on function public.reject_staged_game(uuid, uuid, text) from public, anon, authenticated;
grant execute on function public.approve_staged_game(uuid, uuid, uuid, text) to service_role;
grant execute on function public.reject_staged_game(uuid, uuid, text) to service_role;