"use server";

import { z } from "zod";
import type { VoteCounts } from "@/lib/vote-count";
import { createSecretClient } from "@/lib/supabase/secret";

const voteValue = z.union([z.literal(-1), z.literal(0), z.literal(1)]);

const inputSchema = z
  .object({ gameId: z.uuid(), from: voteValue, to: voteValue })
  .refine((v) => v.from !== v.to);

// Moves one vote (1 = like, -1 = dislike, 0 = none). Returns the new counts, or null on any failure.
// A failure here must never break the page, so errors are only logged.
export async function castVote(
  gameId: string,
  from: number,
  to: number,
): Promise<VoteCounts | null> {
  const parsed = inputSchema.safeParse({ gameId, from, to });
  if (!parsed.success) return null;

  try {
    const { data, error } = await createSecretClient().rpc("change_vote", {
      p_game_id: parsed.data.gameId,
      p_from: parsed.data.from,
      p_to: parsed.data.to,
    });

    if (error) {
      console.error("castVote failed:", error.message);
      return null;
    }

    const row = Array.isArray(data) ? data[0] : data;
    if (!row) return null;
    return { likes: Number(row.likes), dislikes: Number(row.dislikes) };
  } catch (error) {
    console.error("castVote failed:", error);
    return null;
  }
}
