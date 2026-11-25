-- Phase 3D-1: processed thumbnails (WebP + AVIF) in Supabase Storage.

-- Public bucket: anyone can read, only the secret key can write.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('thumbnails', 'thumbnails', true, 1048576, array['image/webp', 'image/avif'])
on conflict (id) do nothing;

create table public.game_thumbnails (
  game_id uuid primary key references public.games (id) on delete cascade,
  source_url text not null,
  webp_url text,
  avif_url text,
  last_error text,
  last_attempt_at timestamptz not null default now(),
  failure_count integer not null default 0 check (failure_count >= 0)
);

alter table public.game_thumbnails enable row level security;
revoke all on public.game_thumbnails from anon, authenticated;
grant all on public.game_thumbnails to service_role;

-- One result in, in a single transaction. On success the game's thumbnail_url becomes the WebP url,
-- but only if it still equals the source url (so a newer approval is never overwritten).
-- Returns true if games.thumbnail_url was changed.
create function public.record_thumbnail(
  p_game_id uuid,
  p_source_url text,
  p_webp_url text,
  p_avif_url text,
  p_error text
)
returns boolean
language plpgsql
set search_path = ''
as $$
declare
  v_changed boolean := false;
begin
  if p_error is null then
    insert into public.game_thumbnails as t
      (game_id, source_url, webp_url, avif_url, last_error, last_attempt_at, failure_count)
    values (p_game_id, p_source_url, p_webp_url, p_avif_url, null, now(), 0)
    on conflict (game_id) do update set
      source_url = excluded.source_url,
      webp_url = excluded.webp_url,
      avif_url = excluded.avif_url,
      last_error = null,
      last_attempt_at = now(),
      failure_count = 0;

    update public.games set thumbnail_url = p_webp_url
    where id = p_game_id and thumbnail_url = p_source_url;
    v_changed := found;
  else
    insert into public.game_thumbnails as t
      (game_id, source_url, webp_url, avif_url, last_error, last_attempt_at, failure_count)
    values (p_game_id, p_source_url, null, null, left(p_error, 500), now(), 1)
    on conflict (game_id) do update set
      failure_count = case when t.source_url = excluded.source_url then t.failure_count + 1 else 1 end,
      webp_url = case when t.source_url = excluded.source_url then t.webp_url else null end,
      avif_url = case when t.source_url = excluded.source_url then t.avif_url else null end,
      source_url = excluded.source_url,
      last_error = excluded.last_error,
      last_attempt_at = now();
  end if;

  return v_changed;
end;
$$;

revoke execute on function public.record_thumbnail(uuid, text, text, text, text) from public, anon, authenticated;
grant execute on function public.record_thumbnail(uuid, text, text, text, text) to service_role;

notify pgrst, 'reload schema';