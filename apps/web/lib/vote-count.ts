import { createPublicClient } from "@/lib/supabase/public";

export type VoteCounts = { likes: number; dislikes: number };

// Not cached on purpose: the numbers should be fresh. Call it inside Suspense.
// null = game not found or the database could not be reached.
export async function getVoteCounts(gameId: string): Promise<VoteCounts | null> {
  try {
    const { data, error } = await createPublicClient()
      .from("games")
      .select("like_count, dislike_count")
      .eq("id", gameId)
      .eq("is_published", true)
      .maybeSingle();

    if (error) {
      console.error("getVoteCounts failed:", error.message);
      return null;
    }

    return data ? { likes: Number(data.like_count), dislikes: Number(data.dislike_count) } : null;
  } catch (error) {
    console.error("getVoteCounts failed:", error);
    return null;
  }
}
