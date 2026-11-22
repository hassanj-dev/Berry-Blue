import { cacheLife } from "next/cache";
import { categorySchema, gameSchema, type Category, type Game } from "@berryblue/shared";
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

// "!inner" means: only games whose category matches the filter.
const GAME_COLUMNS_INNER =
  "id, slug, title, description, thumbnail_url, embed_url, tags, devices, provider, created_at, categories!inner(slug)";

const SLUG_PATTERN = /^[a-z0-9-]+$/;

// Abhi pagination nahi: ek category ya tag par itne games dikhte hain.
export const LISTING_LIMIT = 48;

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

// Rule: "use cache" wale functions error par THROW karte hain (cache mein sirf kamyab jawab
// jaate hain). Bahar ka wrapper error pakad kar pehle jaisa khali jawab lautata hai.

// ---------- Shelves (homepage) ----------

async function loadShelf(shelf: ShelfName, limit: number): Promise<Game[]> {
  "use cache";
  cacheLife("minutes");

  const supabase = createPublicClient();

  const { data, error } = await supabase
    .from("games")
    .select(GAME_COLUMNS)
    .eq("is_published", true)
    .order(SORT_COLUMN[shelf], { ascending: false })
    .order("id")
    .limit(limit);

  if (error) throw new Error(`getShelf(${shelf}) failed: ${error.message}`);

  return parseRows(data);
}

export async function getShelf(shelf: ShelfName, limit = 8): Promise<Game[]> {
  try {
    return await loadShelf(shelf, limit);
  } catch (error) {
    console.error(error);
    return [];
  }
}

// ---------- All games (sort + pagination) ----------

export type GamesPage = {
  games: Game[];
  total: number;
  page: number;
  pageCount: number;
};

async function loadGamesPage(sort: SortName, page: number, pageSize: number): Promise<GamesPage> {
  "use cache";
  cacheLife("minutes");

  const supabase = createPublicClient();

  const { count, error: countError } = await supabase
    .from("games")
    .select("id", { count: "exact", head: true })
    .eq("is_published", true);

  if (countError || count === null) {
    throw new Error(`getGamesPage count failed: ${countError?.message ?? "no count"}`);
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

  if (error) throw new Error(`getGamesPage failed: ${error.message}`);

  return { games: parseRows(data), total: count, page, pageCount };
}

// null ka matlab: database se baat nahi ho saki.
export async function getGamesPage(
  sort: SortName,
  page: number,
  pageSize = PAGE_SIZE,
): Promise<GamesPage | null> {
  try {
    return await loadGamesPage(sort, page, pageSize);
  } catch (error) {
    console.error(error);
    return null;
  }
}

// ---------- One game ----------

// null = nahi mila. Database error par throw (error page), taake masla cache na ho.
export async function getGameBySlug(slug: string): Promise<Game | null> {
  "use cache";
  cacheLife("minutes");

  // URL se aane wali value par bharosa nahi: ghalat slug par database tak jaana hi nahi.
  if (!SLUG_PATTERN.test(slug)) return null;

  const supabase = createPublicClient();

  const { data, error } = await supabase
    .from("games")
    .select(GAME_COLUMNS)
    .eq("is_published", true)
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw new Error(`getGameBySlug(${slug}) failed: ${error.message}`);
  if (!data) return null;

  const result = parseRow(data);
  if (!result.success) {
    console.error(`Invalid game row for ${slug}:`, result.error.issues);
    return null;
  }

  return result.data;
}

// ---------- Related games ----------

async function loadRelatedGames(
  categorySlug: string,
  excludeSlug: string,
  limit: number,
): Promise<Game[]> {
  "use cache";
  cacheLife("minutes");

  const supabase = createPublicClient();

  const { data, error } = await supabase
    .from("games")
    .select(GAME_COLUMNS_INNER)
    .eq("is_published", true)
    .eq("categories.slug", categorySlug)
    .neq("slug", excludeSlug)
    .order("play_count", { ascending: false })
    .order("id")
    .limit(limit);

  if (error) throw new Error(`getRelatedGames(${categorySlug}) failed: ${error.message}`);

  return parseRows(data);
}

export async function getRelatedGames(
  categorySlug: string,
  excludeSlug: string,
  limit = 4,
): Promise<Game[]> {
  try {
    return await loadRelatedGames(categorySlug, excludeSlug, limit);
  } catch (error) {
    console.error(error);
    return [];
  }
}

// ---------- Categories ----------

async function loadCategories(): Promise<Category[]> {
  "use cache";
  cacheLife("hours");

  const supabase = createPublicClient();

  const { data, error } = await supabase.from("categories").select("id, slug, name").order("name");

  if (error) throw new Error(`getCategories failed: ${error.message}`);

  const categories: Category[] = [];
  for (const row of data ?? []) {
    const result = categorySchema.safeParse(row);
    if (result.success) {
      categories.push(result.data);
    } else {
      console.error("Skipping invalid category row:", result.error.issues);
    }
  }

  return categories;
}

export async function getCategories(): Promise<Category[]> {
  try {
    return await loadCategories();
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  "use cache";
  cacheLife("hours");

  if (!SLUG_PATTERN.test(slug)) return null;

  const supabase = createPublicClient();

  const { data, error } = await supabase
    .from("categories")
    .select("id, slug, name")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw new Error(`getCategoryBySlug(${slug}) failed: ${error.message}`);
  if (!data) return null;

  const result = categorySchema.safeParse(data);
  return result.success ? result.data : null;
}

// ---------- Category and tag listings ----------

async function loadCategoryGames(categorySlug: string, limit: number): Promise<Game[]> {
  "use cache";
  cacheLife("minutes");

  const supabase = createPublicClient();

  const { data, error } = await supabase
    .from("games")
    .select(GAME_COLUMNS_INNER)
    .eq("is_published", true)
    .eq("categories.slug", categorySlug)
    .order("play_count", { ascending: false })
    .order("id")
    .limit(limit);

  if (error) throw new Error(`getCategoryGames(${categorySlug}) failed: ${error.message}`);

  return parseRows(data);
}

export async function getCategoryGames(
  categorySlug: string,
  limit = LISTING_LIMIT,
): Promise<Game[]> {
  // Ghalat slug par cache entry bhi nahi banti.
  if (!SLUG_PATTERN.test(categorySlug)) return [];

  try {
    return await loadCategoryGames(categorySlug, limit);
  } catch (error) {
    console.error(error);
    return [];
  }
}

async function loadTagGames(tag: string, limit: number): Promise<Game[]> {
  "use cache";
  cacheLife("minutes");

  const supabase = createPublicClient();

  const { data, error } = await supabase
    .from("games")
    .select(GAME_COLUMNS)
    .eq("is_published", true)
    .contains("tags", [tag])
    .order("play_count", { ascending: false })
    .order("id")
    .limit(limit);

  if (error) throw new Error(`getTagGames(${tag}) failed: ${error.message}`);

  return parseRows(data);
}

export async function getTagGames(tag: string, limit = LISTING_LIMIT): Promise<Game[]> {
  if (!SLUG_PATTERN.test(tag)) return [];

  try {
    return await loadTagGames(tag, limit);
  } catch (error) {
    console.error(error);
    return [];
  }
}
