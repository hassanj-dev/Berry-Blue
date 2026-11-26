import { ArrowLeft, ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { actionButton } from "@/components/game/action-styles";
import { DeviceIcon } from "@/components/game/DeviceIcon";
import { FavoriteAction } from "@/components/game/FavoriteButton";
import { GameCard } from "@/components/game/GameCard";
import { GamePlayer } from "@/components/game/GamePlayer";
import { GameRating } from "@/components/game/GameRating";
import { PlayCount } from "@/components/game/PlayCount";
import { GameReport } from "@/components/game/GameReport";
import { GameQr, ShareButton } from "@/components/game/GameShare";
import { GameVotes } from "@/components/game/GameVotes";
import { t } from "@/i18n";
import { cn } from "@/lib/cn";
import { getGameBySlug, getRelatedGames } from "@/lib/games";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const game = await getGameBySlug(slug);

  if (!game) return { title: t("game.notFound") };

  return {
    title: game.title,
    description: game.description || undefined,
  };
}

// The page itself asks for no data, it only adds Suspense. The data is read inside GameContent.
export default function GamePage({ params }: { params: Params }) {
  return (
    <main>
      <Suspense fallback={<GamePageSkeleton />}>
        <GameContent params={params} />
      </Suspense>
    </main>
  );
}

async function GameContent({ params }: { params: Params }) {
  const { slug } = await params;
  const game = await getGameBySlug(slug);

  if (!game) notFound();

  const related = await getRelatedGames(game);

  return (
    <div className="flex flex-col gap-5 sm:gap-8 md:gap-10">
      <div className="flex items-start gap-3 md:-mb-5">
        <Link
          href="/games"
          aria-label={t("game.backToGames")}
          title={t("game.backToGames")}
          className={actionButton + " shrink-0"}
        >
          <ArrowLeft size={18} strokeWidth={1.5} aria-hidden="true" />
        </Link>
        <div className="min-w-0 max-sm:pt-1.5">
          <h1 className="text-2xl font-[600] max-sm:text-[22px] max-sm:leading-tight md:text-3xl">
            {game.title}
          </h1>
          {/* From 640px up the category stays under the title; on phones it is a pill in the About section. */}
          <p className="mt-1 text-sm capitalize max-sm:hidden">
            <Link href={"/category/" + game.categorySlug} className="text-muted hover:underline">
              {game.categorySlug}
            </Link>
          </p>
          {/* Phone info row: rating and views. */}
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm">
            <Suspense fallback={null}>
              <GameRating gameId={game.id} className="font-medium" />
            </Suspense>
            <Suspense fallback={null}>
              <PlayCount gameId={game.id} icon="eye" />
            </Suspense>
          </div>
        </div>
      </div>

      <GamePlayer
        gameId={game.id}
        slug={game.slug}
        title={game.title}
        thumbnailUrl={game.thumbnailUrl}
        embedUrl={game.embedUrl}
        stats={
          <>
            <Suspense fallback={null}>
              <GameVotes gameId={game.id} />
            </Suspense>
          </>
        }
        actions={
          <>
            <FavoriteAction slug={game.slug} />
          </>
        }
        meta={
          <>
            <ShareButton title={game.title} />
            <GameReport gameId={game.id} />
            <GameQr />
          </>
        }
      />

      <section aria-labelledby="about-heading" className="flex flex-col gap-3 sm:gap-4">
        <h2 id="about-heading" className="text-lg font-[600]">
          {t("game.about")}
        </h2>
        {game.description && (
          <p className="text-muted max-sm:text-[15px] max-sm:leading-relaxed">{game.description}</p>
        )}

        <ul className={cn("flex flex-wrap gap-2", game.tags.length === 0 && "sm:hidden")}>
          <li className="sm:hidden">
            <Link
              href={"/category/" + game.categorySlug}
              className="inline-block rounded-full border border-brand/40 px-3 py-1 text-xs capitalize text-brand"
            >
              {game.categorySlug}
            </Link>
          </li>
          {game.tags.map((tag) => (
            <li key={tag}>
              <Link
                href={"/tag/" + encodeURIComponent(tag)}
                className="inline-block rounded-full border border-border px-3 py-1 text-xs text-muted transition-colors hover:border-muted hover:text-foreground"
              >
                {tag}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3 text-muted">
          <span className="text-sm">{t("game.devices")}</span>
          <ul aria-label={t("game.devices")} className="flex gap-2">
            {game.devices.map((device) => (
              <li key={device}>
                <DeviceIcon device={device} />
                <span className="sr-only">{t(`devices.${device}`)}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {related.length > 0 && (
        <section aria-labelledby="related-heading">
          <div className="flex items-center justify-between gap-3">
            <h2 id="related-heading" className="text-lg font-[600]">
              {t("game.related")}
            </h2>
            {/* Phone only: desktop keeps its current layout. */}
            <Link
              href={"/category/" + game.categorySlug}
              className="-mr-2 inline-flex items-center gap-0.5 rounded-full px-2 py-1 text-sm text-brand transition-colors hover:underline sm:hidden"
            >
              {t("game.seeAll")}
              <ChevronRight size={16} strokeWidth={1.5} aria-hidden="true" />
            </Link>
          </div>
          <ul className="mt-3 grid grid-cols-2 gap-3 sm:mt-4 sm:gap-4 md:grid-cols-3 md:gap-5 xl:grid-cols-4 xl:gap-6">
            {related.map((item) => (
              <li key={item.id}>
                <GameCard game={item} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function GamePageSkeleton() {
  return (
    <div aria-hidden="true" className="flex animate-pulse flex-col gap-5 sm:gap-8 md:gap-10">
      <div className="flex items-start gap-3">
        <div className="size-10 shrink-0 rounded-full bg-border sm:size-11" />
        <div className="flex flex-col gap-2">
          <div className="h-8 w-48 rounded bg-border" />
          <div className="h-4 w-24 rounded bg-border" />
        </div>
      </div>
      <div className="aspect-video w-full rounded-2xl bg-border" />
    </div>
  );
}
