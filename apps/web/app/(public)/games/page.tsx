import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CategoryChips } from "@/components/game/CategoryChips";
import { GameCard, GameCardSkeleton } from "@/components/game/GameCard";
import { Pagination } from "@/components/game/Pagination";
import { SortTabs } from "@/components/game/SortTabs";
import { t } from "@/i18n";
import { getGamesPage } from "@/lib/games";
import { PAGE_SIZE, parseGamesQuery } from "@/lib/games-query";

export const metadata: Metadata = {
  title: t("games.title"),
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default function GamesPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <main>
      <h1 className="text-2xl font-bold md:text-4xl">{t("games.title")}</h1>
      <div className="mt-4">
        <Suspense fallback={null}>
          <CategoryChips />
        </Suspense>
      </div>
      <div className="mt-4">
        <Suspense fallback={<GamesGridSkeleton />}>
          <GamesResults searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}

async function GamesResults({ searchParams }: { searchParams: SearchParams }) {
  const { sort, page } = parseGamesQuery(await searchParams);
  const result = await getGamesPage(sort, page);

  if (!result) return <p className="text-muted">{t("games.error")}</p>;
  if (page > result.pageCount) notFound();

  const from = (page - 1) * PAGE_SIZE + 1;
  const to = from + result.games.length - 1;

  return (
    <>
      <SortTabs current={sort} />

      {result.total === 0 ? (
        <p className="mt-6 text-muted">{t("games.empty")}</p>
      ) : (
        <>
          <p className="mt-4 text-sm text-muted">
            {t("games.showing", { from, to, total: result.total })}
          </p>
          <ul className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
            {result.games.map((game, index) => (
              <li key={game.id}>
                <GameCard game={game} priority={index < 4} />
              </li>
            ))}
          </ul>
          <Pagination sort={sort} page={page} pageCount={result.pageCount} />
        </>
      )}
    </>
  );
}

function GamesGridSkeleton() {
  return (
    <div aria-hidden="true" className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {Array.from({ length: PAGE_SIZE }, (_, i) => (
        <GameCardSkeleton key={i} />
      ))}
    </div>
  );
}
