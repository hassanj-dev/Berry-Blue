-- Ad rotation: "shuffle" ads share the screen time randomly (weighted by "weight"),
-- "priority" ads are shown before shuffled ones.
alter table public.ads
  add column if not exists rotation text not null default 'shuffle'
  check (rotation in ('shuffle', 'priority'));

alter table public.ads
  add column if not exists weight integer not null default 1
  check (weight between 1 and 10);

notify pgrst, 'reload schema';
