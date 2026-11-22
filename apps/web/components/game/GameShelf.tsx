import Link from "next/link";
import { GameCard, GameCardSkeleton } from "@/components/game/GameCard";
import { t } from "@/i18n";
import { getShelf, type ShelfName } from "@/lib/games";

type GameShelfProps = {
  shelf: ShelfName;
  priority?: boolean;
};

export async function GameShelf({ shelf, priority = false }: GameShelfProps) {
  const games = await getShelf(shelf);
  const headingId = "shelf-" + shelf;

  return (
    <section aria-labelledby={headingId}>
      <div className="mb-3 flex items-baseline justify-between gap-4">
        <h2 id={headingId} className="text-xl font-bold">
          {t(`home.shelves.${shelf}`)}
        </h2>
        <Link
          href={"/games?sort=" + shelf}
          className="text-sm font-medium text-brand hover:underline"
        >
          {t("home.viewAll")}
        </Link>
      </div>

      {games.length === 0 ? (
        <p className="text-muted">{t("home.empty")}</p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {games.map((game, index) => (
            <li key={game.id}>
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
      <div className="mb-3 h-7 w-40 animate-pulse rounded bg-border" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <GameCardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}
