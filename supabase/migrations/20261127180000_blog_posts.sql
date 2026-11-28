-- Blog: posts written in the admin, shown on /blog.
create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 80),
  excerpt text not null default '' check (char_length(excerpt) <= 300),
  content text not null default '',
  cover_url text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists blog_posts_published_idx
  on public.blog_posts (published_at desc) where status = 'published';

-- Visitors can only read published posts. The admin uses the secret key, which bypasses this.
alter table public.blog_posts enable row level security;

drop policy if exists "Published posts are public" on public.blog_posts;
create policy "Published posts are public" on public.blog_posts
  for select to anon, authenticated
  using (status = 'published' and published_at is not null and published_at <= now());

grant select on public.blog_posts to anon, authenticated;

-- Public bucket for cover images.
insert into storage.buckets (id, name, public)
values ('blog', 'blog', true)
on conflict (id) do nothing;

notify pgrst, 'reload schema';
