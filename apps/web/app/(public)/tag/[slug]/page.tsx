import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { GameCard, GameCardSkeleton } from "@/components/game/GameCard";
import { t } from "@/i18n";
import { getTagGames } from "@/lib/games";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  return { title: t("tag.title", { tag: slug }) };
}

export default function TagPage({ params }: { params: Params }) {
  return (
    <main>
      <Suspense fallback={<ListSkeleton />}>
        <TagContent params={params} />
      </Suspense>
    </main>
  );
}

async function TagContent({ params }: { params: Params }) {
  const { slug } = await params;
  const games = await getTagGames(slug);

  // Koi game is tag ka nahi (ya tag ghalat likha hai): 404.
  if (games.length === 0) notFound();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Link href="/games" className="text-sm text-muted hover:underline">
          &larr; {t("game.backToGames")}
        </Link>
        <h1 className="mt-2 text-2xl font-bold capitalize md:text-4xl">
          {t("tag.title", { tag: slug })}
        </h1>
      </div>

      <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {games.map((game, index) => (
          <li key={game.id}>
            <GameCard game={game} priority={index < 4} />
          </li>
        ))}
      </ul>
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
