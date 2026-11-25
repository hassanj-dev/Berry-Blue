import { createPublicClient } from "@/lib/supabase/public";

export type Suggestion = { title: string; slug: string };

export const SUGGEST_LIMIT = 8;

// % _ and \ mean something special inside ilike, so they are escaped.
function escapeLike(value: string) {
  return value.replace(/[\\%_]/g, "\\$&");
}

// Not cached on purpose: visitors can type anything. Returns null if the database could not be reached.
// Order: title starts with the text, then a word in the title starts with it, then it appears anywhere.
export async function getSuggestions(query: string): Promise<Suggestion[] | null> {
  const q = query.trim().toLowerCase();
  if (q.length === 0) return [];

  try {
    const { data, error } = await createPublicClient()
      .from("games")
      .select("title, slug")
      .eq("is_published", true)
      .ilike("title", `%${escapeLike(q)}%`)
      .order("play_count", { ascending: false })
      .order("id")
      .limit(30);

    if (error) {
      console.error("getSuggestions failed:", error.message);
      return null;
    }

    const rows = ((data ?? []) as { title: unknown; slug: unknown }[]).filter(
      (row): row is Suggestion => typeof row.title === "string" && typeof row.slug === "string",
    );

    const rank = (title: string) => {
      const lower = title.toLowerCase();
      return lower.startsWith(q) ? 0 : lower.includes(" " + q) ? 1 : 2;
    };

    // sort() is stable, so equal ranks keep the play_count order.
    return rows
      .sort((a, b) => rank(a.title) - rank(b.title))
      .slice(0, SUGGEST_LIMIT)
      .map(({ title, slug }) => ({ title, slug }));
  } catch (error) {
    console.error("getSuggestions failed:", error);
    return null;
  }
}
