import "server-only";
import type { StagedGame, StagedStatus } from "@/lib/moderation";
import { createSecretClient } from "@/lib/supabase/secret";

const COLUMNS =
  "id, provider, provider_game_id, slug, title, description, thumbnail_url, embed_url, provider_category, category_id, tags, devices, status, validation_errors, reviewed_at, created_at";

// Like listStaged(), but returns more rows (the Moderation tabs are split and paged in code).
export async function listAllStaged(status: StagedStatus): Promise<StagedGame[]> {
  const { data, error } = await createSecretClient()
    .from("staged_games")
    .select(COLUMNS)
    .eq("status", status)
    .order("created_at", { ascending: false })
    .order("id")
    .limit(1000);

  if (error) throw new Error(`listAllStaged failed: ${error.message}`);
  return (data ?? []) as StagedGame[];
}
