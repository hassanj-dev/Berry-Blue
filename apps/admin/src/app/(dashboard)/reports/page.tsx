import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { createSecretClient } from "@/lib/supabase/secret";

export const metadata: Metadata = { title: "Reports" };

const REASONS: Record<string, string> = {
  not_loading: "Game does not load",
  broken_controls: "Controls do not work",
  inappropriate: "Inappropriate content",
  other: "Other",
};

type ReportRow = {
  id: string;
  reason: string;
  details: string | null;
  created_at: string;
  games: { title: string; slug: string; is_published: boolean } | null;
};

export default async function ReportsPage() {
  await requireAdmin();

  const { data, count, error } = await createSecretClient()
    .from("game_reports")
    .select("id, reason, details, created_at, games(title, slug, is_published)", { count: "exact" })
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) throw new Error(`reports list failed: ${error.message}`);
  const reports = (data ?? []) as unknown as ReportRow[];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Reports ({count ?? reports.length})</h1>

      {reports.length === 0 ? (
        <p className="text-muted">No reports yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface text-muted">
              <tr>
                <th className="px-3 py-2">When</th>
                <th className="px-3 py-2">Game</th>
                <th className="px-3 py-2">Reason</th>
                <th className="px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id} className="border-t border-border align-top">
                  <td className="whitespace-nowrap px-3 py-2">
                    {new Date(report.created_at).toLocaleString("en-GB")}
                  </td>
                  <td className="px-3 py-2">
                    <span className="font-medium">{report.games?.title ?? "-"}</span>
                    <span className="block text-muted">{report.games?.slug}</span>
                  </td>
                  <td className="px-3 py-2">
                    {REASONS[report.reason] ?? report.reason}
                    {report.details && (
                      <span className="mt-1 block max-w-md whitespace-pre-wrap break-words text-muted">
                        {report.details}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2">{report.games?.is_published ? "Live" : "Hidden"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
