import { createPublicClient } from "@/lib/supabase/public";

// Not cached on purpose: the number should be fresh. Call it inside Suspense.
// null = game not found or the database could not be reached.
export async function getPlayCount(gameId: string): Promise<number | null> {
  try {
    const { data, error } = await createPublicClient()
      .from("games")
      .select("play_count")
      .eq("id", gameId)
      .eq("is_published", true)
      .maybeSingle();

    if (error) {
      console.error("getPlayCount failed:", error.message);
      return null;
    }

    return data ? Number(data.play_count) : null;
  } catch (error) {
    console.error("getPlayCount failed:", error);
    return null;
  }
}
