import type { Metadata } from "next";
import Link from "next/link";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { liveGameKeys } from "@/lib/diff";
import { formatValidationErrors, listStaged, STATUSES } from "@/lib/moderation";

export const metadata: Metadata = { title: "Moderation" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

// Bad values in the URL fall back to "pending" instead of crashing.
const statusSchema = z.enum(STATUSES).catch("pending");

const TAB_LABELS = {
  pending: "Pending",
  invalid: "Invalid",
  rejected: "Rejected",
  approved: "Approved",
} as const;

const tabClass =
  "inline-flex min-h-10 items-center rounded-xl border border-border px-4 text-sm font-medium ";

export default async function ModerationPage({ searchParams }: { searchParams: SearchParams }) {
  await requireAdmin();

  const status = statusSchema.parse((await searchParams).status);
  const games = await listStaged(status);
  const liveKeys = status === "pending" ? await liveGameKeys(games) : new Set<string>();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Moderation</h1>

      <nav aria-label="Filter by status">
        <ul className="flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <li key={s}>
              <Link
                href={"/moderation?status=" + s}
                aria-current={s === status ? "true" : undefined}
                className={
                  tabClass + (s === status ? "bg-brand text-brand-foreground" : "bg-surface")
                }
              >
                {TAB_LABELS[s]}
              </Link>
            </li>
          ))}
          <li>
            <Link href="/moderation/missing" className={tabClass + "bg-surface"}>
              Missing from feed
            </Link>
          </li>
        </ul>
      </nav>

      {games.length === 0 ? (
        <p className="text-muted">No {TAB_LABELS[status].toLowerCase()} games.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {games.map((game) => {
            const errors = formatValidationErrors(game.validation_errors);
            const isUpdate = liveKeys.has(game.provider + ":" + game.provider_game_id);

            return (
              <li key={game.id}>
                <Link
                  href={"/moderation/" + game.id}
                  className="flex flex-col gap-1 rounded-2xl border border-border bg-surface p-4 hover:border-brand"
                >
                  <span className="flex flex-wrap items-center gap-2 font-semibold">
                    {game.title ?? "(no title)"}
                    {status === "pending" && (
                      <span className="rounded-full border border-border px-2 py-0.5 text-xs font-medium">
                        {isUpdate ? "Update" : "New"}
                      </span>
                    )}
                  </span>
                  <span className="text-sm text-muted">
                    {game.provider} &middot; {game.provider_category ?? "no category"} &middot;{" "}
                    {new Date(game.created_at).toLocaleDateString("en-GB")}
                  </span>
                  {errors.length > 0 && (
                    <ul className="mt-1 list-disc pl-5 text-sm text-danger">
                      {errors.slice(0, 3).map((e, i) => (
                        <li key={i}>{e}</li>
                      ))}
                      {errors.length > 3 && <li>and {errors.length - 3} more</li>}
                    </ul>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
