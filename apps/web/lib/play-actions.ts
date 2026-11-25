"use server";

import { z } from "zod";
import { createSecretClient } from "@/lib/supabase/secret";

const gameIdSchema = z.uuid();

// Counts one play. A failure here must never break the game, so errors are only logged.
export async function recordPlay(gameId: string): Promise<void> {
  const parsed = gameIdSchema.safeParse(gameId);
  if (!parsed.success) return;

  try {
    const { error } = await createSecretClient().rpc("increment_play_count", {
      p_game_id: parsed.data,
    });
    if (error) console.error("recordPlay failed:", error.message);
  } catch (error) {
    console.error("recordPlay failed:", error);
  }
}
