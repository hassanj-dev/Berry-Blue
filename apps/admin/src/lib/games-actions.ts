"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import {
  UserError,
  isRealFile,
  processAndUpload,
  removeUploadedImage,
  thumbnailImage,
} from "@/lib/image-upload";
import { refreshSite } from "@/lib/refresh-site";
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

  if (!error && parsed.data.published === "true") {
    // Live games are never "Pending".
    await createSecretClient()
      .from("games")
      .update({ needs_review: false })
      .eq("id", parsed.data.gameId);
  }

  // Refresh in every case so a stale list corrects itself.
  revalidatePath("/games");
  revalidatePath("/overview");
  await refreshSite(["games"]);

  if (error) {
    console.error("set_game_published failed:", error.message);
    throw new Error("Could not update the game.");
  }
}

// ---------- Edit a game (title, description, SEO fields, thumbnail) ----------

export type EditGameState = { error: string | null };

function text(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

const editSchema = z.object({
  gameId: z.uuid(),
  title: z.string().trim().min(1, "Title is required.").max(100, "Title is too long (100 max)."),
  description: z.string().trim().max(2000, "Description is too long (2000 max)."),
  metaTitle: z.string().trim().max(70, "SEO title is too long (70 max)."),
  metaDescription: z.string().trim().max(160, "SEO description is too long (160 max)."),
  categoryId: z.uuid("Choose a category."),
  thumbFocusX: z.coerce.number().int().min(0).max(100),
  tags: z.string(),
  thumbnailUrl: z
    .string()
    .trim()
    .refine((value) => {
      if (value === "") return true;
      try {
        return new URL(value).protocol === "https:";
      } catch {
        return false;
      }
    }, "The thumbnail link must start with https://"),
});

// "Word Puzzle, kids" -> ["word-puzzle", "kids"]. Same shape the site uses for tags.
function parseTags(raw: string): { tags: string[] } | { error: string } {
  const tags = [
    ...new Set(
      raw
        .split(",")
        .map((tag) => tag.trim().toLowerCase().replace(/\s+/g, "-"))
        .filter(Boolean),
    ),
  ];
  if (tags.length > 15) return { error: "Use at most 15 tags." };
  if (tags.some((tag) => !/^[a-z0-9-]{1,30}$/.test(tag))) {
    return { error: "Tags can only use letters, numbers and dashes (30 characters max each)." };
  }
  return { tags };
}

export async function updateGame(_prev: EditGameState, formData: FormData): Promise<EditGameState> {
  const admin = await requireAdmin();

  const parsed = editSchema.safeParse({
    gameId: text(formData, "gameId"),
    title: text(formData, "title"),
    description: text(formData, "description"),
    metaTitle: text(formData, "metaTitle"),
    metaDescription: text(formData, "metaDescription"),
    categoryId: text(formData, "categoryId"),
    thumbFocusX: text(formData, "thumbFocusX") || "50",
    tags: text(formData, "tags"),
    thumbnailUrl: text(formData, "thumbnailUrl"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const input = parsed.data;
  const tagResult = parseTags(input.tags);
  if ("error" in tagResult) return { error: tagResult.error };
  const supabase = createSecretClient();

  const { data: current, error: loadError } = await supabase
    .from("games")
    .select("thumbnail_url")
    .eq("id", input.gameId)
    .maybeSingle();
  if (loadError || !current) return { error: "That game was not found." };

  const spec = thumbnailImage(input.gameId);
  const file = formData.get("thumbnail");

  // A new file wins over a pasted link. No file and no link (or the same link) keeps the thumbnail.
  let newThumbnail: string | null = null;
  let uploaded = false;
  try {
    if (isRealFile(file)) {
      newThumbnail = await processAndUpload(file, spec);
      uploaded = true;
    } else if (input.thumbnailUrl && input.thumbnailUrl !== current.thumbnail_url) {
      newThumbnail = input.thumbnailUrl;
    }
  } catch (error) {
    if (error instanceof UserError) return { error: error.message };
    console.error("thumbnail failed:", error);
    return { error: "Could not process the image." };
  }

  const { error } = await supabase.rpc("update_game_details", {
    p_game_id: input.gameId,
    p_title: input.title,
    p_description: input.description,
    p_meta_title: input.metaTitle,
    p_meta_description: input.metaDescription,
    p_thumbnail_url: newThumbnail,
    p_category_id: input.categoryId,
    p_tags: tagResult.tags,
    p_admin_id: admin.id,
  });

  if (error) {
    console.error("update_game_details failed:", error.message);
    if (uploaded && newThumbnail) await removeUploadedImage(spec, newThumbnail);
    return { error: "Could not save the game." };
  }

  // Not part of the audited edit: it only changes how the card crops the image.
  const { error: focusError } = await supabase
    .from("games")
    .update({ thumb_focus_x: input.thumbFocusX })
    .eq("id", input.gameId);
  if (focusError) console.error("thumb_focus_x update failed:", focusError.message);

  // Saving an edit takes a game out of Pending (it is then under Uploaded).
  const { error: reviewError } = await supabase
    .from("games")
    .update({ needs_review: false })
    .eq("id", input.gameId);
  if (reviewError) console.error("needs_review update failed:", reviewError.message);

  if (newThumbnail && newThumbnail !== current.thumbnail_url) {
    await removeUploadedImage(spec, current.thumbnail_url as string);
  }

  revalidatePath("/games");
  await refreshSite(["games"]);
  redirect("/games");
}
