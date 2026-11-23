-- Table privileges (RLS decides which rows each role can see or change).
grant usage on schema public to anon, authenticated;

-- Public catalogue: read only.
grant select on public.categories to anon, authenticated;
grant select on public.games to anon, authenticated;

-- Profiles: everyone can read, signed-in users can write (RLS limits it to their own row).
grant select on public.profiles to anon, authenticated;
grant insert, update on public.profiles to authenticated;

-- Server-side admin (secret key) needs full access later.
grant all on public.categories, public.games, public.profiles to service_role;