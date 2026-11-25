-- Phase 3C-2: lists of provider categories and tags that have no mapping yet.

create function public.unmapped_provider_categories(p_provider text)
returns table (category_name text, game_count bigint)
language sql
stable
set search_path = ''
as $$
  select n.c, count(*)
  from (
    select lower(btrim(regexp_replace(sg.provider_category, '\s+', ' ', 'g'))) as c
    from public.staged_games sg
    where sg.provider = p_provider and sg.provider_category is not null
  ) n
  where n.c <> ''
    and not exists (
      select 1 from public.category_mappings cm
      where cm.provider = p_provider and cm.provider_category = n.c
    )
  group by n.c
  order by n.c;
$$;

create function public.unmapped_provider_tags(p_provider text)
returns table (tag_name text, game_count bigint)
language sql
stable
set search_path = ''
as $$
  select n.norm, count(*)
  from (
    select nullif(btrim(regexp_replace(lower(btrim(t)), '[^a-z0-9]+', '-', 'g'), '-'), '') as norm
    from public.staged_games sg, unnest(sg.tags) as t
    where sg.provider = p_provider
  ) n
  where n.norm is not null
    and not exists (
      select 1 from public.tag_mappings tm
      where tm.provider = p_provider and tm.provider_tag = n.norm
    )
  group by n.norm
  order by n.norm;
$$;

revoke execute on function public.unmapped_provider_categories(text) from public, anon, authenticated;
revoke execute on function public.unmapped_provider_tags(text) from public, anon, authenticated;
grant execute on function public.unmapped_provider_categories(text) to service_role;
grant execute on function public.unmapped_provider_tags(text) to service_role;

notify pgrst, 'reload schema';