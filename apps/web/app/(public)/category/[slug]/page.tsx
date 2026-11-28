import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CategoryChips } from "@/components/game/CategoryChips";
import { GameCard, GameCardSkeleton } from "@/components/game/GameCard";
import { Pagination } from "@/components/game/Pagination";
import { t } from "@/i18n";
import { getCategoryIntro } from "@/lib/category-intro";
import { getCategoryBySlug, getGamesPage } from "@/lib/games";
import { PAGE_SIZE, parseGamesQuery } from "@/lib/games-query";

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const GRID = "grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 xl:grid-cols-4";

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) return { title: t("game.notFound") };

  const intro = getCategoryIntro(category.slug);

  return {
    title: t("category.title", { name: category.name }),
    ...(intro ? { description: intro } : {}),
  };
}

export default function CategoryPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  return (
    <main>
      <Suspense fallback={<ListSkeleton />}>
        <CategoryContent params={params} searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function CategoryContent({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) notFound();

  // The URL is not trusted: parseGamesQuery turns a wrong ?page= into 1.
  const { page } = parseGamesQuery(await searchParams);
  const result = await getGamesPage("popular", page, { category: category.slug });

  if (result && result.total > 0 && page > result.pageCount) notFound();

  const games = result?.games ?? [];
  const total = result?.total ?? 0;
  const from = (page - 1) * PAGE_SIZE + 1;
  const to = from + games.length - 1;
  const base = "/category/" + category.slug;
  // The intro is on the first page only, so page 2, 3... do not repeat the same text.
  const intro = page === 1 ? getCategoryIntro(category.slug) : null;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <Link
          href="/games"
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border pl-2.5 pr-4 text-sm font-medium text-foreground/80 transition-colors hover:border-border-strong hover:bg-foreground/5 hover:text-foreground"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          {t("game.backToGames")}
        </Link>
        <h1 className="mt-3 text-2xl font-bold md:text-4xl">
          {t("category.title", { name: category.name })}
        </h1>
        {intro ? <p className="mt-2 max-w-2xl text-pretty text-muted">{intro}</p> : null}
        {games.length > 0 ? (
          <p className="mt-2 text-sm text-muted">{t("games.showing", { from, to, total })}</p>
        ) : null}
      </div>

      <div className="lg:hidden">
        <CategoryChips current={category.slug} />
      </div>

      {!result ? (
        <p className="text-muted">{t("games.error")}</p>
      ) : games.length === 0 ? (
        <p className="text-muted">{t("category.empty")}</p>
      ) : (
        <>
          <ul className={GRID}>
            {games.map((game, index) => (
              <li key={game.id}>
                <GameCard game={game} priority={index < 4} />
              </li>
            ))}
          </ul>
          <Pagination
            sort="popular"
            filters={{ category: category.slug }}
            page={page}
            pageCount={result.pageCount}
            hrefFor={(target) => (target > 1 ? base + "?page=" + target : base)}
          />
        </>
      )}
    </div>
  );
}

function ListSkeleton() {
  return (
    <div aria-hidden="true" className={GRID}>
      {Array.from({ length: PAGE_SIZE }, (_, i) => (
        <GameCardSkeleton key={i} />
      ))}
    </div>
  );
}
