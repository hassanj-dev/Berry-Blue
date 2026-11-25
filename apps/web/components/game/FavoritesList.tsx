"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { GameCard, GameCardSkeleton, type GameCardData } from "@/components/game/GameCard";
import { t } from "@/i18n";
import { useFavorites } from "@/lib/favorites";
import { fetchGamesBySlugs } from "@/lib/games-client";

type Status = "loading" | "ready" | "failed";

function subscribeNothing() {
  return () => {};
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

function Empty() {
  return (
    <div>
      <p className="text-muted">{t("favorites.empty")}</p>
      <Link
        href="/games"
        className="mt-3 inline-block rounded-lg border border-border px-3 py-1.5 text-sm hover:border-brand"
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

  if (!mounted) return <ListSkeleton />;
  if (slugs.length === 0) return <Empty />;
  if (status === "failed") return <p className="text-muted">{t("favorites.error")}</p>;
  if (status === "loading") return <ListSkeleton />;

  // A game removed with the heart disappears at once, before any new request finishes.
  const shown = games.filter((game) => slugs.includes(game.slug));
  if (shown.length === 0) return <Empty />;

  return (
    <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {shown.map((game) => (
        <li key={game.slug}>
          <GameCard game={game} />
        </li>
      ))}
    </ul>
  );
}
