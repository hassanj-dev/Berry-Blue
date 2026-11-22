import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CategoryChips } from "@/components/game/CategoryChips";
import { GameCard, GameCardSkeleton } from "@/components/game/GameCard";
import { t } from "@/i18n";
import { getCategoryBySlug, getCategoryGames } from "@/lib/games";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) return { title: t("game.notFound") };

  return { title: t("category.title", { name: category.name }) };
}

export default function CategoryPage({ params }: { params: Params }) {
  return (
    <main>
      <Suspense fallback={<ListSkeleton />}>
        <CategoryContent params={params} />
      </Suspense>
    </main>
  );
}

async function CategoryContent({ params }: { params: Params }) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) notFound();

  const games = await getCategoryGames(category.slug);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Link href="/games" className="text-sm text-muted hover:underline">
          &larr; {t("game.backToGames")}
        </Link>
        <h1 className="mt-2 text-2xl font-bold md:text-4xl">
          {t("category.title", { name: category.name })}
        </h1>
      </div>

      <CategoryChips current={category.slug} />

      {games.length === 0 ? (
        <p className="text-muted">{t("category.empty")}</p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {games.map((game, index) => (
            <li key={game.id}>
              <GameCard game={game} priority={index < 4} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ListSkeleton() {
  return (
    <div aria-hidden="true" className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {Array.from({ length: 8 }, (_, i) => (
        <GameCardSkeleton key={i} />
      ))}
    </div>
  );
}
