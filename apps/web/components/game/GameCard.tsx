import Image from "next/image";
import Link from "next/link";
import type { Game } from "@berryblue/shared";
import { FavoriteButton } from "@/components/game/FavoriteButton";
import { ThumbBlock } from "@/components/game/ThumbBlock";
import { PlayIcon, ThumbIcon } from "@/components/layout/icons";
import { t } from "@/i18n";

export type GameCardData = Pick<
  Game,
  "slug" | "title" | "categorySlug" | "devices" | "tags" | "thumbnailUrl"
> & {
  description?: string | undefined;
  playCount?: number | undefined;
  likeCount?: number | undefined;
};

type GameCardProps = {
  game: GameCardData;
  priority?: boolean;
};

const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });

// The whole card is one link (the ::after on the title). Title and category sit on the art.
// A mouse on desktop also sees the plays and the likes (.card-preview in globals.css).
// The description, tags and devices are on the game page.
export function GameCard({ game, priority = false }: GameCardProps) {
  const hasStats = game.playCount !== undefined && game.likeCount !== undefined;

  return (
    <article className="game-card relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-2xl bg-surface">
      <Image
        src={game.thumbnailUrl}
        alt=""
        fill
        sizes="(min-width: 1280px) 22vw, (min-width: 1024px) 28vw, 78vw"
        priority={priority}
        className="card-thumb object-cover"
      />
      <ThumbBlock title={game.title} className="absolute inset-0 text-5xl" />
      <FavoriteButton slug={game.slug} title={game.title} />

      <div className="z-[1] flex flex-col gap-1.5 bg-linear-to-t from-black/90 via-black/55 to-transparent p-3 pr-14 pt-14 md:p-4 md:pr-16 md:pt-16">
        <h3 className="truncate text-sm font-medium text-white md:text-base">
          <Link
            href={"/game/" + game.slug}
            aria-label={t("card.playAria", { title: game.title })}
            className="after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-brand"
          >
            {game.title}
          </Link>
        </h3>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <span className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-medium capitalize leading-none text-white">
            {game.categorySlug}
          </span>
          {hasStats ? (
            <div aria-hidden="true" className="card-preview pointer-events-none">
              <p className="flex items-center gap-3 text-xs font-medium tabular-nums text-white">
                <span className="flex items-center gap-1">
                  <PlayIcon size={12} />
                  {compact.format(game.playCount ?? 0)}
                </span>
                <span className="flex items-center gap-1">
                  <ThumbIcon size={12} />
                  {compact.format(game.likeCount ?? 0)}
                </span>
              </p>
            </div>
          ) : null}
        </div>
      </div>

      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-3 right-3 z-[1] flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground md:bottom-4 md:right-4 md:size-10"
      >
        <PlayIcon size={14} />
      </span>
    </article>
  );
}

export function GameCardSkeleton() {
  return <div aria-hidden="true" className="aspect-[4/5] animate-pulse rounded-2xl bg-border" />;
}
