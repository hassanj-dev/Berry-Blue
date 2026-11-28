import type { MetadataRoute } from "next";
import { getPosts } from "@/lib/blog";
import { getGuides } from "@/lib/content";
import { getGamesPage } from "@/lib/games";
import { siteConfig } from "@/lib/site";

const staticPaths = [
  "",
  "/games",
  "/guides",
  "/blog",
  "/faqs",
  "/about",
  "/contact",
  "/privacy-policy",
  "/terms-of-service",
];

// Every list is read on its own: if one fails, the rest of the sitemap is still returned.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;
  const [posts, guides, games] = await Promise.all([
    getPosts().catch(() => []),
    getGuides().catch(() => []),
    getGamesPage("new", 1, {}, 1000).catch(() => null),
  ]);

  return [
    ...staticPaths.map((path) => ({ url: `${base}${path}` })),
    ...posts.map((post) => ({
      url: `${base}/blog/${post.slug}`,
      lastModified: new Date(post.published_at),
    })),
    ...guides.map((guide) => ({ url: `${base}/guides/${guide.slug}` })),
    ...(games?.games ?? []).map((game) => ({ url: `${base}/game/${game.slug}` })),
  ];
}
