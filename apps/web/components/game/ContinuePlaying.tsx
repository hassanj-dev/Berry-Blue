"use client";

import { useEffect, useId, useState } from "react";
import { GameCard, GameCardSkeleton, type GameCardData } from "@/components/game/GameCard";
import { t } from "@/i18n";
import { fetchGamesBySlugs } from "@/lib/games-client";
import { clearRecent, useRecent } from "@/lib/recent";

type Status = "loading" | "ready" | "failed";

const ITEM = "w-44 shrink-0 snap-start md:w-56";

// Shows nothing at all until the browser has a recently played list.
// On the server the list is empty, so the first render matches and there is no hydration warning.
export function ContinuePlaying() {
  const headingId = useId();
  const slugs = useRecent();
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
        console.error("Continue playing failed:", error);
        setStatus("failed");
      });

    return () => controller.abort();
  }, [slugs]);

  if (slugs.length === 0 || status === "failed") return null;

  // Unpublished games drop out, and a cleared list disappears before any request finishes.
  const shown = games.filter((game) => slugs.includes(game.slug));
  if (status === "ready" && shown.length === 0) return null;

  return (
    <section aria-labelledby={headingId}>
      <div className="mb-3 flex items-baseline justify-between gap-4">
        <h2 id={headingId} className="text-xl font-bold">
          {t("continuePlaying.title")}
        </h2>
        <button
          type="button"
          onClick={clearRecent}
          className="cursor-pointer text-sm font-medium text-muted hover:text-foreground"
        >
          {t("continuePlaying.clear")}
        </button>
      </div>

      {status === "loading" ? (
        <div aria-hidden="true" className="-mx-4 flex gap-3 overflow-hidden px-4 md:mx-0 md:px-0">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className={ITEM}>
              <GameCardSkeleton />
            </div>
          ))}
        </div>
      ) : (
        <ul className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0">
          {shown.map((game) => (
            <li key={game.slug} className={ITEM}>
              <GameCard game={game} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
