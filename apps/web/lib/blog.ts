import { createClient } from "@supabase/supabase-js";
import { cacheLife, cacheTag } from "next/cache";

export type BlogCard = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  cover_url: string | null;
  published_at: string;
};

export type BlogPost = BlogCard & { content: string; updated_at: string };

const CARD_COLUMNS = "id, title, slug, excerpt, cover_url, published_at";

// Same public key the ads route uses. The database policy only lets it read published posts.
function client() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.error("blog: Supabase URL or public key is missing in the web env");
    return null;
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

// Kept for about a minute, so a new post shows up on the site shortly after you publish it.
export async function getPosts(): Promise<BlogCard[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("blog");

  const supabase = client();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("blog_posts")
    .select(CARD_COLUMNS)
    .order("published_at", { ascending: false })
    .limit(100);
  if (error) {
    console.error("blog: list failed:", error.message);
    return [];
  }
  return (data ?? []) as BlogCard[];
}

export async function getPost(slug: string): Promise<BlogPost | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag("blog");

  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) return null;
  const supabase = client();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("blog_posts")
    .select(`${CARD_COLUMNS}, content, updated_at`)
    .eq("slug", slug)
    .maybeSingle();
  if (error) {
    console.error("blog: post failed:", error.message);
    return null;
  }
  return (data as BlogPost | null) ?? null;
}

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export function formatPostDate(iso: string): string {
  return dateFormat.format(new Date(iso));
}
