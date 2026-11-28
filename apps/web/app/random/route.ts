import { connection, NextResponse } from "next/server";
import { getRandomSlug } from "@/lib/games";

const SLUG_PATTERN = /^[a-z0-9-]+$/;

// /random sends the visitor to a random published game. /random?from=<slug> never picks that same game.
export async function GET(request: Request) {
  // Without this, Next could build the page once and give everybody the same "random" game.
  await connection();

  const url = new URL(request.url);
  const from = url.searchParams.get("from") ?? "";
  const slug = await getRandomSlug(SLUG_PATTERN.test(from) ? from : undefined);

  const response = NextResponse.redirect(new URL(slug ? "/game/" + slug : "/games", url), 307);
  response.headers.set("Cache-Control", "no-store");
  return response;
}
