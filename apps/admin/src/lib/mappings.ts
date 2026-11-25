import "server-only";
import { createSecretClient } from "@/lib/supabase/secret";

export type ProviderOption = { provider: string; display_name: string };
export type CategoryMapping = {
  provider_category: string;
  category_id: string;
  categories: { name: string } | null;
};
export type TagMapping = { provider_tag: string; our_tag: string | null };
export type Unmapped = { name: string; gameCount: number };

export async function listProviderOptions(): Promise<ProviderOption[]> {
  const { data, error } = await createSecretClient()
    .from("providers")
    .select("provider, display_name")
    .order("provider");

  if (error) throw new Error(`listProviderOptions failed: ${error.message}`);
  return (data ?? []) as ProviderOption[];
}

export async function listCategoryMappings(provider: string): Promise<CategoryMapping[]> {
  const { data, error } = await createSecretClient()
    .from("category_mappings")
    .select("provider_category, category_id, categories(name)")
    .eq("provider", provider)
    .order("provider_category");

  if (error) throw new Error(`listCategoryMappings failed: ${error.message}`);
  return (data ?? []) as unknown as CategoryMapping[];
}

export async function listUnmappedCategories(provider: string): Promise<Unmapped[]> {
  const { data, error } = await createSecretClient().rpc("unmapped_provider_categories", {
    p_provider: provider,
  });

  if (error) throw new Error(`listUnmappedCategories failed: ${error.message}`);
  return ((data ?? []) as { category_name: string; game_count: number }[]).map((row) => ({
    name: row.category_name,
    gameCount: Number(row.game_count),
  }));
}

export async function listTagMappings(provider: string): Promise<TagMapping[]> {
  const { data, error } = await createSecretClient()
    .from("tag_mappings")
    .select("provider_tag, our_tag")
    .eq("provider", provider)
    .order("provider_tag");

  if (error) throw new Error(`listTagMappings failed: ${error.message}`);
  return (data ?? []) as TagMapping[];
}

export async function listUnmappedTags(provider: string): Promise<Unmapped[]> {
  const { data, error } = await createSecretClient().rpc("unmapped_provider_tags", {
    p_provider: provider,
  });

  if (error) throw new Error(`listUnmappedTags failed: ${error.message}`);
  return ((data ?? []) as { tag_name: string; game_count: number }[]).map((row) => ({
    name: row.tag_name,
    gameCount: Number(row.game_count),
  }));
}
