import { contentHash } from "./hash";
import type { ImportStats, ProviderAdapter, StagedRow, StagingStore } from "./types";
import { validateDraft } from "./validate";

export type ImportResult = {
  batchId: string;
  stats: ImportStats;
  // Woh games jo staging tak pohonch hi nahi sake (adapter ne throw kiya ya id nahi thi).
  skipped: { index: number; reason: string }[];
};

export async function runImport(
  adapter: ProviderAdapter,
  store: StagingStore,
): Promise<ImportResult> {
  const batchId = await store.startBatch(adapter.provider);

  const stats: ImportStats = {
    total: 0,
    newCount: 0,
    changedCount: 0,
    unchangedCount: 0,
    invalidCount: 0,
  };
  const skipped: ImportResult["skipped"] = [];

  try {
    const catalog = await adapter.fetchCatalog();
    const known = await store.getKnownHashes(adapter.provider);
    const seenInFeed = new Set<string>();
    const rows: StagedRow[] = [];

    for (const [index, raw] of catalog.entries()) {
      stats.total += 1;

      let draft;
      try {
        draft = adapter.toInternal(raw);
      } catch (error) {
        stats.invalidCount += 1;
        skipped.push({ index, reason: error instanceof Error ? error.message : String(error) });
        continue;
      }

      if (!draft.providerGameId) {
        stats.invalidCount += 1;
        skipped.push({ index, reason: "providerGameId missing" });
        continue;
      }

      const hash = await contentHash(raw);
      const key = draft.providerGameId + ":" + hash;

      // Wohi game feed mein do baar aaye, ya pehle hi staging mein hai: dobara nahi.
      const hashes = known.get(draft.providerGameId);
      if (seenInFeed.has(key) || hashes?.has(hash)) {
        stats.unchangedCount += 1;
        continue;
      }
      seenInFeed.add(key);

      if (hashes === undefined) stats.newCount += 1;
      else stats.changedCount += 1;

      const base = {
        provider: adapter.provider,
        providerGameId: draft.providerGameId,
        raw,
        providerCategory: draft.providerCategory,
        contentHash: hash,
      };

      const validation = validateDraft(draft);

      if (validation.ok) {
        rows.push({ ...base, ...validation.data, status: "pending", validationErrors: null });
      } else {
        stats.invalidCount += 1;
        rows.push({
          ...base,
          slug: draft.slug,
          title: draft.title,
          description: draft.description,
          thumbnailUrl: draft.thumbnailUrl,
          embedUrl: draft.embedUrl,
          tags: draft.tags ?? [],
          devices: draft.devices ?? [],
          status: "invalid",
          validationErrors: validation.errors,
        });
      }
    }

    if (rows.length > 0) await store.insertStaged(batchId, rows);
    await store.finishBatch(batchId, stats);

    return { batchId, stats, skipped };
  } catch (error) {
    await store.failBatch(batchId, error instanceof Error ? error.message : String(error));
    throw error;
  }
}
