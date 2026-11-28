-- Which part of a wide thumbnail the portrait game card shows (0 = left edge, 50 = centre, 100 = right edge).
alter table public.games
  add column thumb_focus_x smallint not null default 50 check (thumb_focus_x between 0 and 100);

notify pgrst, 'reload schema';
