import "server-only";
import { createSecretClient } from "@/lib/supabase/secret";

export const STATUSES = ["pending", "invalid", "rejected", "approved"] as const;
export type StagedStatus = (typeof STATUSES)[number];

export type StagedGame = {
  id: string;
  provider: string;
  provider_game_id: string;
  slug: string | null;
  title: string | null;
  description: string | null;
  thumbnail_url: string | null;
  embed_url: string | null;
  provider_category: string | null;
  category_id: string | null;
  tags: string[];
  devices: string[];
  status: StagedStatus;
  validation_errors: unknown;
  reviewed_at: string | null;
  created_at: string;
};

export type Category = { id: string; slug: string; name: string };

const COLUMNS =
  "id, provider, provider_game_id, slug, title, description, thumbnail_url, embed_url, provider_category, category_id, tags, devices, status, validation_errors, reviewed_at, created_at";

export async function listStaged(status: StagedStatus): Promise<StagedGame[]> {
  const { data, error } = await createSecretClient()
    .from("staged_games")
    .select(COLUMNS)
    .eq("status", status)
    .order("created_at", { ascending: false })
    .order("id")
    .limit(200);

  if (error) throw new Error(`listStaged failed: ${error.message}`);
  return (data ?? []) as StagedGame[];
}

export async function getStaged(id: string): Promise<StagedGame | null> {
  const { data, error } = await createSecretClient()
    .from("staged_games")
    .select(COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`getStaged failed: ${error.message}`);
  return (data as StagedGame | null) ?? null;
}

export async function listCategories(): Promise<Category[]> {
  const { data, error } = await createSecretClient()
    .from("categories")
    .select("id, slug, name")
    .order("name");

  if (error) throw new Error(`listCategories failed: ${error.message}`);
  return (data ?? []) as Category[];
}

// validation_errors is free-form JSON, so turn whatever is inside into readable lines.
export function formatValidationErrors(value: unknown): string[] {
  if (value === null || value === undefined) return [];

  const one = (item: unknown): string => {
    if (typeof item === "string") return item;
    if (item && typeof item === "object") {
      const o = item as { path?: unknown; message?: unknown };
      if (typeof o.message === "string") {
        const path = Array.isArray(o.path) ? o.path.join(".") : "";
        return path ? `${path}: ${o.message}` : o.message;
      }
    }
    return JSON.stringify(item);
  };

  if (Array.isArray(value)) return value.map(one);
  if (typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).map(
      ([key, v]) => `${key}: ${typeof v === "string" ? v : JSON.stringify(v)}`,
    );
  }
  return [String(value)];
}
