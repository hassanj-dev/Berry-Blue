import Link from "next/link";
import { GameCard, GameCardSkeleton } from "@/components/game/GameCard";
import { t } from "@/i18n";
import { cn } from "@/lib/cn";
import { getShelf, type ShelfName } from "@/lib/games";

type GameShelfProps = {
  shelf: ShelfName;
  priority?: boolean;
  limit?: number;
  // "carousel": big cards that snap on phones. Both variants are a grid on desktop.
  variant?: "row" | "carousel";
  // The first games are in the slider above, so the list skips them.
  hideFirst?: number;
  // Own heading text. Without it the heading comes from the translations (home.shelves.<shelf>).
  title?: string;
  // Numbered 1, 2, 3...: the Top 10 look. Always a carousel on phones, 5 columns on big screens.
  ranked?: boolean;
};

// Card width on each screen, so the browser downloads the right image size and not a huge one.
const SIZES = {
  // Small fixed cards (w-40 = 160px) on phones and tablets, grid columns from 1024px.
  row: "(min-width: 1280px) 19vw, (min-width: 1024px) 25vw, 160px",
  // Big snapping cards: about 78% of a phone screen, 320px on tablets.
  carousel: "(min-width: 1280px) 19vw, (min-width: 1024px) 25vw, (min-width: 768px) 42vw, 78vw",
  ranked: "(min-width: 1280px) 15vw, (min-width: 1024px) 25vw, (min-width: 768px) 42vw, 78vw",
} as const;

export async function GameShelf({
  shelf,
  priority = false,
  limit = 8,
  variant = "row",
  hideFirst = 0,
  title,
  ranked = false,
}: GameShelfProps) {
  const all = await getShelf(shelf, limit);
  const games = hideFirst > 0 ? all.slice(hideFirst) : all;
  const headingId = "shelf-" + shelf;
  const carousel = variant === "carousel" || ranked;
  const sizes = ranked ? SIZES.ranked : carousel ? SIZES.carousel : SIZES.row;
  const List = ranked ? "ol" : "ul";

  return (
    <section aria-labelledby={headingId}>
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <h2 id={headingId} className="text-lg font-[600]">
          {title ?? t(`home.shelves.${shelf}`)}
        </h2>
        <Link
          href={"/games?sort=" + shelf}
          className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
        >
          {t("home.viewAll")}
        </Link>
      </div>

      {games.length === 0 ? (
        <p className="text-muted">{t("home.empty")}</p>
      ) : (
        <List
          className={cn(
            "scroll-row flex snap-x gap-4 overflow-x-auto pb-1 md:gap-5",
            "lg:grid lg:grid-cols-3 lg:gap-6 lg:overflow-visible lg:pb-0",
            // 5 columns fit the Top 10 in two full rows. With 3 columns the 10th would sit alone, so it is hidden there.
            ranked ? "xl:grid-cols-5 lg:max-xl:[&>li:nth-child(10)]:hidden" : "xl:grid-cols-4",
            carousel
              ? "shelf-carousel -mx-4 snap-mandatory md:-mx-8 lg:mx-0"
              : "-mx-4 scroll-px-4 px-4 md:-mx-8 md:scroll-px-8 md:px-8 lg:mx-0 lg:px-0",
          )}
        >
          {games.map((game, index) => (
            <li
              key={game.id}
              className={cn("shrink-0", carousel ? "snap-start" : "w-40 snap-start lg:w-auto")}
            >
              <GameCard
                game={game}
                priority={priority && index < 4}
                sizes={sizes}
                {...(ranked ? { rank: index + 1 } : {})}
              />
            </li>
          ))}
        </List>
      )}
    </section>
  );
}

export function GameShelfSkeleton() {
  return (
    <section aria-hidden="true">
      <div className="mb-4 h-6 w-36 animate-pulse rounded-lg bg-border" />
      <div className="flex gap-4 overflow-hidden md:gap-5 lg:grid lg:grid-cols-3 lg:gap-6 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="w-40 shrink-0 lg:w-auto">
            <GameCardSkeleton />
          </div>
        ))}
      </div>
    </section>
  );
}
