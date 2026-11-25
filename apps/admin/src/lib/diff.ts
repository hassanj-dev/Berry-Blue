import "server-only";
import { normalizeTag } from "@/lib/normalize";
import { createSecretClient } from "@/lib/supabase/secret";

export type LiveGame = {
  id: string;
  slug: string;
  title: string;
  description: string;
  thumbnail_url: string;
  embed_url: string;
  tags: string[];
  devices: string[];
  is_published: boolean;
  categories: { name: string } | null;
};

export type MissingGame = { id: string; slug: string; title: string };
export type ProviderInfo = { provider: string; display_name: string };

// The live game that a staged game would update (same provider and provider game id), if any.
export async function getLiveGame(
  provider: string,
  providerGameId: string,
): Promise<LiveGame | null> {
  const { data, error } = await createSecretClient()
    .from("games")
    .select(
      "id, slug, title, description, thumbnail_url, embed_url, tags, devices, is_published, categories(name)",
    )
    .eq("provider", provider)
    .eq("provider_game_id", providerGameId)
    .maybeSingle();

  if (error) throw new Error(`getLiveGame failed: ${error.message}`);
  return (data as unknown as LiveGame | null) ?? null;
}

// Which staged rows already have a live game. Keys look like "provider:provider_game_id".
export async function liveGameKeys(
  rows: { provider: string; provider_game_id: string }[],
): Promise<Set<string>> {
  if (rows.length === 0) return new Set();

  const ids = [...new Set(rows.map((r) => r.provider_game_id))];
  const { data, error } = await createSecretClient()
    .from("games")
    .select("provider, provider_game_id")
    .in("provider_game_id", ids);

  if (error) throw new Error(`liveGameKeys failed: ${error.message}`);
  const found = (data ?? []) as { provider: string; provider_game_id: string }[];
  return new Set(found.map((r) => `${r.provider}:${r.provider_game_id}`));
}

// The tags a game would get on approval: cleaned, then renamed or removed by tag_mappings.
// Same rules as the approve_staged_game SQL function.
export async function previewTags(provider: string, tags: string[]): Promise<string[]> {
  const { data, error } = await createSecretClient()
    .from("tag_mappings")
    .select("provider_tag, our_tag")
    .eq("provider", provider);

  if (error) throw new Error(`previewTags failed: ${error.message}`);

  const mappings = new Map<string, string | null>(
    ((data ?? []) as { provider_tag: string; our_tag: string | null }[]).map((m) => [
      m.provider_tag,
      m.our_tag,
    ]),
  );

  const result = new Set<string>();
  for (const tag of tags) {
    const clean = normalizeTag(tag);
    if (!clean) continue;
    const mapped = mappings.has(clean) ? mappings.get(clean) : clean;
    if (mapped) result.add(mapped);
  }
  return [...result].sort();
}

export async function listProviders(): Promise<ProviderInfo[]> {
  const { data, error } = await createSecretClient()
    .from("providers")
    .select("provider, display_name")
    .order("provider");

  if (error) throw new Error(`listProviders failed: ${error.message}`);
  return (data ?? []) as ProviderInfo[];
}

export async function listMissingFromFeed(provider: string): Promise<MissingGame[]> {
  const { data, error } = await createSecretClient().rpc("games_missing_from_feed", {
    p_provider: provider,
  });

  if (error) throw new Error(`listMissingFromFeed failed: ${error.message}`);
  return ((data ?? []) as { out_id: string; out_slug: string; out_title: string }[]).map((r) => ({
    id: r.out_id,
    slug: r.out_slug,
    title: r.out_title,
  }));
}

export async function lastCompletedImport(provider: string): Promise<string | null> {
  const { data, error } = await createSecretClient()
    .from("import_batches")
    .select("started_at")
    .eq("provider", provider)
    .eq("status", "completed")
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(`lastCompletedImport failed: ${error.message}`);
  return (data as { started_at: string } | null)?.started_at ?? null;
}
