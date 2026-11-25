"use server";

import { z } from "zod";
import { createPublicClient } from "@/lib/supabase/public";
import { createSecretClient } from "@/lib/supabase/secret";

const inputSchema = z.object({
  gameId: z.uuid(),
  reason: z.enum(["not_loading", "broken_controls", "inappropriate", "other"]),
});

// Saves one report. Returns false on any failure.
export async function reportGame(gameId: string, reason: string): Promise<boolean> {
  const parsed = inputSchema.safeParse({ gameId, reason });
  if (!parsed.success) return false;

  try {
    const { data: game } = await createPublicClient()
      .from("games")
      .select("id")
      .eq("id", parsed.data.gameId)
      .eq("is_published", true)
      .maybeSingle();
    if (!game) return false;

    const { error } = await createSecretClient()
      .from("game_reports")
      .insert({ game_id: parsed.data.gameId, reason: parsed.data.reason });

    if (error) {
      console.error("reportGame failed:", error.message);
      return false;
    }
    return true;
  } catch (error) {
    console.error("reportGame failed:", error);
    return false;
  }
}
