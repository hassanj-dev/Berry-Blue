import type { NextRequest } from "next/server";
import { renderIcon } from "@/lib/pwa-icon";

const SIZES = new Set([192, 512]);

// /pwa-icon?size=192|512[&maskable=1]. Any other size becomes 512.
export function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const requested = Number(params.get("size"));
  const size = SIZES.has(requested) ? requested : 512;

  return renderIcon(size, params.get("maskable") === "1", {
    "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
  });
}
