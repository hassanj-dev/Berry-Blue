import { gameSchema, type Game } from "@berryblue/shared";
import { PAGE_SIZE, type SortName } from "@/lib/games-query";
import { createPublicClient } from "@/lib/supabase/public";

export type ShelfName = SortName;

const SORT_COLUMN = {
  trending: "trending_score",
  new: "created_at",
  popular: "play_count",
} as const;

const GAME_COLUMNS =
  "id, slug, title, description, thumbnail_url, embed_url, tags, devices, provider, created_at, categories(slug)";

// Database ki row (snake_case) ko Game (camelCase) mein badalta hai aur Zod se check karta hai.
function parseRow(row: unknown) {
  const r = row as Record<string, unknown>;
  const category = r.categories as { slug?: string } | null;

  return gameSchema.safeParse({
    id: r.id,
    slug: r.slug,
    title: r.title,
    description: r.description,
    thumbnailUrl: r.thumbnail_url,
    embedUrl: r.embed_url,
    categorySlug: category?.slug,
    tags: r.tags,
    devices: r.devices,
    provider: r.provider,
    createdAt: r.created_at,
  });
}

function parseRows(rows: unknown[] | null): Game[] {
  const games: Game[] = [];

  for (const row of rows ?? []) {
    const result = parseRow(row);
    if (result.success) {
      games.push(result.data);
    } else {
      console.error("Skipping invalid game row:", result.error.issues);
    }
  }

  return games;
}

export async function getShelf(shelf: ShelfName, limit = 8): Promise<Game[]> {
  const supabase = createPublicClient();

  const { data, error } = await supabase
    .from("games")
    .select(GAME_COLUMNS)
    .eq("is_published", true)
    .order(SORT_COLUMN[shelf], { ascending: false })
    .order("id")
    .limit(limit);

  if (error) {
    console.error(`getShelf(${shelf}) failed:`, error.message);
    return [];
  }

  return parseRows(data);
}

export type GamesPage = {
  games: Game[];
  total: number;
  page: number;
  pageCount: number;
};

// null ka matlab: database se baat nahi ho saki.
export async function getGamesPage(
  sort: SortName,
  page: number,
  pageSize = PAGE_SIZE,
): Promise<GamesPage | null> {
  const supabase = createPublicClient();

  const { count, error: countError } = await supabase
    .from("games")
    .select("id", { count: "exact", head: true })
    .eq("is_published", true);

  if (countError || count === null) {
    console.error("getGamesPage count failed:", countError?.message);
    return null;
  }

  const pageCount = Math.max(1, Math.ceil(count / pageSize));
  if (page > pageCount) return { games: [], total: count, page, pageCount };

  const from = (page - 1) * pageSize;

  const { data, error } = await supabase
    .from("games")
    .select(GAME_COLUMNS)
    .eq("is_published", true)
    .order(SORT_COLUMN[sort], { ascending: false })
    .order("id")
    .range(from, from + pageSize - 1);

  if (error) {
    console.error("getGamesPage failed:", error.message);
    return null;
  }

  return { games: parseRows(data), total: count, page, pageCount };
}
