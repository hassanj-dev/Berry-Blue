import type { Provider } from "@berryblue/shared";

// Adapter ka kaam: provider ka kaccha data hamari shakal ke qareeb laana.
// Sahi ya ghalat hone ka faisla core karta hai (validate.ts), adapter nahi.
export type GameDraft = {
  providerGameId: string;
  slug?: string;
  title?: string;
  description?: string;
  thumbnailUrl?: string;
  embedUrl?: string;
  providerCategory?: string;
  tags?: string[];
  devices?: string[];
};

export interface ProviderAdapter {
  readonly provider: Provider;
  // Provider se poori list (kaccha data, jaisa aaya).
  fetchCatalog(): Promise<unknown[]>;
  // Ek kaccha game ko GameDraft mein badalna. Ghalat data par throw kar sakta hai.
  toInternal(raw: unknown): GameDraft;
}

export type StagedStatus = "pending" | "invalid";

// staged_games table ki ek row (camelCase). category_id review par tay hoti hai, yahan nahi.
export type StagedRow = {
  provider: Provider;
  providerGameId: string;
  raw: unknown;
  slug?: string;
  title?: string;
  description?: string;
  thumbnailUrl?: string;
  embedUrl?: string;
  providerCategory?: string;
  tags: string[];
  devices: string[];
  contentHash: string;
  categoryId?: string | null;
  status: StagedStatus;
  validationErrors: { path: string; message: string }[] | null;
};

export type ImportStats = {
  total: number;
  newCount: number;
  changedCount: number;
  unchangedCount: number;
  // invalid = staging mein "invalid" bani rows + woh jo staging tak pohonch hi nahi sakin.
  invalidCount: number;
};

// Core ko database ka pata nahi: asli Supabase wala hissa alag likha jayega.
export interface StagingStore {
  startBatch(provider: Provider): Promise<string>;
  // providerGameId -> ab tak dekhe gaye hashes (staged_games se).
  getKnownHashes(provider: Provider): Promise<Map<string, Set<string>>>;
  // normalized provider category -> our category_id.
  getCategoryMappings(provider: Provider): Promise<Map<string, string>>;
  // Remember which provider game ids were in this feed (used to find games that disappeared).
  markSeen(provider: Provider, providerGameIds: string[]): Promise<void>;
  // Duplicate (provider, provider_game_id, content_hash) khamoshi se chhod dena chahiye.
  insertStaged(batchId: string, rows: StagedRow[]): Promise<void>;
  finishBatch(batchId: string, stats: ImportStats): Promise<void>;
  failBatch(batchId: string, error: string): Promise<void>;
}
