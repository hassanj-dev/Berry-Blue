import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { GameCard, GameCardSkeleton } from "@/components/game/GameCard";
import { GamesFilterBar } from "@/components/game/GamesFilterBar";
import { Pagination } from "@/components/game/Pagination";
import { SortTabs } from "@/components/game/SortTabs";
import { t } from "@/i18n";
import { getCategories, getGamesPage } from "@/lib/games";
import { PAGE_SIZE, parseGamesQuery, type GamesFilters } from "@/lib/games-query";
import { getTags } from "@/lib/tags";

export const metadata: Metadata = {
  title: t("games.title"),
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default function GamesPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <main>
      <h1 className="text-2xl font-bold md:text-4xl">{t("games.title")}</h1>
      <div className="mt-4">
        <Suspense fallback={<GamesGridSkeleton />}>
          <GamesContent searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}

async function GamesContent({ searchParams }: { searchParams: SearchParams }) {
  const query = parseGamesQuery(await searchParams);
  const [categories, tags] = await Promise.all([getCategories(), getTags()]);

  // Only values that really exist reach the database (and the cache).
  const filters: GamesFilters = {
    category: categories.some((c) => c.slug === query.category) ? query.category : undefined,
    device: query.device,
    tag: tags.some((option) => option.tag === query.tag) ? query.tag : undefined,
  };
  const hasFilters = Boolean(filters.category || filters.device || filters.tag);

  const { sort, page } = query;
  const result = await getGamesPage(sort, page, filters);

  return (
    <div className="flex flex-col gap-4">
      <GamesFilterBar sort={sort} filters={filters} categories={categories} tags={tags} />
      <ResultsBody
        sort={sort}
        page={page}
        filters={filters}
        hasFilters={hasFilters}
        result={result}
      />
    </div>
  );
}

function ResultsBody({
  sort,
  page,
  filters,
  hasFilters,
  result,
}: {
  sort: Parameters<typeof SortTabs>[0]["current"];
  page: number;
  filters: GamesFilters;
  hasFilters: boolean;
  result: Awaited<ReturnType<typeof getGamesPage>>;
}) {
  if (!result) return <p className="text-muted">{t("games.error")}</p>;
  if (page > result.pageCount) notFound();

  const from = (page - 1) * PAGE_SIZE + 1;
  const to = from + result.games.length - 1;

  return (
    <>
      <SortTabs current={sort} filters={filters} />

      {result.total === 0 ? (
        <p className="text-muted">{hasFilters ? t("games.noMatch") : t("games.empty")}</p>
      ) : (
        <>
          <p className="text-sm text-muted">
            {t("games.showing", { from, to, total: result.total })}
          </p>
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {result.games.map((game, index) => (
              <li key={game.id}>
                <GameCard game={game} priority={index < 4} />
              </li>
            ))}
          </ul>
          <Pagination sort={sort} filters={filters} page={page} pageCount={result.pageCount} />
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
