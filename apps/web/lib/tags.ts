import { cacheLife } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";

export type TagOption = { tag: string; count: number };

const SLUG_PATTERN = /^[a-z0-9-]+$/;

async function loadTags(): Promise<TagOption[]> {
  "use cache";
  cacheLife({ stale: 30, revalidate: 3600, expire: 86400 });

  const { data, error } = await createPublicClient()
    .from("games")
    .select("tags")
    .eq("is_published", true)
    .limit(1000);

  if (error) throw new Error(`getTags failed: ${error.message}`);

  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    const tags = (row as { tags: unknown }).tags;
    if (!Array.isArray(tags)) continue;
    for (const tag of tags) {
      if (typeof tag === "string" && SLUG_PATTERN.test(tag)) {
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      }
    }
  }

  return [...counts]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

export async function getTags(): Promise<TagOption[]> {
  try {
    return await loadTags();
  } catch (error) {
    console.error(error);
    return [];
  }
}
