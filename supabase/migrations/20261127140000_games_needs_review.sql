-- A game approved from Moderation waits here (hidden) until it is edited and published.
alter table public.games
  add column if not exists needs_review boolean not null default false;

notify pgrst, 'reload schema';
