import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { Pagination, paginate } from "@/components/ui/Pagination";
import { setPublished } from "@/lib/games-actions";
import { createSecretClient } from "@/lib/supabase/secret";

export const metadata: Metadata = { title: "Games" };

// A game is flagged after this many failed embed checks in a row (the worker counts them).
const FLAGGED_AFTER = 3;

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

type Health = {
  last_ok: boolean;
  last_checked_at: string;
  last_error: string | null;
  consecutive_failures: number;
};

type GameRow = {
  id: string;
  slug: string;
  title: string;
  provider: string;
  is_published: boolean;
  thumbnail_url: string | null;
  categories: { name: string } | null;
  game_health: Health | Health[] | null;
};

function healthOf(game: GameRow): Health | null {
  return Array.isArray(game.game_health) ? (game.game_health[0] ?? null) : game.game_health;
}

function HealthLabel({ health }: { health: Health | null }) {
  if (!health) return <span className="text-sm text-muted">Embed not checked yet</span>;

  const when = new Date(health.last_checked_at).toLocaleDateString("en-GB");
  if (health.last_ok) return <span className="text-sm text-muted">Embed OK ({when})</span>;

  const flagged = health.consecutive_failures >= FLAGGED_AFTER;
  return (
    <span className="text-sm text-danger">
      {flagged ? "Flagged: " : "Failing: "}
      {health.consecutive_failures} failed checks in a row
      {health.last_error ? ` (${health.last_error})` : ""}
    </span>
  );
}

function Thumb({ url }: { url: string | null }) {
  if (url && /^https?:\/\//.test(url)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt=""
        loading="lazy"
        className="h-[45px] w-20 shrink-0 rounded-md bg-border object-cover"
      />
    );
  }
  return <div aria-hidden="true" className="h-[45px] w-20 shrink-0 rounded-md bg-border" />;
}

function first(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

const buttonClass = "rounded-lg border border-border px-3 py-1.5 text-sm hover:border-brand";
const tabClass =
  "inline-flex min-h-10 items-center gap-2 rounded-xl border border-border px-4 text-sm font-medium ";

function GameItem({ game }: { game: GameRow }) {
  const live = game.is_published;

  return (
    <li className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4">
      <div className="flex items-center gap-4">
        <Thumb url={game.thumbnail_url} />
        <div className="flex flex-col">
          <span className="font-semibold">{game.title}</span>
          <span className="text-sm text-muted">
            {game.slug} &middot; {game.categories?.name ?? "no category"} &middot; {game.provider}
          </span>
          <HealthLabel health={healthOf(game)} />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className={"text-sm font-medium " + (live ? "text-green-500" : "text-danger")}>
          {live ? "Live" : "Pending"}
        </span>
        <Link href={`/games/${game.id}`} className={buttonClass}>
          Edit
        </Link>
        <form action={setPublished}>
          <input type="hidden" name="gameId" value={game.id} />
          <input type="hidden" name="published" value={live ? "false" : "true"} />
          <button type="submit" className={buttonClass}>
            {live ? "Unpublish" : "Publish"}
          </button>
        </form>
      </div>
    </li>
  );
}

export default async function GamesPage({ searchParams }: { searchParams: SearchParams }) {
  await requireAdmin();

  const params = await searchParams;
  const rawQuery = params.q;
  const query = ((Array.isArray(rawQuery) ? rawQuery[0] : rawQuery) ?? "").trim();
  const tab = params.tab === "pending" ? "pending" : "published";

  const { data, error } = await createSecretClient()
    .from("games")
    .select(
      "id, slug, title, provider, is_published, thumbnail_url, categories(name), game_health(last_ok, last_checked_at, last_error, consecutive_failures)",
    )
    .order("title")
    .order("id")
    .limit(500);

  if (error) throw new Error(`games list failed: ${error.message}`);
  const all = (data ?? []) as unknown as GameRow[];

  const needle = query.toLowerCase();
  const matches = needle
    ? all.filter((g) =>
        [g.title, g.slug, g.provider, g.categories?.name ?? ""].some((value) =>
          value.toLowerCase().includes(needle),
        ),
      )
    : all;

  const published = matches.filter((g) => g.is_published);
  const pending = matches.filter((g) => !g.is_published);
  const shown = tab === "pending" ? pending : published;

  const { page, totalPages, visible } = paginate(shown, first(params.page));

  const suffix = query ? "&q=" + encodeURIComponent(query) : "";

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Games ({all.length})</h1>

      <nav aria-label="Games">
        <ul className="flex flex-wrap gap-2">
          <li>
            <Link
              href={"/games?tab=published" + suffix}
              aria-current={tab === "published" ? "true" : undefined}
              className={
                tabClass + (tab === "published" ? "bg-brand text-brand-foreground" : "bg-surface")
              }
            >
              Published <span>({published.length})</span>
            </Link>
          </li>
          <li>
            <Link
              href={"/games?tab=pending" + suffix}
              aria-current={tab === "pending" ? "true" : undefined}
              className={
                tabClass + (tab === "pending" ? "bg-brand text-brand-foreground" : "bg-surface")
              }
            >
              Pending{" "}
              <span className={tab !== "pending" && pending.length > 0 ? "text-danger" : ""}>
                ({pending.length})
              </span>
            </Link>
          </li>
        </ul>
      </nav>

      <form method="get" role="search" className="flex flex-wrap gap-2">
        <input type="hidden" name="tab" value={tab} />
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
            href={"/games?tab=" + tab}
            className="inline-flex min-h-10 items-center px-2 text-sm text-brand hover:underline"
          >
            Clear
          </Link>
        )}
      </form>

      {tab === "pending" && (
        <p className="text-sm text-muted">
          Not live on the site. Edit a game (thumbnail, title, tags), then press Publish.
        </p>
      )}

      {shown.length === 0 ? (
        <p className="text-muted">
          {query
            ? "No games match your search."
            : tab === "pending"
              ? "Nothing is waiting."
              : "No published games."}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {visible.map((game) => (
            <GameItem key={game.id} game={game} />
          ))}
        </ul>
      )}

      {totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          hrefFor={(n) => "/games?tab=" + tab + suffix + "&page=" + n}
        />
      )}
    </div>
  );
}
