import type { GameCardData } from "@/components/game/GameCard";

// Browser side: loads card data for a list of slugs. Throws if the request fails.
export async function fetchGamesBySlugs(
  slugs: readonly string[],
  signal?: AbortSignal,
): Promise<GameCardData[]> {
  if (slugs.length === 0) return [];

  const response = await fetch("/api/games/by-slugs?slugs=" + encodeURIComponent(slugs.join(",")), {
    signal: signal ?? null,
  });
  if (!response.ok) throw new Error("status " + response.status);

  const data: unknown = await response.json();
  if (typeof data !== "object" || data === null || !("games" in data)) return [];
  if (!Array.isArray(data.games)) return [];

  return data.games as GameCardData[];
}
