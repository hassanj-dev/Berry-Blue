alter table public.game_reports
  add column details text
  check (details is null or char_length(details) <= 500);

notify pgrst, 'reload schema';
