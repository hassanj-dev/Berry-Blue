import { NextResponse, type NextRequest } from "next/server";
import { getGamesBySlugs } from "@/lib/games";

const MAX_SLUGS = 50;
const SLUG_OK = /^[A-Za-z0-9_-]{1,100}$/;
const DESCRIPTION_MAX = 200;

// ?slugs=a,b,c  ->  only the fields a game card needs.
export async function GET(request: NextRequest) {
  const slugs = (request.nextUrl.searchParams.get("slugs") ?? "")
    .split(",")
    .map((slug) => slug.trim())
    .filter((slug) => SLUG_OK.test(slug))
    .slice(0, MAX_SLUGS);

  const games = await getGamesBySlugs(slugs);
  if (!games) return NextResponse.json({ games: [] }, { status: 503 });

  return NextResponse.json({
    games: games.map(
      ({
        slug,
        title,
        description,
        categorySlug,
        devices,
        tags,
        thumbnailUrl,
        playCount,
        likeCount,
      }) => ({
        slug,
        title,
        description: description.slice(0, DESCRIPTION_MAX),
        categorySlug,
        devices,
        tags,
        thumbnailUrl,
        playCount,
        likeCount,
      }),
    ),
  });
}
