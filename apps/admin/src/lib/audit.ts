import { createSecretClient } from "@/lib/supabase/secret";

// Best effort: a failed audit entry is logged, it never blocks the admin's change.
export async function writeAudit(
  adminId: string,
  action: string,
  entityType: string,
  entityId: string | null,
  details: Record<string, unknown> = {},
) {
  const { error } = await createSecretClient().from("audit_logs").insert({
    admin_id: adminId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    details,
  });
  if (error) console.error("audit log failed:", error.message);
}
