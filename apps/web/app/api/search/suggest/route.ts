import { NextResponse, type NextRequest } from "next/server";
import { parseSuggestQuery } from "@/lib/search-query";
import { getSuggestions } from "@/lib/search-suggest";

export async function GET(request: NextRequest) {
  const q = parseSuggestQuery(request.nextUrl.searchParams.get("q"));
  if (!q) return NextResponse.json({ suggestions: [] });

  const suggestions = await getSuggestions(q);
  if (!suggestions) return NextResponse.json({ suggestions: [] }, { status: 503 });

  return NextResponse.json(
    { suggestions },
    { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } },
  );
}
