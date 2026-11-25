-- Phase 5A: indexes for search (title substring match, tag match).
create extension if not exists pg_trgm with schema extensions;

create index if not exists games_title_trgm_idx
  on public.games using gin (title extensions.gin_trgm_ops);

create index if not exists games_tags_idx
  on public.games using gin (tags);

notify pgrst, 'reload schema';