"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { runAutoApprove } from "@/lib/auto-approve";

// The "Approve all that pass the rules" button on the Moderation page.
export async function autoApproveValid(): Promise<void> {
  // First line of every Server Action.
  const admin = await requireAdmin();

  const { approved, failed } = await runAutoApprove(admin.id);
  redirect(`/moderation?status=pending&auto=${approved}&failed=${failed}`);
}
