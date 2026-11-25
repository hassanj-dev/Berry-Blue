-- Phase 3C-2: category_mappings.provider_category must also have single spaces only.
alter table public.category_mappings
  add constraint category_mappings_normalized_check
  check (provider_category = regexp_replace(lower(btrim(provider_category)), '\s+', ' ', 'g'));