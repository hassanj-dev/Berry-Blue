"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { GameCard, GameCardSkeleton, type GameCardData } from "@/components/game/GameCard";
import { Icon } from "@/components/layout/icons";
import { t } from "@/i18n";
import { toggleFavorite, useFavorites } from "@/lib/favorites";
import { fetchGamesBySlugs } from "@/lib/games-client";

type Status = "loading" | "ready" | "failed";

const GRID = "grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 xl:grid-cols-4";

function subscribeNothing() {
  return () => {};
}

function ListSkeleton() {
  return (
    <div aria-hidden="true" className={GRID}>
      {Array.from({ length: 8 }, (_, i) => (
        <GameCardSkeleton key={i} />
      ))}
    </div>
  );
}

function Empty() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-surface px-6 py-14 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-foreground/5 text-muted">
        <Icon name="heart" size={22} />
      </span>
      <p className="max-w-xs text-muted">{t("favorites.empty")}</p>
      <Link
        href="/games"
        className="mt-1 inline-flex h-10 items-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
      >
        {t("favorites.browse")}
      </Link>
    </div>
  );
}

export function FavoritesList() {
  // false on the server and while hydrating, so "no favorites" never flashes before localStorage is read.
  const mounted = useSyncExternalStore(
    subscribeNothing,
    () => true,
    () => false,
  );
  const slugs = useFavorites();
  const [games, setGames] = useState<GameCardData[]>([]);
  const [status, setStatus] = useState<Status>("loading");

  // slugs is the same array until the saved list changes, so this runs only then.
  useEffect(() => {
    if (slugs.length === 0) return;

    const controller = new AbortController();
    fetchGamesBySlugs(slugs, controller.signal)
      .then((data) => {
        setGames(data);
        setStatus("ready");
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        console.error("Favorites failed:", error);
        setStatus("failed");
      });

    return () => controller.abort();
  }, [slugs]);

  function clearAll() {
    for (const slug of slugs) toggleFavorite(slug);
  }

  if (!mounted) return <ListSkeleton />;
  if (slugs.length === 0) return <Empty />;
  if (status === "failed") return <p className="text-muted">{t("favorites.error")}</p>;
  if (status === "loading") return <ListSkeleton />;

  // A game removed with the heart disappears at once, before any new request finishes.
  const shown = games.filter((game) => slugs.includes(game.slug));
  if (shown.length === 0) return <Empty />;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-medium text-foreground/80">
          {t("favorites.count", { n: shown.length })}
        </p>
        <button
          type="button"
          onClick={clearAll}
          className="cursor-pointer rounded-full border border-border px-3 py-1.5 text-sm font-medium text-foreground/80 transition-colors hover:border-border-strong hover:text-foreground"
        >
          {t("favorites.clearAll")}
        </button>
      </div>
      <ul className={GRID}>
        {shown.map((game) => (
          <li key={game.slug}>
            <GameCard game={game} />
          </li>
        ))}
      </ul>
    </div>
  );
}
