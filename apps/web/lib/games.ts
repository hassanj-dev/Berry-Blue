import { cacheLife, cacheTag } from "next/cache";
import {
  categorySchema,
  gameSchema,
  type Category,
  type Game as BaseGame,
} from "@berryblue/shared";
import { PAGE_SIZE, type GamesFilters, type SortName } from "@/lib/games-query";
import { createPublicClient } from "@/lib/supabase/public";

export type ShelfName = SortName;

// A game plus the counters the cards show on hover.
export type Game = BaseGame & { playCount: number; likeCount: number; dislikeCount: number };

const SORT_COLUMN = {
  trending: "trending_score",
  new: "created_at",
  popular: "play_count",
} as const;

const GAME_COLUMNS =
  "id, slug, title, description, meta_title, meta_description, thumb_focus_x, thumbnail_url, embed_url, tags, devices, provider, created_at, play_count, like_count, dislike_count, categories(slug)";

// "!inner" means: only games whose category matches the filter.
const GAME_COLUMNS_INNER =
  "id, slug, title, description, meta_title, meta_description, thumb_focus_x, thumbnail_url, embed_url, tags, devices, provider, created_at, play_count, like_count, dislike_count, categories!inner(slug)";

const SLUG_PATTERN = /^[a-z0-9-]+$/;

// Abhi pagination nahi: ek category ya tag par itne games dikhte hain.
export const LISTING_LIMIT = 48;

// Database ki row (snake_case) ko Game (camelCase) mein badalta hai aur Zod se check karta hai.
function parseRow(row: unknown) {
  const base = parseBase(row);
  if (!base.success) return base;

  const r = row as Record<string, unknown>;
  return {
    success: true as const,
    data: {
      ...base.data,
      playCount: Number(r.play_count) || 0,
      likeCount: Number(r.like_count) || 0,
      dislikeCount: Number(r.dislike_count) || 0,
    },
  };
}

function parseBase(row: unknown) {
  const r = row as Record<string, unknown>;
  const category = r.categories as { slug?: string } | null;

  return gameSchema.safeParse({
    id: r.id,
    slug: r.slug,
    title: r.title,
    description: r.description,
    metaTitle: r.meta_title,
    metaDescription: r.meta_description,
    thumbFocusX: r.thumb_focus_x,
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
  cacheLife({ stale: 30, revalidate: 60, expire: 3600 });
  cacheTag("games");

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

// ---------- All games (sort + filters + pagination) ----------

export type GamesPage = {
  games: Game[];
  total: number;
  page: number;
  pageCount: number;
};

// Filters come in as plain strings (null = no filter) so the cache key stays simple.
async function loadGamesPage(
  sort: SortName,
  page: number,
  pageSize: number,
  category: string | null,
  device: string | null,
  tag: string | null,
): Promise<GamesPage> {
  "use cache";
  cacheLife({ stale: 30, revalidate: 60, expire: 3600 });
  cacheTag("games");

  const supabase = createPublicClient();

  // "!inner" is always used, so the count and the list agree on which games exist.
  // The category filter itself is added only when one is chosen.
  let countQuery = supabase
    .from("games")
    .select("id, categories!inner(slug)", { count: "exact", head: true })
    .eq("is_published", true);

  let listQuery = supabase.from("games").select(GAME_COLUMNS_INNER).eq("is_published", true);

  if (category) {
    countQuery = countQuery.eq("categories.slug", category);
    listQuery = listQuery.eq("categories.slug", category);
  }
  if (device) {
    countQuery = countQuery.contains("devices", [device]);
    listQuery = listQuery.contains("devices", [device]);
  }
  if (tag) {
    countQuery = countQuery.contains("tags", [tag]);
    listQuery = listQuery.contains("tags", [tag]);
  }

  const { count, error: countError } = await countQuery;

  if (countError || count === null) {
    throw new Error(`getGamesPage count failed: ${countError?.message ?? "no count"}`);
  }

  const pageCount = Math.max(1, Math.ceil(count / pageSize));
  if (page > pageCount) return { games: [], total: count, page, pageCount };

  const from = (page - 1) * pageSize;

  const { data, error } = await listQuery
    .order(SORT_COLUMN[sort], { ascending: false })
    .order("id")
    .range(from, from + pageSize - 1);

  if (error) throw new Error(`getGamesPage failed: ${error.message}`);

  return { games: parseRows(data), total: count, page, pageCount };
}

// null = the database could not be reached.
export async function getGamesPage(
  sort: SortName,
  page: number,
  filters: GamesFilters = {},
  pageSize = PAGE_SIZE,
): Promise<GamesPage | null> {
  try {
    return await loadGamesPage(
      sort,
      page,
      pageSize,
      filters.category ?? null,
      filters.device ?? null,
      filters.tag ?? null,
    );
  } catch (error) {
    console.error(error);
    return null;
  }
}
// ---------- One game ----------

async function loadGameBySlug(slug: string): Promise<Game | null> {
  "use cache";
  cacheLife({ stale: 30, revalidate: 60, expire: 3600 });
  cacheTag("games");

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

// null = nahi mila. Database error par throw hota hai (error page), 404 nahi.
export async function getGameBySlug(slug: string): Promise<Game | null> {
  if (!SLUG_PATTERN.test(slug)) return null;
  return loadGameBySlug(slug);
}

// ---------- Related games ----------

// Candidates: same category, plus games that share a tag.
// Score: 2 for the same category, 1 for each shared tag. Ties go to the most played.
async function loadRelatedGames(
  categorySlug: string,
  excludeSlug: string,
  tags: string[],
  limit: number,
): Promise<Game[]> {
  "use cache";
  cacheLife({ stale: 30, revalidate: 60, expire: 3600 });
  cacheTag("games");

  const supabase = createPublicClient();

  const sameCategory = await supabase
    .from("games")
    .select(GAME_COLUMNS_INNER)
    .eq("is_published", true)
    .eq("categories.slug", categorySlug)
    .neq("slug", excludeSlug)
    .order("play_count", { ascending: false })
    .order("id")
    .limit(48);

  if (sameCategory.error) {
    throw new Error(`getRelatedGames category failed: ${sameCategory.error.message}`);
  }

  const candidates = parseRows(sameCategory.data);

  if (tags.length > 0) {
    const sharedTags = await supabase
      .from("games")
      .select(GAME_COLUMNS)
      .eq("is_published", true)
      .overlaps("tags", tags)
      .neq("slug", excludeSlug)
      .order("play_count", { ascending: false })
      .order("id")
      .limit(48);

    if (sharedTags.error) {
      throw new Error(`getRelatedGames tags failed: ${sharedTags.error.message}`);
    }

    candidates.push(...parseRows(sharedTags.data));
  }

  const unique = [...new Map(candidates.map((game) => [game.id, game])).values()];

  const score = (game: Game) =>
    (game.categorySlug === categorySlug ? 2 : 0) +
    game.tags.filter((tag) => tags.includes(tag)).length;

  // sort() is stable, so equal scores keep the play_count order.
  return unique.sort((a, b) => score(b) - score(a)).slice(0, limit);
}

export async function getRelatedGames(game: Game, limit = 4): Promise<Game[]> {
  try {
    return await loadRelatedGames(game.categorySlug, game.slug, game.tags, limit);
  } catch (error) {
    console.error(error);
    return [];
  }
}

// ---------- Random game ----------

async function loadPublishedSlugs(): Promise<string[]> {
  "use cache";
  cacheLife({ stale: 300, revalidate: 3600, expire: 86400 });
  cacheTag("games");

  const supabase = createPublicClient();

  const { data, error } = await supabase
    .from("games")
    .select("slug")
    .eq("is_published", true)
    .order("id");

  if (error) throw new Error(`getPublishedSlugs failed: ${error.message}`);

  return (data ?? [])
    .map((row: { slug?: unknown }) => String(row.slug ?? ""))
    .filter((slug) => SLUG_PATTERN.test(slug));
}

async function getPublishedSlugs(): Promise<string[]> {
  try {
    return await loadPublishedSlugs();
  } catch (error) {
    console.error(error);
    return [];
  }
}

// A random published game, or null when there are none. excludeSlug: the game the visitor is on now.
export async function getRandomSlug(excludeSlug?: string): Promise<string | null> {
  const slugs = await getPublishedSlugs();
  const pool = slugs.length > 1 ? slugs.filter((slug) => slug !== excludeSlug) : slugs;
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)] ?? null;
}

// ---------- Categories ----------

async function loadCategories(): Promise<Category[]> {
  "use cache";
  cacheLife({ stale: 30, revalidate: 3600, expire: 86400 });

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
  cacheLife({ stale: 30, revalidate: 3600, expire: 86400 });

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
  cacheLife({ stale: 30, revalidate: 60, expire: 3600 });
  cacheTag("games");

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
  cacheLife({ stale: 30, revalidate: 60, expire: 3600 });
  cacheTag("games");

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

// ---------- Search ----------

// % _ and \ mean something special inside ilike, so they are escaped.
function escapeLike(value: string) {
  return value.replace(/[\\%_]/g, "\\$&");
}

// Not cached on purpose: visitors can type anything, so the cache would never stop growing.
// Call it inside Suspense. null = the database could not be reached.
export async function searchGames(query: string, limit = LISTING_LIMIT): Promise<Game[] | null> {
  const q = query.trim().toLowerCase();
  if (q.length === 0) return [];

  try {
    const supabase = createPublicClient();

    const byTitle = await supabase
      .from("games")
      .select(GAME_COLUMNS)
      .eq("is_published", true)
      .ilike("title", `%${escapeLike(q)}%`)
      .order("play_count", { ascending: false })
      .order("id")
      .limit(limit);

    if (byTitle.error) throw new Error(`searchGames title failed: ${byTitle.error.message}`);

    const found = parseRows(byTitle.data);

    // Tags are lowercase with dashes ("word-puzzle"), so "word puzzle" is tried as that tag.
    const tag = q.replace(/\s+/g, "-");
    if (SLUG_PATTERN.test(tag)) {
      const byTag = await supabase
        .from("games")
        .select(GAME_COLUMNS)
        .eq("is_published", true)
        .contains("tags", [tag])
        .order("play_count", { ascending: false })
        .order("id")
        .limit(limit);

      if (byTag.error) throw new Error(`searchGames tag failed: ${byTag.error.message}`);
      found.push(...parseRows(byTag.data));
    }

    const unique = [...new Map(found.map((game) => [game.id, game])).values()];

    // 0 = title starts with the search, 1 = title contains it, 2 = tag match only.
    // sort() is stable, so equal ranks keep the play_count order.
    const rank = (game: Game) => {
      const title = game.title.toLowerCase();
      return title.startsWith(q) ? 0 : title.includes(q) ? 1 : 2;
    };

    return unique.sort((a, b) => rank(a) - rank(b)).slice(0, limit);
  } catch (error) {
    console.error(error);
    return null;
  }
}

// ---------- Games by slug (favorites, recently played) ----------

// Returns the games in the order of the slugs. Unknown or unpublished slugs are dropped.
// Not cached: every visitor has a different list. null = the database could not be reached.
export async function getGamesBySlugs(slugs: string[]): Promise<Game[] | null> {
  const unique = [...new Set(slugs)].slice(0, 50);
  if (unique.length === 0) return [];

  try {
    const { data, error } = await createPublicClient()
      .from("games")
      .select(GAME_COLUMNS)
      .eq("is_published", true)
      .in("slug", unique);

    if (error) throw new Error(`getGamesBySlugs failed: ${error.message}`);

    const bySlug = new Map(parseRows(data).map((game) => [game.slug, game]));
    return unique.flatMap((slug) => {
      const game = bySlug.get(slug);
      return game ? [game] : [];
    });
  } catch (error) {
    console.error(error);
    return null;
  }
}
