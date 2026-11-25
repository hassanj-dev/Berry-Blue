"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { createSecretClient } from "@/lib/supabase/secret";

const providerSlug = z.string().regex(/^[a-z0-9-]+$/);

const updateSchema = z.object({
  provider: providerSlug,
  licenseStatus: z.enum(["unverified", "pending", "approved", "expired"]),
  termsUrl: z.union([z.literal(""), z.url()]),
  notes: z.string().max(2000),
  verifiedNow: z.boolean(),
});

export async function updateProvider(formData: FormData) {
  // First line of every Server Action.
  const admin = await requireAdmin();

  const parsed = updateSchema.safeParse({
    provider: formData.get("provider"),
    licenseStatus: formData.get("licenseStatus"),
    termsUrl: String(formData.get("termsUrl") ?? "").trim(),
    notes: String(formData.get("notes") ?? "").trim(),
    verifiedNow: formData.get("verifiedNow") === "on",
  });
  if (!parsed.success) throw new Error("Invalid request.");

  const { provider, licenseStatus, termsUrl, notes, verifiedNow } = parsed.data;
  const supabase = createSecretClient();

  const changes: Record<string, unknown> = {
    license_status: licenseStatus,
    terms_url: termsUrl || null,
    notes: notes || null,
  };
  if (verifiedNow) changes.verified_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("providers")
    .update(changes)
    .eq("provider", provider)
    .select("provider");

  if (error || !data || data.length === 0) {
    console.error("updateProvider failed:", error?.message ?? "provider not found");
    throw new Error("Could not update the provider.");
  }

  const { error: auditError } = await supabase.from("audit_logs").insert({
    admin_id: admin.id,
    action: "provider.update",
    entity_type: "provider",
    details: { provider, license_status: licenseStatus, verified_now: verifiedNow },
  });
  if (auditError) {
    console.error("audit log failed:", auditError.message);
    throw new Error("The provider was updated, but the audit log entry failed.");
  }

  revalidatePath("/providers");
}

const disconnectSchema = z.object({
  provider: providerSlug,
  confirm: z.string(),
  reason: z.string().max(500),
});

export async function disconnectProvider(formData: FormData) {
  const admin = await requireAdmin();

  const parsed = disconnectSchema.safeParse({
    provider: formData.get("provider"),
    confirm: String(formData.get("confirm") ?? "").trim(),
    reason: String(formData.get("reason") ?? "").trim(),
  });
  if (!parsed.success || parsed.data.confirm !== parsed.data.provider) {
    throw new Error("The confirmation text does not match the provider name.");
  }

  // One transaction in the database: provider off, its games unpublished, audit log written.
  const { error } = await createSecretClient().rpc("disconnect_provider", {
    p_provider: parsed.data.provider,
    p_admin_id: admin.id,
    p_reason: parsed.data.reason || null,
  });

  revalidatePath("/providers");
  revalidatePath("/games");
  revalidatePath("/overview");

  if (error) {
    console.error("disconnect_provider failed:", error.message);
    throw new Error("Could not disconnect the provider.");
  }
}

export async function reconnectProvider(formData: FormData) {
  const admin = await requireAdmin();

  const parsed = z.object({ provider: providerSlug }).safeParse({
    provider: formData.get("provider"),
  });
  if (!parsed.success) throw new Error("Invalid request.");

  const { error } = await createSecretClient().rpc("reconnect_provider", {
    p_provider: parsed.data.provider,
    p_admin_id: admin.id,
  });

  revalidatePath("/providers");

  if (error) {
    console.error("reconnect_provider failed:", error.message);
    throw new Error("Could not reconnect the provider.");
  }
}
export type CreateProviderState = {
  error: string | null;
  message: string | null;
  values: Record<string, string>;
};

const createSchema = z.object({
  provider: z
    .string()
    .regex(/^[a-z0-9-]+$/)
    .min(2)
    .max(40),
  displayName: z.string().min(1).max(60),
  licenseStatus: z.enum(["unverified", "pending", "approved", "expired"]),
  termsUrl: z.union([z.literal(""), z.url()]),
  notes: z.string().max(2000),
});

export async function createProvider(
  _previous: CreateProviderState,
  formData: FormData,
): Promise<CreateProviderState> {
  // First line of every Server Action.
  const admin = await requireAdmin();

  const values = {
    provider: String(formData.get("provider") ?? "").trim(),
    displayName: String(formData.get("displayName") ?? "").trim(),
    licenseStatus: String(formData.get("licenseStatus") ?? "unverified"),
    termsUrl: String(formData.get("termsUrl") ?? "").trim(),
    notes: String(formData.get("notes") ?? "").trim(),
  };

  const parsed = createSchema.safeParse(values);
  if (!parsed.success) {
    return {
      error:
        "Check the fields. The provider id may only use lowercase letters, numbers and dashes (2-40 characters).",
      message: null,
      values,
    };
  }

  const supabase = createSecretClient();
  const { error } = await supabase.from("providers").insert({
    provider: parsed.data.provider,
    display_name: parsed.data.displayName,
    license_status: parsed.data.licenseStatus,
    terms_url: parsed.data.termsUrl || null,
    notes: parsed.data.notes || null,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "A provider with this id already exists.", message: null, values };
    }
    console.error("createProvider failed:", error.message);
    return { error: "Could not add the provider.", message: null, values };
  }

  const { error: auditError } = await supabase.from("audit_logs").insert({
    admin_id: admin.id,
    action: "provider.create",
    entity_type: "provider",
    details: { provider: parsed.data.provider, license_status: parsed.data.licenseStatus },
  });

  revalidatePath("/providers");

  if (auditError) {
    console.error("audit log failed:", auditError.message);
    return {
      error: "The provider was added, but the audit log entry failed.",
      message: null,
      values: {},
    };
  }

  return { error: null, message: `Provider "${parsed.data.provider}" added.`, values: {} };
}
