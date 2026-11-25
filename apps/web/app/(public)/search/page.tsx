import type { Metadata } from "next";
import { Suspense } from "react";
import { GameCard, GameCardSkeleton } from "@/components/game/GameCard";
import { t } from "@/i18n";
import { searchGames } from "@/lib/games";
import { parseSearchQuery } from "@/lib/search-query";

// Search result pages should not show up in Google.
export const metadata: Metadata = {
  title: t("search.title"),
  robots: { index: false },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default function SearchPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <main>
      <h1 className="text-2xl font-bold md:text-4xl">{t("search.title")}</h1>
      <div className="mt-4">
        <Suspense fallback={<ResultsSkeleton />}>
          <SearchResults searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}

async function SearchResults({ searchParams }: { searchParams: SearchParams }) {
  const query = parseSearchQuery(await searchParams);

  if (!query) return <p className="text-muted">{t("search.tooShort")}</p>;

  const games = await searchGames(query);

  if (!games) return <p className="text-muted">{t("search.error")}</p>;
  if (games.length === 0) return <p className="text-muted">{t("search.empty", { query })}</p>;

  return (
    <>
      <p className="text-sm text-muted" aria-live="polite">
        {t("search.results", { count: games.length, query })}
      </p>
      <ul className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        {games.map((game, index) => (
          <li key={game.id}>
            <GameCard game={game} priority={index < 4} />
          </li>
        ))}
      </ul>
    </>
  );
}

function ResultsSkeleton() {
  return (
    <div aria-hidden="true" className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {Array.from({ length: 8 }, (_, i) => (
        <GameCardSkeleton key={i} />
      ))}
    </div>
  );
}
