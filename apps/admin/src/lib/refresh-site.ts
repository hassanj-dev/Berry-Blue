// Tells the public site to drop its cached copy, so an admin change shows up right away.
// Needs WEB_URL and REVALIDATE_SECRET in the admin .env.local (the same secret as in the site).
export async function refreshSite(tags: Array<"games" | "banners">) {
  const base = process.env.WEB_URL;
  const secret = process.env.REVALIDATE_SECRET;

  if (!base || !secret) {
    console.warn("refreshSite skipped: WEB_URL or REVALIDATE_SECRET is not set.");
    return;
  }

  try {
    const response = await fetch(new URL("/api/revalidate", base), {
      method: "POST",
      headers: { authorization: `Bearer ${secret}`, "content-type": "application/json" },
      body: JSON.stringify({ tags }),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) console.warn(`refreshSite failed: HTTP ${response.status}`);
  } catch (error) {
    // The change is already saved. The site still catches up when its cache runs out.
    console.warn("refreshSite failed:", error instanceof Error ? error.message : error);
  }
}
