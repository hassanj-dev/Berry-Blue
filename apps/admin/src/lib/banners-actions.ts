"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { writeAudit } from "@/lib/audit";
import { requireAdmin } from "@/lib/auth";
import {
  BANNER_IMAGE,
  UserError,
  isRealFile,
  processAndUpload,
  removeUploadedImage,
} from "@/lib/image-upload";
import { refreshSite } from "@/lib/refresh-site";
import { createSecretClient } from "@/lib/supabase/secret";

export type FormState = { error: string | null };

function text(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

// A path on the website ("/game/x") or an https address. Not "//host" and not "/\host".
function isValidLink(value: string) {
  if (/^\/(?![/\\])\S*$/.test(value)) return true;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

const schema = z.object({
  id: z.union([z.literal(""), z.uuid()]),
  title: z.string().trim().min(1, "Title is required.").max(100, "Title is too long (100 max)."),
  tag: z.string().trim().max(30, "Tag is too long (30 max)."),
  description: z.string().trim().max(200, "Description is too long (200 max)."),
  gameId: z.union([z.literal(""), z.uuid()]),
  customLink: z.string().trim(),
  sortOrder: z.coerce.number().int("Order must be a whole number.").min(0).max(9999),
});

function firstIssue(error: z.ZodError) {
  return error.issues[0]?.message ?? "Invalid input.";
}

export async function saveBanner(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireAdmin();

  const parsed = schema.safeParse({
    id: text(formData, "id"),
    title: text(formData, "title"),
    tag: text(formData, "tag"),
    description: text(formData, "description"),
    gameId: text(formData, "gameId"),
    customLink: text(formData, "customLink"),
    sortOrder: text(formData, "sortOrder") || "0",
  });
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const input = parsed.data;
  const isActive = formData.get("isActive") === "on";
  const imageField = formData.get("image");
  const supabase = createSecretClient();

  // Where the banner goes: a game from the list, or a custom link.
  let linkUrl: string;
  if (input.gameId) {
    const { data, error } = await supabase
      .from("games")
      .select("slug")
      .eq("id", input.gameId)
      .maybeSingle();
    if (error || !data) return { error: "That game was not found." };
    linkUrl = `/game/${data.slug}`;
  } else if (input.customLink) {
    if (!isValidLink(input.customLink)) {
      return { error: "The link must start with / (a page on the site) or https://" };
    }
    linkUrl = input.customLink;
  } else {
    return { error: "Choose a game or enter a link." };
  }

  const editing = input.id !== "";
  let oldImage: string | null = null;

  if (editing) {
    const { data, error } = await supabase
      .from("home_banners")
      .select("image_url")
      .eq("id", input.id)
      .maybeSingle();
    if (error || !data) return { error: "That banner was not found." };
    oldImage = data.image_url as string;
  } else if (!isRealFile(imageField)) {
    return { error: "Choose an image for the banner." };
  }

  let newImage: string | null = null;
  try {
    if (isRealFile(imageField)) newImage = await processAndUpload(imageField, BANNER_IMAGE);
  } catch (error) {
    if (error instanceof UserError) return { error: error.message };
    console.error("banner image failed:", error);
    return { error: "Could not process the image." };
  }

  const row = {
    title: input.title,
    tag: input.tag || null,
    description: input.description || null,
    link_url: linkUrl,
    sort_order: input.sortOrder,
    is_active: isActive,
    ...(newImage ? { image_url: newImage } : {}),
  };

  let bannerId = input.id;
  if (editing) {
    const { error } = await supabase.from("home_banners").update(row).eq("id", input.id);
    if (error) {
      console.error("banner update failed:", error.message);
      if (newImage) await removeUploadedImage(BANNER_IMAGE, newImage);
      return { error: "Could not save the banner." };
    }
  } else {
    const { data, error } = await supabase
      .from("home_banners")
      .insert({ ...row, image_url: newImage })
      .select("id")
      .single();
    if (error || !data) {
      console.error("banner insert failed:", error?.message);
      if (newImage) await removeUploadedImage(BANNER_IMAGE, newImage);
      return { error: "Could not save the banner." };
    }
    bannerId = data.id as string;
  }

  // The old file is only removed after the new one is saved, and only if no other banner uses it.
  if (editing && newImage && oldImage && oldImage !== newImage) {
    const { count } = await supabase
      .from("home_banners")
      .select("id", { count: "exact", head: true })
      .eq("image_url", oldImage);
    if (!count) await removeUploadedImage(BANNER_IMAGE, oldImage);
  }

  await writeAudit(admin.id, editing ? "banner.edit" : "banner.create", "banner", bannerId, {
    title: input.title,
  });

  revalidatePath("/homepage");
  await refreshSite(["banners"]);
  redirect("/homepage");
}

const idSchema = z.object({ bannerId: z.uuid() });

export async function setBannerActive(formData: FormData) {
  const admin = await requireAdmin();

  const parsed = idSchema.safeParse({ bannerId: formData.get("bannerId") });
  const active = formData.get("active") === "true";
  if (!parsed.success) throw new Error("Invalid request.");

  const { error } = await createSecretClient()
    .from("home_banners")
    .update({ is_active: active })
    .eq("id", parsed.data.bannerId);

  revalidatePath("/homepage");
  await refreshSite(["banners"]);
  if (error) {
    console.error("banner toggle failed:", error.message);
    throw new Error("Could not update the banner.");
  }

  await writeAudit(
    admin.id,
    active ? "banner.show" : "banner.hide",
    "banner",
    parsed.data.bannerId,
  );
}

export async function deleteBanner(formData: FormData) {
  const admin = await requireAdmin();

  const parsed = idSchema.safeParse({ bannerId: formData.get("bannerId") });
  if (!parsed.success) throw new Error("Invalid request.");

  const supabase = createSecretClient();
  const { data: banner } = await supabase
    .from("home_banners")
    .select("image_url, title")
    .eq("id", parsed.data.bannerId)
    .maybeSingle();

  const { error } = await supabase.from("home_banners").delete().eq("id", parsed.data.bannerId);
  revalidatePath("/homepage");
  await refreshSite(["banners"]);
  if (error) {
    console.error("banner delete failed:", error.message);
    throw new Error("Could not delete the banner.");
  }

  if (banner?.image_url) {
    const { count } = await supabase
      .from("home_banners")
      .select("id", { count: "exact", head: true })
      .eq("image_url", banner.image_url);
    if (!count) await removeUploadedImage(BANNER_IMAGE, banner.image_url as string);
  }

  await writeAudit(admin.id, "banner.delete", "banner", parsed.data.bannerId, {
    title: banner?.title ?? null,
  });
}
