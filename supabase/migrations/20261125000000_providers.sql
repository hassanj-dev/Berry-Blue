-- Phase 3C-1: providers register, publish guard, disconnect / reconnect.

create table public.providers (
  provider text primary key check (provider ~ '^[a-z0-9-]+$'),
  display_name text not null,
  status text not null default 'active' check (status in ('active', 'disconnected')),
  license_status text not null default 'unverified'
    check (license_status in ('unverified', 'pending', 'approved', 'expired')),
  terms_url text,
  verified_at timestamptz,
  notes text,
  disconnected_at timestamptz,
  disconnect_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger providers_set_updated_at
  before update on public.providers
  for each row execute function public.set_updated_at();

alter table public.providers enable row level security;
revoke all on public.providers from anon, authenticated;
grant all on public.providers to service_role;

-- Hamare apne test games (provider = 'self-hosted').
insert into public.providers (provider, display_name, license_status, verified_at)
values ('self-hosted', 'Self-hosted', 'approved', now());

-- Guard: published game ka provider registered aur active hona zaroori hai.
create function public.games_require_active_provider()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.is_published and not exists (
    select 1 from public.providers p
    where p.provider = new.provider and p.status = 'active'
  ) then
    raise exception 'provider "%" is not registered or not active', new.provider;
  end if;
  return new;
end;
$$;

create trigger games_require_active_provider
  before insert or update of is_published on public.games
  for each row execute function public.games_require_active_provider();

-- Disconnect: provider band + uske saare games unpublish + audit log, ek transaction mein.
create function public.disconnect_provider(
  p_provider text,
  p_admin_id uuid,
  p_reason text default null
)
returns integer
language plpgsql
set search_path = ''
as $$
declare
  v_unpublished integer;
begin
  update public.providers
  set status = 'disconnected', disconnected_at = now(), disconnect_reason = p_reason
  where provider = p_provider and status = 'active';

  if not found then
    raise exception 'provider is not active or does not exist';
  end if;

  update public.games set is_published = false
  where provider = p_provider and is_published;
  get diagnostics v_unpublished = row_count;

  insert into public.audit_logs (admin_id, action, entity_type, entity_id, details)
  values (
    p_admin_id, 'provider.disconnect', 'provider', null,
    jsonb_build_object('provider', p_provider, 'reason', p_reason, 'unpublished_games', v_unpublished)
  );

  return v_unpublished;
end;
$$;

-- Reconnect: sirf provider wapas active. Games khud republish nahi hote.
create function public.reconnect_provider(p_provider text, p_admin_id uuid)
returns void
language plpgsql
set search_path = ''
as $$
begin
  update public.providers
  set status = 'active', disconnected_at = null, disconnect_reason = null
  where provider = p_provider and status = 'disconnected';

  if not found then
    raise exception 'provider is not disconnected or does not exist';
  end if;

  insert into public.audit_logs (admin_id, action, entity_type, entity_id, details)
  values (p_admin_id, 'provider.reconnect', 'provider', null, jsonb_build_object('provider', p_provider));
end;
$$;

revoke execute on function public.disconnect_provider(text, uuid, text) from public, anon, authenticated;
revoke execute on function public.reconnect_provider(text, uuid) from public, anon, authenticated;
grant execute on function public.disconnect_provider(text, uuid, text) to service_role;
grant execute on function public.reconnect_provider(text, uuid) to service_role;