import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { AddProviderForm } from "./AddProviderForm";
import { disconnectProvider, reconnectProvider, updateProvider } from "@/lib/providers-actions";
import { createSecretClient } from "@/lib/supabase/secret";

export const metadata: Metadata = { title: "Providers" };

const LICENSE_OPTIONS = ["unverified", "pending", "approved", "expired"] as const;

type ProviderRow = {
  provider: string;
  display_name: string;
  status: "active" | "disconnected";
  license_status: (typeof LICENSE_OPTIONS)[number];
  terms_url: string | null;
  verified_at: string | null;
  notes: string | null;
  disconnected_at: string | null;
  disconnect_reason: string | null;
};

async function countGames(provider: string, onlyPublished: boolean) {
  const base = createSecretClient()
    .from("games")
    .select("id", { count: "exact", head: true })
    .eq("provider", provider);

  const { count, error } = await (onlyPublished ? base.eq("is_published", true) : base);
  return error ? null : count;
}

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleDateString("en-GB") : "-";
}

const inputClass = "rounded-lg border border-border bg-background px-3 py-2 text-sm";
const buttonClass = "rounded-lg border border-border px-3 py-1.5 text-sm hover:border-brand";

export default async function ProvidersPage() {
  await requireAdmin();

  const { data, error } = await createSecretClient()
    .from("providers")
    .select(
      "provider, display_name, status, license_status, terms_url, verified_at, notes, disconnected_at, disconnect_reason",
    )
    .order("provider");

  if (error) throw new Error(`providers failed: ${error.message}`);
  const providers = (data ?? []) as ProviderRow[];

  const counts = new Map<string, { live: number | null; total: number | null }>();
  await Promise.all(
    providers.map(async (p) => {
      const [live, total] = await Promise.all([
        countGames(p.provider, true),
        countGames(p.provider, false),
      ]);
      counts.set(p.provider, { live, total });
    }),
  );

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Providers</h1>
      <AddProviderForm />

      {providers.length === 0 ? (
        <p className="text-muted">No providers registered.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {providers.map((p) => {
            const count = counts.get(p.provider);

            return (
              <li
                key={p.provider}
                className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-bold">{p.display_name}</h2>
                    <p className="text-sm text-muted">
                      {p.provider} &middot; {count?.live ?? "-"} live / {count?.total ?? "-"} total
                      games
                    </p>
                  </div>
                  <span
                    className={
                      p.status === "active"
                        ? "rounded-full border border-border px-3 py-1 text-sm"
                        : "rounded-full border border-danger px-3 py-1 text-sm text-danger"
                    }
                  >
                    {p.status}
                  </span>
                </div>

                <form action={updateProvider} className="grid gap-3 md:grid-cols-2">
                  <input type="hidden" name="provider" value={p.provider} />

                  <label className="flex flex-col gap-1 text-sm">
                    License status
                    <select
                      name="licenseStatus"
                      defaultValue={p.license_status}
                      className={inputClass}
                    >
                      {LICENSE_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="flex flex-col gap-1 text-sm">
                    Terms URL
                    <input
                      name="termsUrl"
                      type="url"
                      defaultValue={p.terms_url ?? ""}
                      className={inputClass}
                    />
                  </label>

                  <label className="flex flex-col gap-1 text-sm md:col-span-2">
                    Notes
                    <textarea
                      name="notes"
                      rows={3}
                      defaultValue={p.notes ?? ""}
                      className={inputClass}
                    />
                  </label>

                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="verifiedNow" />
                    Mark as verified today (last verified: {formatDate(p.verified_at)})
                  </label>

                  <div className="md:col-span-2">
                    <button type="submit" className={buttonClass}>
                      Save
                    </button>
                  </div>
                </form>

                {p.status === "active" ? (
                  <details className="rounded-xl border border-border p-3">
                    <summary className="cursor-pointer text-sm font-medium text-danger">
                      Disconnect provider...
                    </summary>
                    <form action={disconnectProvider} className="mt-3 flex flex-col gap-3">
                      <input type="hidden" name="provider" value={p.provider} />
                      <p className="text-sm">
                        This unpublishes all {count?.live ?? "the"} live games of this provider
                        immediately and blocks new imports and publishing.
                      </p>
                      <label className="flex flex-col gap-1 text-sm">
                        Reason (optional)
                        <input name="reason" maxLength={500} className={inputClass} />
                      </label>
                      <label className="flex flex-col gap-1 text-sm">
                        Type <strong>{p.provider}</strong> to confirm
                        <input
                          name="confirm"
                          required
                          pattern={p.provider}
                          autoComplete="off"
                          className={inputClass}
                        />
                      </label>
                      <div>
                        <button type="submit" className={buttonClass + " text-danger"}>
                          Disconnect
                        </button>
                      </div>
                    </form>
                  </details>
                ) : (
                  <div className="flex flex-col gap-2 rounded-xl border border-border p-3 text-sm">
                    <p>
                      Disconnected on {formatDate(p.disconnected_at)}
                      {p.disconnect_reason ? `: ${p.disconnect_reason}` : "."}
                    </p>
                    <p className="text-muted">
                      Reconnecting does not republish any games. Publish them one by one.
                    </p>
                    <form action={reconnectProvider}>
                      <input type="hidden" name="provider" value={p.provider} />
                      <button type="submit" className={buttonClass}>
                        Reconnect
                      </button>
                    </form>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
