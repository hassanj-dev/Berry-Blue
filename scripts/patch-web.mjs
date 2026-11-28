// Run from the Portal root:  node scripts/patch-web.mjs
// Small, safe text edits to 3 existing files. Safe to run twice.
import { readFileSync, writeFileSync } from "node:fs";

let failed = false;

function patch(file, edits) {
  let text = readFileSync(file, "utf8");
  const eol = text.includes("\r\n") ? "\r\n" : "\n";

  for (const [from, rawTo, doneMarker] of edits) {
    const to = rawTo.replaceAll("\n", eol);
    if (text.includes(to)) continue; // already patched
    if (doneMarker && text.includes(doneMarker)) continue; // patched by an earlier version of this script
    if (!text.includes(from)) {
      console.error(`NOT FOUND in ${file}:\n  ${from}`);
      failed = true;
      continue;
    }
    text = text.replaceAll(from, to);
  }

  writeFileSync(file, text);
  console.log("patched", file);
}

patch("apps/web/components/game/HeroSlider.tsx", [
  ["  slug: string;", "  id: string;\n  href: string;\n  favoriteSlug?: string | undefined;"],
  ["  categorySlug: string;", "  tag: string;"],
  ["key={slide.slug}", "key={slide.id}"],
  ["{slide.categorySlug}", "{slide.tag}"],
  ['href={"/game/" + slide.slug}', "href={slide.href}"],
  [
    "<BannerFavorite slug={slide.slug} />",
    "{slide.favoriteSlug ? <BannerFavorite slug={slide.favoriteSlug} /> : null}",
  ],
  [
    'capitalize leading-none text-white backdrop-blur"',
    'capitalize leading-none text-white backdrop-blur empty:hidden"',
  ],
]);

patch("apps/web/lib/games.ts", [
  [
    "title, description, thumbnail_url, embed_url",
    "title, description, meta_title, meta_description, thumbnail_url, embed_url",
    "meta_title, meta_description,",
  ],
  [
    "description: r.description,",
    "description: r.description,\n    metaTitle: r.meta_title,\n    metaDescription: r.meta_description,",
  ],
]);

patch("packages/shared/src/game.ts", [
  [
    'description: z.string().max(2000).default(""),',
    'description: z.string().max(2000).default(""),\n  metaTitle: z.string().nullish(),\n  metaDescription: z.string().nullish(),',
  ],
]);

// Card focus (added with the focus slider)
patch("apps/web/components/game/GameCard.tsx", [
  [
    '"slug" | "title" | "categorySlug" | "devices" | "tags" | "thumbnailUrl"',
    '"slug" | "title" | "categorySlug" | "devices" | "tags" | "thumbnailUrl" | "thumbFocusX"',
  ],
  [
    'className="card-thumb object-cover"',
    'className="card-thumb object-cover"\n        style={{ objectPosition: `${game.thumbFocusX ?? 50}% 50%` }}',
  ],
]);

patch("apps/web/lib/games.ts", [
  ["meta_description, thumbnail_url,", "meta_description, thumb_focus_x, thumbnail_url,"],
  [
    "metaDescription: r.meta_description,",
    "metaDescription: r.meta_description,\n    thumbFocusX: r.thumb_focus_x,",
  ],
]);

patch("packages/shared/src/game.ts", [
  [
    "metaDescription: z.string().nullish(),",
    "metaDescription: z.string().nullish(),\n  thumbFocusX: z.number().int().min(0).max(100).nullish(),",
  ],
]);

// Instant refresh: tag the cached game queries so the admin can expire them.
patch("apps/web/lib/games.ts", [
  ['import { cacheLife } from "next/cache";', 'import { cacheLife, cacheTag } from "next/cache";'],
  ['cacheLife("minutes");', 'cacheLife("minutes");\n  cacheTag("games");'],
]);

if (failed) {
  console.error("\nSome edits did not apply. Send me the file named above.");
  process.exit(1);
}
