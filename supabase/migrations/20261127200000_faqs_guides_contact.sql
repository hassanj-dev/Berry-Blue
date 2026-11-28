create table if not exists public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  sort_order int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);
create table if not exists public.guides (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  summary text not null default '',
  steps jsonb not null default '[]',
  sort_order int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 100),
  email text not null check (char_length(email) between 3 and 200),
  message text not null check (char_length(message) between 5 and 4000),
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.faqs enable row level security;
alter table public.guides enable row level security;
alter table public.contact_messages enable row level security;

drop policy if exists faqs_read on public.faqs;
create policy faqs_read on public.faqs for select to anon, authenticated using (is_published);
drop policy if exists guides_read on public.guides;
create policy guides_read on public.guides for select to anon, authenticated using (is_published);
drop policy if exists contact_insert on public.contact_messages;
create policy contact_insert on public.contact_messages for insert to anon, authenticated with check (is_read = false);

grant usage on schema public to anon, authenticated, service_role;
grant all on table public.faqs, public.guides, public.contact_messages to service_role;
grant select on table public.faqs, public.guides to anon, authenticated;
grant insert on table public.contact_messages to anon, authenticated;

insert into public.faqs (question, answer, sort_order) values
 ('Are the games really free?', 'Yes. Every game on the site is free to play. No account and no download needed.', 1),
 ('Do I need to install anything?', 'No. Games run in your browser on phone, tablet or computer.', 2),
 ('A game does not load. What should I do?', 'Refresh the page first. If it still fails, use the Contact page and tell us the game name, your device and browser.', 3),
 ('Are my favorites saved?', 'Favorites are saved on your device, so they stay as long as you use the same browser.', 4);
insert into public.guides (title, slug, summary, steps, sort_order) values
 ('How to start playing', 'how-to-start-playing', 'From the home page to your first game in four steps.',
  '[{"title":"Pick a game","body":"Browse All games, Trending or a category."},{"title":"Press Play","body":"The game opens on its own page."},{"title":"Go full screen","body":"Use the full screen button for a bigger view."},{"title":"Save it","body":"Tap the heart to add it to Favorites."}]', 1)
on conflict (slug) do nothing;
