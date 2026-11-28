"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { createSecretClient } from "@/lib/supabase/secret";

export type AdFormState = { error: string | null };

const MAX_IMAGE_BYTES = 500 * 1024;
const IMAGE_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

// Only web links and site paths: "javascript:" and similar are refused.
const linkSchema = z
  .string()
  .trim()
  .refine((value) => /^https?:\/\//i.test(value) || value.startsWith("/"), {
    message: "Link must start with https://, http:// or /",
  });

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
  kind: z.enum(["popup", "notification"]),
  mode: z.enum(["image", "layout"]),
  title: z.string().trim().max(80),
  body: z.string().trim().max(200),
  button_text: z.string().trim().max(30),
  link_url: linkSchema,
  show_countdown: z.boolean(),
  pages: z.enum(["all", "home", "game"]),
  device: z.enum(["all", "mobile", "desktop"]),
  delay_min: z.coerce.number().int().min(0).max(600),
  delay_max: z.coerce.number().int().min(0).max(600),
  auto_close: z.coerce.number().int().min(0).max(120),
  frequency: z.enum(["visit", "daily", "once", "days", "hours"]),
  repeat_days: z.coerce.number().int().min(1).max(365),
  repeat_hours: z.coerce.number().int().min(1).max(720),
  rotation: z.enum(["shuffle", "priority"]),
  weight: z.coerce.number().int().min(1).max(10),
  active: z.boolean(),
});

function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function dateOrNull(value: string): string | null | undefined {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

async function audit(adminId: string, action: string, adId: string | null, name: string) {
  const { error } = await createSecretClient()
    .from("audit_logs")
    .insert({ admin_id: adminId, action, entity_type: "ad", entity_id: adId, details: { name } });
  if (error) console.error("ad audit failed:", error.message);
}

// Public URL -> file name inside the "ads" bucket (null if it is not one of our files).
function storagePath(url: string | null): string | null {
  if (!url) return null;
  const marker = "/storage/v1/object/public/ads/";
  const index = url.indexOf(marker);
  if (index === -1) return null;
  try {
    const path = decodeURIComponent(url.slice(index + marker.length).split("?")[0]);
    return path && !path.includes("/") ? path : null;
  } catch {
    return null;
  }
}

// Deletes an ad image from storage. A failure is only logged: the ad itself is already saved.
async function removeImage(url: string | null) {
  const path = storagePath(url);
  if (!path) return;
  const { error } = await createSecretClient().storage.from("ads").remove([path]);
  if (error) console.error("ad image delete failed:", error.message);
}

export async function saveAd(_previous: AdFormState, formData: FormData): Promise<AdFormState> {
  const admin = await requireAdmin();

  const parsed = schema.safeParse({
    name: text(formData, "name"),
    kind: text(formData, "kind"),
    mode: text(formData, "mode"),
    title: text(formData, "title"),
    body: text(formData, "body"),
    button_text: text(formData, "button_text"),
    link_url: text(formData, "link_url"),
    show_countdown: formData.get("show_countdown") === "on",
    pages: text(formData, "pages"),
    device: text(formData, "device"),
    delay_min: text(formData, "delay_min"),
    delay_max: text(formData, "delay_max"),
    auto_close: text(formData, "auto_close"),
    frequency: text(formData, "frequency"),
    repeat_days: text(formData, "repeat_days") || "3",
    repeat_hours: text(formData, "repeat_hours") || "6",
    rotation: text(formData, "rotation") || "shuffle",
    weight: text(formData, "weight") || "1",
    active: formData.get("active") === "on",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the form." };
  const values = parsed.data;

  if (values.delay_min > values.delay_max) {
    return { error: "Minimum delay cannot be bigger than maximum delay." };
  }
  if (values.mode === "layout" && (!values.title || !values.button_text)) {
    return { error: "Title and button text are required for the layout style." };
  }

  const startsAt = dateOrNull(text(formData, "starts_at"));
  const endsAt = dateOrNull(text(formData, "ends_at"));
  if (startsAt === undefined || endsAt === undefined) return { error: "Invalid date." };
  if (startsAt && endsAt && endsAt <= startsAt)
    return { error: "End date must be after start date." };
  if (values.show_countdown && !endsAt) return { error: "Countdown needs an end date." };

  const supabase = createSecretClient();
  const idValue = text(formData, "id");
  const id = z.uuid().safeParse(idValue).success ? idValue : null;

  let existingImage: string | null = null;
  if (id) {
    const { data, error } = await supabase
      .from("ads")
      .select("image_url")
      .eq("id", id)
      .maybeSingle();
    if (error) return { error: `Could not load the ad: ${error.message}` };
    if (!data) return { error: "This ad no longer exists." };
    existingImage = (data as { image_url: string | null }).image_url;
  }

  let imageUrl: string | null = null;
  const file = formData.get("image");
  if (file instanceof File && file.size > 0) {
    const extension = IMAGE_TYPES[file.type];
    if (!extension) return { error: "Image must be PNG, JPG or WebP." };
    if (file.size > MAX_IMAGE_BYTES) return { error: "Image is bigger than 500 KB." };

    const path = `${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from("ads")
      .upload(path, file, { contentType: file.type, cacheControl: "31536000" });
    if (uploadError) return { error: `Image upload failed: ${uploadError.message}` };
    imageUrl = supabase.storage.from("ads").getPublicUrl(path).data.publicUrl;
  }

  if (values.mode === "image" && !imageUrl && !existingImage) {
    return { error: "Upload the ad image." };
  }

  const row = {
    name: values.name,
    kind: values.kind,
    mode: values.mode,
    title: values.title || null,
    body: values.body || null,
    button_text: values.button_text || null,
    link_url: values.link_url,
    show_countdown: values.show_countdown,
    pages: values.pages,
    device: values.device,
    delay_min: values.delay_min,
    delay_max: values.delay_max,
    auto_close: values.auto_close,
    frequency: values.frequency,
    repeat_days: values.repeat_days,
    repeat_hours: values.repeat_hours,
    rotation: values.rotation,
    weight: values.weight,
    starts_at: startsAt,
    ends_at: endsAt,
    active: values.active,
    ...(imageUrl ? { image_url: imageUrl } : {}),
  };

  if (id) {
    const { error } = await supabase
      .from("ads")
      .update({ ...row, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) {
      // Saving failed: the new image was never used, so do not keep it.
      await removeImage(imageUrl);
      return { error: `Could not save: ${error.message}` };
    }
    // Saved with a new image: the old one is no longer needed.
    if (imageUrl && existingImage && existingImage !== imageUrl) await removeImage(existingImage);
    await audit(admin.id, "ad.edit", id, values.name);
  } else {
    const { data, error } = await supabase.from("ads").insert(row).select("id").single();
    if (error) {
      await removeImage(imageUrl);
      return { error: `Could not save: ${error.message}` };
    }
    await audit(admin.id, "ad.create", (data as { id: string }).id, values.name);
  }

  revalidatePath("/ads");
  redirect("/ads");
}

export async function toggleAd(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const id = text(formData, "id");
  if (!z.uuid().safeParse(id).success) return;
  const active = text(formData, "next") === "1";

  const supabase = createSecretClient();
  const { data, error } = await supabase
    .from("ads")
    .update({ active, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("name")
    .maybeSingle();
  if (error) throw new Error(`ad toggle failed: ${error.message}`);

  await audit(
    admin.id,
    active ? "ad.on" : "ad.off",
    id,
    (data as { name: string } | null)?.name ?? "",
  );
  revalidatePath("/ads");
}

export async function deleteAd(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const id = text(formData, "id");
  if (!z.uuid().safeParse(id).success) return;

  const supabase = createSecretClient();
  const { data, error } = await supabase
    .from("ads")
    .delete()
    .eq("id", id)
    .select("name, image_url")
    .maybeSingle();
  if (error) throw new Error(`ad delete failed: ${error.message}`);

  const deleted = data as { name: string; image_url: string | null } | null;
  // The ad is gone, so its image can go too.
  await removeImage(deleted?.image_url ?? null);

  await audit(admin.id, "ad.delete", id, deleted?.name ?? "");
  revalidatePath("/ads");
}
