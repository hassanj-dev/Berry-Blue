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
};

export async function GameShelf({
  shelf,
  priority = false,
  limit = 8,
  variant = "row",
  hideFirst = 0,
}: GameShelfProps) {
  const all = await getShelf(shelf, limit);
  const games = hideFirst > 0 ? all.slice(hideFirst) : all;
  const headingId = "shelf-" + shelf;
  const carousel = variant === "carousel";

  return (
    <section aria-labelledby={headingId}>
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <h2 id={headingId} className="text-lg font-[600]">
          {t(`home.shelves.${shelf}`)}
        </h2>
        <Link
          href={"/games?sort=" + shelf}
          className="text-sm text-muted transition-colors hover:text-foreground"
        >
          {t("home.viewAll")}
        </Link>
      </div>

      {games.length === 0 ? (
        <p className="text-muted">{t("home.empty")}</p>
      ) : (
        <ul
          className={cn(
            "scroll-row flex snap-x gap-4 overflow-x-auto pb-1 md:gap-5",
            "lg:grid lg:grid-cols-3 lg:gap-6 lg:overflow-visible lg:pb-0 xl:grid-cols-4",
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
              <GameCard game={game} priority={priority && index < 4} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function GameShelfSkeleton() {
  return (
    <section aria-hidden="true">
      <div className="mb-4 h-6 w-36 animate-pulse rounded bg-border" />
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
