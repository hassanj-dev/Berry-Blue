import type { Metadata } from "next";
import Link from "next/link";
import type { AdRow } from "@/components/AdForm";
import { AdRowActions } from "@/components/AdRowActions";
import { requireAdmin } from "@/lib/auth";
import { createSecretClient } from "@/lib/supabase/secret";

export const metadata: Metadata = { title: "Ads Manager" };

function statusOf(ad: AdRow, now: number): { label: string; className: string } {
  if (!ad.active) return { label: "Off", className: "bg-foreground/10 text-muted" };
  if (ad.ends_at && new Date(ad.ends_at).getTime() < now)
    return { label: "Expired", className: "bg-foreground/10 text-muted" };
  if (ad.starts_at && new Date(ad.starts_at).getTime() > now)
    return { label: "Scheduled", className: "bg-amber-500/15 text-amber-400" };
  return { label: "Live", className: "bg-green-500/15 text-green-500" };
}

const pagesLabel = { all: "All pages", home: "Home", game: "Game pages" } as const;
const deviceLabel = { all: "All devices", mobile: "Mobile", desktop: "Desktop" } as const;

export default async function AdsPage() {
  await requireAdmin();

  const { data, error } = await createSecretClient()
    .from("ads")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(`ads list failed: ${error.message}`);

  const ads = (data ?? []) as AdRow[];
  const now = Date.now();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Ads Manager</h1>
        <Link
          href="/ads/new"
          className="flex h-10 items-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground"
        >
          New ad
        </Link>
      </div>

      {ads.length === 0 ? (
        <p className="text-muted">No ads yet. Create your first popup or notification.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface text-muted">
              <tr>
                <th className="px-3 py-2">Ad</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Where</th>
                <th className="px-3 py-2">Timing</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {ads.map((ad) => {
                const status = statusOf(ad, now);
                return (
                  <tr key={ad.id} className="border-t border-border align-middle">
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-3">
                        {ad.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={ad.image_url}
                            alt=""
                            className="size-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="size-12 rounded-lg bg-surface" />
                        )}
                        <span className="font-medium">{ad.name}</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2">
                      {ad.kind === "popup" ? "Popup" : "Notification"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-muted">
                      {pagesLabel[ad.pages]}, {deviceLabel[ad.device]}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-muted">
                      {ad.delay_min}-{ad.delay_max}s, closes{" "}
                      {ad.auto_close ? `${ad.auto_close}s` : "manually"}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/ads/${ad.id}`}
                          className="flex h-8 items-center rounded-lg border border-border px-3 text-xs font-medium hover:bg-foreground/10"
                        >
                          Edit
                        </Link>
                        <AdRowActions id={ad.id} active={ad.active} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
