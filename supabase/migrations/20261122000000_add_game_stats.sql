-- BerryBlue: play counts and trending score for Popular / Trending shelves

alter table public.games
  add column play_count integer not null default 0 check (play_count >= 0),
  add column trending_score integer not null default 0 check (trending_score >= 0);

create index games_play_count_idx on public.games (play_count desc);
create index games_trending_score_idx on public.games (trending_score desc);