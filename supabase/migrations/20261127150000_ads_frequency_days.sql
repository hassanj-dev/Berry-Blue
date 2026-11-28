-- "Every few days" frequency: a visitor sees the ad again only after repeat_days days.
do $$
declare c text;
begin
  for c in
    select conname from pg_constraint
    where conrelid = 'public.ads'::regclass and contype = 'c'
      and pg_get_constraintdef(oid) like '%frequency%'
  loop
    execute format('alter table public.ads drop constraint %I', c);
  end loop;
end $$;

alter table public.ads
  add constraint ads_frequency_check check (frequency in ('visit', 'daily', 'once', 'days'));

alter table public.ads
  add column if not exists repeat_days integer not null default 3
  check (repeat_days between 1 and 365);

notify pgrst, 'reload schema';
