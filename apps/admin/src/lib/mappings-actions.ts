"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { normalizeProviderCategory, normalizeTag } from "@/lib/normalize";
import { createSecretClient } from "@/lib/supabase/secret";

const providerSlug = z
  .string()
  .regex(/^[a-z0-9-]+$/)
  .min(2)
  .max(40);
const tagSlug = z
  .string()
  .regex(/^[a-z0-9-]+$/)
  .min(1)
  .max(60);

async function audit(adminId: string, action: string, entityType: string, details: object) {
  const { error } = await createSecretClient().from("audit_logs").insert({
    admin_id: adminId,
    action,
    entity_type: entityType,
    details,
  });
  if (error) {
    console.error("audit log failed:", error.message);
    throw new Error("The change was saved, but the audit log entry failed.");
  }
}

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "");
}

export async function addCategoryMapping(formData: FormData) {
  // First line of every Server Action.
  const admin = await requireAdmin();

  const parsed = z
    .object({
      provider: providerSlug,
      providerCategory: z.string().min(1).max(100),
      categoryId: z.uuid(),
    })
    .safeParse({
      provider: text(formData, "provider"),
      providerCategory: normalizeProviderCategory(text(formData, "providerCategory")),
      categoryId: text(formData, "categoryId"),
    });
  if (!parsed.success) throw new Error("Invalid request.");

  const { provider, providerCategory, categoryId } = parsed.data;
  const supabase = createSecretClient();

  const { error } = await supabase
    .from("category_mappings")
    .upsert(
      { provider, provider_category: providerCategory, category_id: categoryId },
      { onConflict: "provider,provider_category" },
    );
  if (error) {
    console.error("addCategoryMapping failed:", error.message);
    throw new Error("Could not save the category mapping.");
  }

  // Fill the empty category of pending games that use this provider category.
  const { data: applied, error: applyError } = await supabase.rpc("apply_category_mappings", {
    p_provider: provider,
  });
  if (applyError) {
    console.error("apply_category_mappings failed:", applyError.message);
    throw new Error("The mapping was saved, but pending games were not updated.");
  }

  await audit(admin.id, "category_mapping.add", "category_mapping", {
    provider,
    provider_category: providerCategory,
    category_id: categoryId,
    pending_games_updated: applied,
  });

  revalidatePath("/categories");
  revalidatePath("/moderation");
}

export async function deleteCategoryMapping(formData: FormData) {
  const admin = await requireAdmin();

  const parsed = z
    .object({ provider: providerSlug, providerCategory: z.string().min(1).max(100) })
    .safeParse({
      provider: text(formData, "provider"),
      providerCategory: text(formData, "providerCategory"),
    });
  if (!parsed.success) throw new Error("Invalid request.");

  const { provider, providerCategory } = parsed.data;

  const { error } = await createSecretClient()
    .from("category_mappings")
    .delete()
    .eq("provider", provider)
    .eq("provider_category", providerCategory);
  if (error) {
    console.error("deleteCategoryMapping failed:", error.message);
    throw new Error("Could not delete the category mapping.");
  }

  await audit(admin.id, "category_mapping.delete", "category_mapping", {
    provider,
    provider_category: providerCategory,
  });

  revalidatePath("/categories");
}

export async function addTagMapping(formData: FormData) {
  const admin = await requireAdmin();

  const remove = formData.get("remove") === "on";
  const parsed = z
    .object({
      provider: providerSlug,
      providerTag: tagSlug,
      ourTag: tagSlug.nullable(),
    })
    .safeParse({
      provider: text(formData, "provider"),
      providerTag: normalizeTag(text(formData, "providerTag")),
      ourTag: remove ? null : normalizeTag(text(formData, "ourTag")),
    });
  if (!parsed.success) throw new Error("Invalid request.");

  const { provider, providerTag, ourTag } = parsed.data;

  const { error } = await createSecretClient()
    .from("tag_mappings")
    .upsert(
      { provider, provider_tag: providerTag, our_tag: ourTag },
      { onConflict: "provider,provider_tag" },
    );
  if (error) {
    console.error("addTagMapping failed:", error.message);
    throw new Error("Could not save the tag mapping.");
  }

  await audit(admin.id, "tag_mapping.add", "tag_mapping", {
    provider,
    provider_tag: providerTag,
    our_tag: ourTag,
  });

  revalidatePath("/tags");
}

export async function deleteTagMapping(formData: FormData) {
  const admin = await requireAdmin();

  const parsed = z.object({ provider: providerSlug, providerTag: tagSlug }).safeParse({
    provider: text(formData, "provider"),
    providerTag: text(formData, "providerTag"),
  });
  if (!parsed.success) throw new Error("Invalid request.");

  const { provider, providerTag } = parsed.data;

  const { error } = await createSecretClient()
    .from("tag_mappings")
    .delete()
    .eq("provider", provider)
    .eq("provider_tag", providerTag);
  if (error) {
    console.error("deleteTagMapping failed:", error.message);
    throw new Error("Could not delete the tag mapping.");
  }

  await audit(admin.id, "tag_mapping.delete", "tag_mapping", {
    provider,
    provider_tag: providerTag,
  });

  revalidatePath("/tags");
}
