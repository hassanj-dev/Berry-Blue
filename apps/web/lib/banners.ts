import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";

export type HomeBanner = {
  id: string;
  title: string;
  tag: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
};

const MAX_BANNERS = 10;

async function loadBanners(): Promise<HomeBanner[]> {
  "use cache";
  cacheLife({ stale: 30, revalidate: 60, expire: 3600 });
  cacheTag("banners");

  const { data, error } = await createPublicClient()
    .from("home_banners")
    .select("id, title, tag, description, image_url, link_url")
    .eq("is_active", true)
    .order("sort_order")
    .order("created_at")
    .limit(MAX_BANNERS);

  if (error) throw new Error(`getHomeBanners failed: ${error.message}`);

  return (data ?? []).map((row) => ({
    id: String(row.id),
    title: String(row.title),
    tag: row.tag ? String(row.tag) : "",
    description: row.description ? String(row.description) : "",
    imageUrl: String(row.image_url),
    linkUrl: String(row.link_url),
  }));
}

// An error returns [] so the home page falls back to the trending games.
export async function getHomeBanners(): Promise<HomeBanner[]> {
  try {
    return await loadBanners();
  } catch (error) {
    console.error(error);
    return [];
  }
}
