"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { createSecretClient } from "@/lib/supabase/secret";

const schema = z.object({
  gameId: z.uuid(),
  published: z.enum(["true", "false"]),
});

export async function setPublished(formData: FormData) {
  // First line of every Server Action.
  const admin = await requireAdmin();

  const parsed = schema.safeParse({
    gameId: formData.get("gameId"),
    published: formData.get("published"),
  });
  if (!parsed.success) throw new Error("Invalid request.");

  const { error } = await createSecretClient().rpc("set_game_published", {
    p_game_id: parsed.data.gameId,
    p_published: parsed.data.published === "true",
    p_admin_id: admin.id,
  });

  // Refresh in every case so a stale list corrects itself.
  revalidatePath("/games");
  revalidatePath("/overview");

  if (error) {
    console.error("set_game_published failed:", error.message);
    throw new Error("Could not update the game.");
  }
}
