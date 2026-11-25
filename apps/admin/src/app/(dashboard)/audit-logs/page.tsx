import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { createSecretClient } from "@/lib/supabase/secret";

export const metadata: Metadata = { title: "Audit log" };

type LogRow = {
  id: string;
  admin_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, unknown>;
  created_at: string;
};

export default async function AuditLogsPage() {
  await requireAdmin();
  const supabase = createSecretClient();

  const { data, error } = await supabase
    .from("audit_logs")
    .select("id, admin_id, action, entity_type, entity_id, details, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) throw new Error(`audit log failed: ${error.message}`);
  const logs = (data ?? []) as LogRow[];

  // Show admin emails instead of raw ids. Only look up the admins that appear in this log.
  const adminIds = [...new Set(logs.map((l) => l.admin_id).filter((id): id is string => !!id))];
  const emails = new Map<string, string>();
  await Promise.all(
    adminIds.map(async (id) => {
      const { data: result } = await supabase.auth.admin.getUserById(id);
      if (result.user?.email) emails.set(id, result.user.email);
    }),
  );

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Audit log</h1>

      {logs.length === 0 ? (
        <p className="text-muted">Nothing recorded yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface text-muted">
              <tr>
                <th className="px-3 py-2">When</th>
                <th className="px-3 py-2">Admin</th>
                <th className="px-3 py-2">Action</th>
                <th className="px-3 py-2">Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-t border-border align-top">
                  <td className="whitespace-nowrap px-3 py-2">
                    {new Date(log.created_at).toLocaleString("en-GB")}
                  </td>
                  <td className="px-3 py-2">
                    {log.admin_id ? (emails.get(log.admin_id) ?? log.admin_id) : "-"}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 font-medium">{log.action}</td>
                  <td className="break-all px-3 py-2 text-muted">{JSON.stringify(log.details)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
