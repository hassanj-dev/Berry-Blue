import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { actionButton } from "@/components/game/action-styles";
import { DeviceIcon } from "@/components/game/DeviceIcon";
import { FavoriteAction } from "@/components/game/FavoriteButton";
import { GameCard } from "@/components/game/GameCard";
import { GamePlayer } from "@/components/game/GamePlayer";
import { PlayCount } from "@/components/game/PlayCount";
import { GameReport } from "@/components/game/GameReport";
import { GameQr, ShareButton } from "@/components/game/GameShare";
import { GameVotes } from "@/components/game/GameVotes";
import { t } from "@/i18n";
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

// Page khud data nahi maangta: sirf Suspense lagata hai. Data GameContent mein aata hai.
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
    <div className="flex flex-col gap-8 md:gap-10">
      <div className="flex items-start gap-3">
        <Link
          href="/games"
          aria-label={t("game.backToGames")}
          title={t("game.backToGames")}
          className={actionButton + " shrink-0"}
        >
          <ArrowLeft size={18} strokeWidth={1.5} aria-hidden="true" />
        </Link>
        <div className="min-w-0">
          <h1 className="text-2xl font-[600] md:text-3xl">{game.title}</h1>
          <p className="mt-1 text-sm capitalize">
            <Link href={"/category/" + game.categorySlug} className="text-muted hover:underline">
              {game.categorySlug}
            </Link>
          </p>
        </div>
      </div>

      <GamePlayer
        gameId={game.id}
        slug={game.slug}
        title={game.title}
        thumbnailUrl={game.thumbnailUrl}
        embedUrl={game.embedUrl}
        actions={
          <>
            <Suspense fallback={null}>
              <GameVotes gameId={game.id} />
            </Suspense>
            <FavoriteAction slug={game.slug} />
            <ShareButton title={game.title} />
          </>
        }
        meta={
          <>
            <Suspense fallback={null}>
              <PlayCount gameId={game.id} />
            </Suspense>
            <GameReport gameId={game.id} />
            <GameQr />
          </>
        }
      />

      <GameQr />

      <section aria-labelledby="about-heading" className="flex flex-col gap-4">
        <h2 id="about-heading" className="text-lg font-[600]">
          {t("game.about")}
        </h2>
        {game.description && <p className="text-muted">{game.description}</p>}

        {game.tags.length > 0 && (
          <ul className="flex flex-wrap gap-2">
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
        )}

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
          <h2 id="related-heading" className="text-lg font-[600]">
            {t("game.related")}
          </h2>
          <ul className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5 xl:grid-cols-4 xl:gap-6">
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
    <div aria-hidden="true" className="flex animate-pulse flex-col gap-8 md:gap-10">
      <div className="flex items-start gap-3">
        <div className="size-11 shrink-0 rounded-full bg-border" />
        <div className="flex flex-col gap-2">
          <div className="h-8 w-48 rounded bg-border" />
          <div className="h-4 w-24 rounded bg-border" />
        </div>
      </div>
      <div className="aspect-[4/3] w-full rounded-2xl bg-border md:aspect-video" />
    </div>
  );
}
