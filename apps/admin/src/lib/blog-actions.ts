"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { createSecretClient } from "@/lib/supabase/secret";

export type BlogFormState = { error: string | null };

const MAX_IMAGE_BYTES = 500 * 1024;
const IMAGE_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

const schema = z.object({
  title: z.string().trim().min(1, "Title is required").max(120, "Title is too long (120 max)"),
  slug: z.string().trim().max(80),
  excerpt: z.string().trim().max(300, "Summary is too long (300 max)"),
  content: z.string().max(100_000, "Article is too long"),
  published: z.boolean(),
});

function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

// "My First Post!" -> "my-first-post". Letters and numbers a-z only.
function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

async function audit(adminId: string, action: string, postId: string | null, title: string) {
  const { error } = await createSecretClient().from("audit_logs").insert({
    admin_id: adminId,
    action,
    entity_type: "blog",
    entity_id: postId,
    details: { title },
  });
  if (error) console.error("blog audit failed:", error.message);
}

// Public URL -> file name inside the "blog" bucket (null if it is not one of our files).
function storagePath(url: string | null): string | null {
  if (!url) return null;
  const marker = "/storage/v1/object/public/blog/";
  const index = url.indexOf(marker);
  if (index === -1) return null;
  try {
    const path = decodeURIComponent(url.slice(index + marker.length).split("?")[0]);
    return path && !path.includes("/") ? path : null;
  } catch {
    return null;
  }
}

// A failure is only logged: the post itself is already saved.
async function removeImage(url: string | null) {
  const path = storagePath(url);
  if (!path) return;
  const { error } = await createSecretClient().storage.from("blog").remove([path]);
  if (error) console.error("blog image delete failed:", error.message);
}

export async function saveBlog(
  _previous: BlogFormState,
  formData: FormData,
): Promise<BlogFormState> {
  const admin = await requireAdmin();

  const parsed = schema.safeParse({
    title: text(formData, "title"),
    slug: text(formData, "slug"),
    excerpt: text(formData, "excerpt"),
    content: text(formData, "content"),
    published: formData.get("published") === "on",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the form." };
  const values = parsed.data;

  const slug = slugify(values.slug || values.title);
  if (!slug)
    return {
      error: "Web address (slug) needs English letters or numbers. Type one in the slug box.",
    };
  if (values.published && !values.content.trim())
    return { error: "Write the article before publishing." };

  const supabase = createSecretClient();
  const idValue = text(formData, "id");
  const id = z.uuid().safeParse(idValue).success ? idValue : null;

  let existingImage: string | null = null;
  let existingPublishedAt: string | null = null;
  if (id) {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("cover_url, published_at")
      .eq("id", id)
      .maybeSingle();
    if (error) return { error: `Could not load the post: ${error.message}` };
    if (!data) return { error: "This post no longer exists." };
    const row = data as { cover_url: string | null; published_at: string | null };
    existingImage = row.cover_url;
    existingPublishedAt = row.published_at;
  }

  let imageUrl: string | null = null;
  const file = formData.get("cover");
  if (file instanceof File && file.size > 0) {
    const extension = IMAGE_TYPES[file.type];
    if (!extension) return { error: "Cover must be PNG, JPG or WebP." };
    if (file.size > MAX_IMAGE_BYTES)
      return { error: "Cover is bigger than 500 KB. Please compress it." };

    const path = `${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from("blog")
      .upload(path, file, { contentType: file.type, cacheControl: "31536000" });
    if (uploadError) return { error: `Cover upload failed: ${uploadError.message}` };
    imageUrl = supabase.storage.from("blog").getPublicUrl(path).data.publicUrl;
  }

  const removeCover = !imageUrl && formData.get("remove_cover") === "on";

  const now = new Date().toISOString();
  const row = {
    title: values.title,
    slug,
    excerpt: values.excerpt,
    content: values.content,
    status: values.published ? "published" : "draft",
    // The first publish date is kept, even if the post is switched off and on again.
    published_at: values.published ? (existingPublishedAt ?? now) : existingPublishedAt,
    ...(imageUrl ? { cover_url: imageUrl } : removeCover ? { cover_url: null } : {}),
    updated_at: now,
  };

  const duplicate = "Another post already uses this slug. Change it.";

  if (id) {
    const { error } = await supabase.from("blog_posts").update(row).eq("id", id);
    if (error) {
      await removeImage(imageUrl);
      return { error: error.code === "23505" ? duplicate : `Could not save: ${error.message}` };
    }
    if ((imageUrl || removeCover) && existingImage && existingImage !== imageUrl) {
      await removeImage(existingImage);
    }
    await audit(admin.id, "blog.edit", id, values.title);
  } else {
    const { data, error } = await supabase.from("blog_posts").insert(row).select("id").single();
    if (error) {
      await removeImage(imageUrl);
      return { error: error.code === "23505" ? duplicate : `Could not save: ${error.message}` };
    }
    await audit(admin.id, "blog.create", (data as { id: string }).id, values.title);
  }

  revalidatePath("/blog");
  redirect("/blog");
}

export async function toggleBlog(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const id = text(formData, "id");
  if (!z.uuid().safeParse(id).success) return;
  const publish = text(formData, "next") === "1";

  const supabase = createSecretClient();
  const { data: current, error: loadError } = await supabase
    .from("blog_posts")
    .select("content, published_at")
    .eq("id", id)
    .maybeSingle();
  if (loadError) throw new Error(`blog toggle failed: ${loadError.message}`);
  if (!current) return;
  const post = current as { content: string; published_at: string | null };
  if (publish && !post.content.trim()) return; // an empty post cannot go live

  const { data, error } = await supabase
    .from("blog_posts")
    .update({
      status: publish ? "published" : "draft",
      published_at: publish ? (post.published_at ?? new Date().toISOString()) : post.published_at,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("title")
    .maybeSingle();
  if (error) throw new Error(`blog toggle failed: ${error.message}`);

  await audit(
    admin.id,
    publish ? "blog.publish" : "blog.unpublish",
    id,
    (data as { title: string } | null)?.title ?? "",
  );
  revalidatePath("/blog");
}

export async function deleteBlog(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const id = text(formData, "id");
  if (!z.uuid().safeParse(id).success) return;

  const supabase = createSecretClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .delete()
    .eq("id", id)
    .select("title, cover_url")
    .maybeSingle();
  if (error) throw new Error(`blog delete failed: ${error.message}`);

  const deleted = data as { title: string; cover_url: string | null } | null;
  await removeImage(deleted?.cover_url ?? null);

  await audit(admin.id, "blog.delete", id, deleted?.title ?? "");
  revalidatePath("/blog");
}
