import type { Metadata } from "next";
import Link from "next/link";
import { z } from "zod";
import { Pagination, paginate } from "@/components/ui/Pagination";
import { requireAdmin } from "@/lib/auth";
import { formatValidationErrors } from "@/lib/moderation";
import { autoApproveValid } from "@/lib/moderation-auto";
import { listAllStaged } from "@/lib/moderation-lists";
import { checkRules, isSexual, loadRuleContext, RULE_DESCRIPTIONS } from "@/lib/moderation-rules";

export const metadata: Metadata = { title: "Moderation" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const TABS = ["pending", "sexual", "approved", "rejected", "invalid"] as const;
type Tab = (typeof TABS)[number];

// Bad values in the URL fall back to "pending" instead of crashing.
const tabSchema = z.enum(TABS).catch("pending");

const TAB_LABELS: Record<Tab, string> = {
  pending: "Pending",
  sexual: "Sexual",
  approved: "Approved",
  rejected: "Rejected",
  invalid: "Invalid",
};

const TAB_HELP: Record<Tab, string> = {
  pending: "New games waiting for you. Games with sexual words are in the Sexual tab.",
  sexual:
    "Games with a sexual word in the title, description, tags or category. They never go live by themselves.",
  approved: "Games that passed (by the rules or by you).",
  rejected: "Games rejected for other reasons.",
  invalid: "Games with a broken link or another error from the import.",
};

const tabClass =
  "inline-flex min-h-10 items-center gap-2 rounded-xl border border-border px-4 text-sm font-medium ";

function first(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

export default async function ModerationPage({ searchParams }: { searchParams: SearchParams }) {
  await requireAdmin();

  const params = await searchParams;
  const tab = tabSchema.parse(params.status);
  const query = first(params.q).trim();
  const needle = query.toLowerCase();

  const [pendingAll, rejectedAll, approvedAll, invalidAll] = await Promise.all([
    listAllStaged("pending"),
    listAllStaged("rejected"),
    listAllStaged("approved"),
    listAllStaged("invalid"),
  ]);

  // A game with a sexual word shows only in the Sexual tab (pending or rejected ones).
  const lists: Record<Tab, typeof pendingAll> = {
    pending: pendingAll.filter((g) => !isSexual(g)),
    sexual: [...pendingAll, ...rejectedAll]
      .filter(isSexual)
      .sort((a, b) => b.created_at.localeCompare(a.created_at)),
    approved: approvedAll,
    rejected: rejectedAll.filter((g) => !isSexual(g)),
    invalid: invalidAll,
  };

  const all = lists[tab];
  const ruleTab = tab === "pending" || tab === "sexual";
  const ctx = ruleTab ? await loadRuleContext(all) : null;

  const matches = needle
    ? all.filter((g) =>
        [g.title ?? "", g.slug ?? "", g.provider, g.provider_category ?? ""].some((value) =>
          value.toLowerCase().includes(needle),
        ),
      )
    : all;

  const { page, totalPages, visible } = paginate(matches, first(params.page));

  const passing =
    tab === "pending" && ctx ? all.filter((g) => checkRules(g, ctx).length === 0).length : 0;

  const autoDone = params.auto !== undefined ? Number(first(params.auto)) : null;
  const autoFailed = Number(first(params.failed)) || 0;

  const suffix = query ? "&q=" + encodeURIComponent(query) : "";

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Moderation</h1>

      <nav aria-label="Filter by status">
        <ul className="flex flex-wrap gap-2">
          {TABS.map((t) => (
            <li key={t}>
              <Link
                href={"/moderation?status=" + t}
                aria-current={t === tab ? "true" : undefined}
                className={tabClass + (t === tab ? "bg-brand text-brand-foreground" : "bg-surface")}
              >
                {TAB_LABELS[t]} <span>({lists[t].length})</span>
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

      <p className="text-sm text-muted">{TAB_HELP[tab]}</p>

      {autoDone !== null && Number.isFinite(autoDone) && (
        <p role="status" className="rounded-2xl border border-border bg-surface p-4 text-sm">
          <span className="font-semibold text-green-500">
            {autoDone} game{autoDone === 1 ? "" : "s"} approved.
          </span>{" "}
          They are in Games, under Pending.
          {autoFailed > 0 && (
            <span className="text-danger">
              {" "}
              {autoFailed} could not be approved. Check Games before anything stays live.
            </span>
          )}
        </p>
      )}

      {tab === "pending" && (
        <section className="flex flex-col gap-3 rounded-2xl border border-border p-4">
          <form action={autoApproveValid} className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={passing === 0}
              className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground disabled:opacity-50"
            >
              Approve all that pass the rules ({passing})
            </button>
            <span className="text-sm text-muted">
              They go to Games &rarr; Pending. Nothing becomes live until you press Publish.
            </span>
          </form>
          <details className="text-sm">
            <summary className="cursor-pointer text-muted">The rules</summary>
            <ul className="mt-2 list-disc pl-5 text-muted">
              {RULE_DESCRIPTIONS.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
          </details>
        </section>
      )}

      <form method="get" role="search" className="flex flex-wrap gap-2">
        <input type="hidden" name="status" value={tab} />
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Search by title, slug or category"
          aria-label="Search games"
          className="min-h-10 w-full max-w-md rounded-xl border border-border bg-surface px-4 text-sm"
        />
        <button
          type="submit"
          className="min-h-10 rounded-xl border border-border bg-surface px-4 text-sm font-medium hover:border-brand"
        >
          Search
        </button>
        {query && (
          <Link
            href={"/moderation?status=" + tab}
            className="inline-flex min-h-10 items-center px-2 text-sm text-brand hover:underline"
          >
            Clear
          </Link>
        )}
      </form>

      {matches.length === 0 ? (
        <p className="text-muted">
          {query ? "No games match your search." : `No ${TAB_LABELS[tab].toLowerCase()} games.`}
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {visible.map((game) => {
            const errors = formatValidationErrors(game.validation_errors);
            const problems = ctx ? checkRules(game, ctx) : [];
            const isUpdate = ctx?.liveKeys.has(game.provider + ":" + game.provider_game_id);
            const hasThumb = game.thumbnail_url && /^https?:\/\//.test(game.thumbnail_url);

            return (
              <li key={game.id}>
                <Link
                  href={"/moderation/" + game.id}
                  className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-4 hover:border-brand"
                >
                  {hasThumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={game.thumbnail_url as string}
                      alt=""
                      loading="lazy"
                      className="h-[45px] w-20 shrink-0 rounded-md bg-border object-cover"
                    />
                  ) : (
                    <div
                      aria-hidden="true"
                      className="h-[45px] w-20 shrink-0 rounded-md bg-border"
                    />
                  )}

                  <span className="flex min-w-0 flex-col gap-1">
                    <span className="flex flex-wrap items-center gap-2 font-semibold">
                      {game.title ?? "(no title)"}
                      {tab === "pending" && (
                        <span className="rounded-full border border-border px-2 py-0.5 text-xs font-medium">
                          {isUpdate ? "Update" : "New"}
                        </span>
                      )}
                      {tab === "sexual" && (
                        <span className="rounded-full border border-border px-2 py-0.5 text-xs font-medium capitalize">
                          {game.status}
                        </span>
                      )}
                    </span>
                    <span className="text-sm text-muted">
                      {game.provider} &middot; {game.provider_category ?? "no category"} &middot;{" "}
                      {new Date(game.created_at).toLocaleDateString("en-GB")}
                    </span>
                    {ctx &&
                      (problems.length === 0 ? (
                        <span className="text-sm font-medium text-green-500">Passes the rules</span>
                      ) : (
                        <span className="text-sm text-danger">
                          Needs a look: {problems.join(", ")}
                        </span>
                      ))}
                    {errors.length > 0 && (
                      <ul className="mt-1 list-disc pl-5 text-sm text-danger">
                        {errors.slice(0, 3).map((e, i) => (
                          <li key={i}>{e}</li>
                        ))}
                        {errors.length > 3 && <li>and {errors.length - 3} more</li>}
                      </ul>
                    )}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        hrefFor={(n) => "/moderation?status=" + tab + suffix + "&page=" + n}
      />
    </div>
  );
}
