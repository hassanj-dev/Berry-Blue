-- Phase 3A: provider import pipeline (staging tables, admin list, games ke naye columns).

alter table public.games
  add column provider_game_id text,
  add column content_hash text,
  add column updated_at timestamptz not null default now();

update public.games set provider_game_id = slug where provider_game_id is null;

alter table public.games alter column provider_game_id set not null;

alter table public.games
  add constraint games_provider_game_unique unique (provider, provider_game_id);

alter table public.games alter column is_published set default false;

create function public.games_default_provider_game_id()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.provider_game_id := coalesce(new.provider_game_id, new.slug);
  return new;
end;
$$;

create trigger games_default_provider_game_id
  before insert on public.games
  for each row execute function public.games_default_provider_game_id();

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger games_set_updated_at
  before update on public.games
  for each row execute function public.set_updated_at();

create table public.import_batches (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  status text not null default 'running'
    check (status in ('running', 'completed', 'failed')),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  total_count integer not null default 0,
  new_count integer not null default 0,
  changed_count integer not null default 0,
  unchanged_count integer not null default 0,
  invalid_count integer not null default 0,
  error text
);

create table public.staged_games (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references public.import_batches (id) on delete cascade,
  provider text not null,
  provider_game_id text not null,
  raw jsonb not null,
  slug text,
  title text,
  description text,
  thumbnail_url text,
  embed_url text,
  provider_category text,
  category_id uuid references public.categories (id),
  tags text[] not null default '{}',
  devices text[] not null default '{}',
  content_hash text not null,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected', 'invalid')),
  validation_errors jsonb,
  reviewed_by uuid references auth.users (id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint staged_games_unique unique (provider, provider_game_id, content_hash)
);

create index staged_games_status_idx on public.staged_games (status);
create index staged_games_batch_idx on public.staged_games (batch_id);

create table public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.import_batches enable row level security;
alter table public.staged_games enable row level security;
alter table public.admin_users enable row level security;

revoke all on public.import_batches, public.staged_games, public.admin_users
  from anon, authenticated;

grant all on public.import_batches, public.staged_games, public.admin_users
  to service_role;