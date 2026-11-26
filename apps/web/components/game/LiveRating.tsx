"use client";

import { Star } from "lucide-react";
import { useSyncExternalStore } from "react";
import { t } from "@/i18n";
import { cn } from "@/lib/cn";
import type { VoteCounts } from "@/lib/vote-count";
import { readCounts, subscribeCounts } from "@/lib/vote-store";

// Star score out of 5, worked out from likes and dislikes. Hidden while there are no votes.
// A small "starting weight" (PRIOR_VOTES votes at PRIOR_SCORE) stops one single vote from
// showing a perfect 5.0 or a 1.0. With many votes the real like share takes over.
// Examples: 1 like = 4.7, 10 likes = 4.9, 8 likes + 2 dislikes = 4.1, 1 dislike = 3.0.
const PRIOR_VOTES = 2;
const PRIOR_SCORE = 0.9;

export function LiveRating({
  gameId,
  initialCounts,
  className,
}: {
  gameId: string;
  initialCounts: VoteCounts;
  className?: string;
}) {
  // The server gives the first numbers; after a vote the store has the newer ones.
  const live = useSyncExternalStore(
    subscribeCounts,
    () => readCounts(gameId),
    () => undefined,
  );
  const counts = live ?? initialCounts;

  const total = counts.likes + counts.dislikes;
  if (total === 0) return null;

  const share = (counts.likes + PRIOR_VOTES * PRIOR_SCORE) / (total + PRIOR_VOTES);
  const rating = Math.min(5, Math.round(share * 50) / 10).toFixed(1);
  const votes = total.toLocaleString("en-US");
  const label = t("game.ratingLabel", { rating, count: votes });

  return (
    <p
      className={cn("flex items-center gap-1.5 text-sm tabular-nums text-muted", className)}
      title={label}
    >
      <Star
        size={16}
        strokeWidth={1.5}
        fill="currentColor"
        className="text-amber-400"
        aria-hidden="true"
      />
      <span aria-hidden="true" className="text-foreground">
        {rating}
      </span>
      <span aria-hidden="true">({votes})</span>
      <span className="sr-only">{label}</span>
    </p>
  );
}
