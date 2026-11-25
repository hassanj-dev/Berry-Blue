import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { setPublished } from "@/lib/games-actions";
import { createSecretClient } from "@/lib/supabase/secret";

export const metadata: Metadata = { title: "Games" };

type GameRow = {
  id: string;
  slug: string;
  title: string;
  provider: string;
  is_published: boolean;
  categories: { name: string } | null;
};

export default async function GamesPage() {
  await requireAdmin();

  const { data, error } = await createSecretClient()
    .from("games")
    .select("id, slug, title, provider, is_published, categories(name)")
    .order("title")
    .order("id")
    .limit(500);

  if (error) throw new Error(`games list failed: ${error.message}`);
  const games = (data ?? []) as unknown as GameRow[];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Games ({games.length})</h1>

      <ul className="flex flex-col gap-2">
        {games.map((game) => (
          <li
            key={game.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4"
          >
            <div className="flex flex-col">
              <span className="font-semibold">{game.title}</span>
              <span className="text-sm text-muted">
                {game.slug} &middot; {game.categories?.name ?? "no category"} &middot;{" "}
                {game.provider}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className={"text-sm " + (game.is_published ? "" : "text-danger")}>
                {game.is_published ? "Live" : "Hidden"}
              </span>
              <form action={setPublished}>
                <input type="hidden" name="gameId" value={game.id} />
                <input
                  type="hidden"
                  name="published"
                  value={game.is_published ? "false" : "true"}
                />
                <button
                  type="submit"
                  className="rounded-lg border border-border px-3 py-1.5 text-sm hover:border-brand"
                >
                  {game.is_published ? "Unpublish" : "Publish"}
                </button>
              </form>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
