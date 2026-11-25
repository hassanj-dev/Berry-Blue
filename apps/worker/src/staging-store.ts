import type { ImportStats, StagingStore } from "@berryblue/provider-core";
import type { SupabaseClient } from "@supabase/supabase-js";

const PAGE_SIZE = 1000; // Supabase ek baar mein itni hi rows deta hai
const INSERT_CHUNK = 200;

// core ka StagingStore interface, asli Supabase database ke saath.
export function createSupabaseStagingStore(supabase: SupabaseClient): StagingStore {
  return {
    async startBatch(provider) {
      const { data, error } = await supabase
        .from("import_batches")
        .insert({ provider })
        .select("id")
        .single();

      if (error) throw new Error(`startBatch failed: ${error.message}`);
      return data.id as string;
    },

    async getKnownHashes(provider) {
      const known = new Map<string, Set<string>>();

      for (let from = 0; ; from += PAGE_SIZE) {
        const { data, error } = await supabase
          .from("staged_games")
          .select("provider_game_id, content_hash")
          .eq("provider", provider)
          .order("id")
          .range(from, from + PAGE_SIZE - 1);

        if (error) throw new Error(`getKnownHashes failed: ${error.message}`);

        for (const row of data) {
          const hashes = known.get(row.provider_game_id) ?? new Set<string>();
          hashes.add(row.content_hash);
          known.set(row.provider_game_id, hashes);
        }

        if (data.length < PAGE_SIZE) break;
      }

      return known;
    },

    async getCategoryMappings(provider) {
      const { data, error } = await supabase
        .from("category_mappings")
        .select("provider_category, category_id")
        .eq("provider", provider);

      if (error) throw new Error(`getCategoryMappings failed: ${error.message}`);

      return new Map<string, string>(
        data.map((row): [string, string] => [row.provider_category, row.category_id]),
      );
    },

    async insertStaged(batchId, rows) {
      for (let i = 0; i < rows.length; i += INSERT_CHUNK) {
        const chunk = rows.slice(i, i + INSERT_CHUNK).map((row) => ({
          batch_id: batchId,
          provider: row.provider,
          provider_game_id: row.providerGameId,
          raw: row.raw,
          slug: row.slug ?? null,
          title: row.title ?? null,
          description: row.description ?? null,
          thumbnail_url: row.thumbnailUrl ?? null,
          embed_url: row.embedUrl ?? null,
          provider_category: row.providerCategory ?? null,
          category_id: row.categoryId ?? null,
          tags: row.tags,
          devices: row.devices,
          content_hash: row.contentHash,
          status: row.status,
          validation_errors: row.validationErrors,
        }));

        // Wohi (provider, id, hash) pehle se ho to khamoshi se chhod do.
        const { error } = await supabase.from("staged_games").upsert(chunk, {
          onConflict: "provider,provider_game_id,content_hash",
          ignoreDuplicates: true,
        });

        if (error) throw new Error(`insertStaged failed: ${error.message}`);
      }
    },

    async finishBatch(batchId, stats: ImportStats) {
      const { error } = await supabase
        .from("import_batches")
        .update({
          status: "completed",
          finished_at: new Date().toISOString(),
          total_count: stats.total,
          new_count: stats.newCount,
          changed_count: stats.changedCount,
          unchanged_count: stats.unchangedCount,
          invalid_count: stats.invalidCount,
        })
        .eq("id", batchId);

      if (error) throw new Error(`finishBatch failed: ${error.message}`);
    },

    async failBatch(batchId, message) {
      const { error } = await supabase
        .from("import_batches")
        .update({ status: "failed", finished_at: new Date().toISOString(), error: message })
        .eq("id", batchId);

      // Yahan throw nahi: asli error pehle hi upar jaa raha hai, usay chhupana nahi.
      if (error) console.error(`failBatch failed: ${error.message}`);
    },
  };
}
