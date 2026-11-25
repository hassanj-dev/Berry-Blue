import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { lastCompletedImport, listMissingFromFeed, listProviders } from "@/lib/diff";
import { setPublished } from "@/lib/games-actions";

export const metadata: Metadata = { title: "Missing from feed" };

export default async function MissingPage() {
  await requireAdmin();

  const providers = await listProviders();
  const sections = await Promise.all(
    providers.map(async (p) => ({
      provider: p,
      lastImport: await lastCompletedImport(p.provider),
      missing: await listMissingFromFeed(p.provider),
    })),
  );

  return (
    <div className="flex flex-col gap-6">
      <Link href="/moderation" className="text-sm text-brand hover:underline">
        &larr; Back to moderation
      </Link>

      <h1 className="text-2xl font-bold">Missing from feed</h1>
      <p className="text-sm text-muted">
        Live games that were not in the provider&apos;s feed during its latest import. Nothing is
        unpublished automatically: check each one, then decide.
      </p>

      {sections.map(({ provider, lastImport, missing }) => (
        <section key={provider.provider} className="flex flex-col gap-3">
          <h2 className="text-lg font-bold">
            {provider.display_name} ({lastImport ? missing.length : 0})
          </h2>

          {!lastImport ? (
            <p className="text-muted">No completed import yet.</p>
          ) : (
            <>
              <p className="text-sm text-muted">
                Latest import: {new Date(lastImport).toLocaleString("en-GB")}
              </p>
              {missing.length === 0 ? (
                <p className="text-muted">Every live game of this provider was in the feed.</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {missing.map((game) => (
                    <li
                      key={game.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4"
                    >
                      <span>
                        <span className="font-semibold">{game.title}</span>
                        <span className="text-sm text-muted"> &middot; {game.slug}</span>
                      </span>
                      <form action={setPublished}>
                        <input type="hidden" name="gameId" value={game.id} />
                        <input type="hidden" name="published" value="false" />
                        <button
                          type="submit"
                          className="rounded-lg border border-border px-3 py-1.5 text-sm hover:border-brand"
                        >
                          Unpublish
                        </button>
                      </form>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </section>
      ))}
    </div>
  );
}
