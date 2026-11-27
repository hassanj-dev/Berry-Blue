import { timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";

// The admin app calls this after a change, so the site shows it right away
// instead of waiting for the cache to run out.
const ALLOWED_TAGS = new Set(["games", "banners"]);

function sameSecret(received: string, expected: string) {
  const a = Buffer.from(received);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  const received = request.headers.get("authorization")?.replace(/^Bearer /, "") ?? "";

  // No secret configured = the route is closed for everybody.
  if (!secret || !sameSecret(received, secret)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { tags?: unknown } | null;
  const tags = Array.isArray(body?.tags)
    ? body.tags.filter((tag): tag is string => typeof tag === "string" && ALLOWED_TAGS.has(tag))
    : [];

  for (const tag of tags) revalidateTag(tag, { expire: 0 });

  return Response.json({ ok: true, tags });
}
