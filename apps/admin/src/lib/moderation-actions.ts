"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { getStaged } from "@/lib/moderation";
import { refreshSite } from "@/lib/refresh-site";
import { createSecretClient } from "@/lib/supabase/secret";

export type ReviewState = { error: string | null };

const approveSchema = z.object({
  stagedId: z.uuid(),
  categoryId: z.uuid({ error: "Choose a category before approving." }),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]+$/, "Slug can only have lowercase letters, numbers and dashes."),
});

const rejectSchema = z.object({
  stagedId: z.uuid(),
  reason: z.string().trim().max(500, "Reason is too long (max 500 characters).").optional(),
});

export async function approveGame(
  _previous: ReviewState,
  formData: FormData,
): Promise<ReviewState> {
  // First line of every Server Action: never trust the page that called it.
  const admin = await requireAdmin();

  const parsed = approveSchema.safeParse({
    stagedId: formData.get("stagedId"),
    categoryId: formData.get("categoryId"),
    slug: formData.get("slug"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const supabase = createSecretClient();

  // A game that is already in our list is an update and stays as it is. Only a brand-new game
  // goes to Pending: hidden until it is edited in Games and published.
  const staged = await getStaged(parsed.data.stagedId);
  let isNew = false;
  if (staged) {
    const { data: existing } = await supabase
      .from("games")
      .select("id")
      .eq("provider", staged.provider)
      .eq("provider_game_id", staged.provider_game_id)
      .maybeSingle();
    isNew = !existing;
  }

  const { error } = await supabase.rpc("approve_staged_game", {
    p_staged_id: parsed.data.stagedId,
    p_category_id: parsed.data.categoryId,
    p_admin_id: admin.id,
    p_slug: parsed.data.slug,
  });

  if (!error) {
    revalidatePath("/games");
    if (isNew) {
      const { data: marked, error: markError } = await supabase
        .from("games")
        .update({ is_published: false, needs_review: true })
        .eq("slug", parsed.data.slug)
        .select("id");
      await refreshSite(["games"]);
      if (markError || !marked?.length) {
        console.error("could not mark the game as pending:", markError?.message);
        return {
          error:
            "Approved, but it could not be set to Pending. Check it in Games before it stays live.",
        };
      }
    }
  }

  // The database function explains itself (for example: slug already used by another game).
  if (error) return { error: error.message };

  revalidatePath("/moderation");
  revalidatePath("/overview");
  redirect("/moderation");
}

export async function rejectGame(_previous: ReviewState, formData: FormData): Promise<ReviewState> {
  const admin = await requireAdmin();

  const parsed = rejectSchema.safeParse({
    stagedId: formData.get("stagedId"),
    reason: formData.get("reason") ?? undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const { error } = await createSecretClient().rpc("reject_staged_game", {
    p_staged_id: parsed.data.stagedId,
    p_admin_id: admin.id,
    p_reason: parsed.data.reason || null,
  });
  if (error) return { error: error.message };

  revalidatePath("/moderation");
  revalidatePath("/overview");
  redirect("/moderation");
}
