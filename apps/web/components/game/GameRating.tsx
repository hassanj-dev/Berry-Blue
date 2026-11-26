import { Star } from "lucide-react";
import { t } from "@/i18n";
import { cn } from "@/lib/cn";
import { getVoteCounts } from "@/lib/vote-count";

// Star rating out of 5, worked out from likes and dislikes. Hidden until the first vote.
// A small "starting weight" (PRIOR_VOTES votes at PRIOR_SCORE) stops one single vote from
// showing 5.0 or 1.0. With many votes the real like share takes over.
// Examples: 1 like = 4.7, 10 likes = 4.9, 8 likes + 2 dislikes = 4.1, 1 dislike = 3.0.
const PRIOR_VOTES = 2;
const PRIOR_SCORE = 0.9;

// It is read when the page loads, so after a vote it updates on the next load.
export async function GameRating({ gameId, className }: { gameId: string; className?: string }) {
  const counts = await getVoteCounts(gameId);
  if (!counts) return null;

  const total = counts.likes + counts.dislikes;
  if (total === 0) return null;

  const share = (counts.likes + PRIOR_VOTES * PRIOR_SCORE) / (total + PRIOR_VOTES);
  const rating = Math.min(5, Math.round(share * 50) / 10).toFixed(1);

  // The tooltip and screen readers still get the exact like percentage and vote count.
  const percent = Math.round((counts.likes / total) * 100);
  const summary = t("game.voteSummary", {
    percent: String(percent),
    count: total.toLocaleString("en-US"),
  });

  return (
    <p
      className={cn("flex items-center gap-1.5 text-sm tabular-nums text-muted", className)}
      title={summary}
    >
      <Star
        size={16}
        strokeWidth={1.5}
        fill="currentColor"
        className="text-amber-400"
        aria-hidden="true"
      />
      <span aria-hidden="true">{rating}</span>
      <span className="sr-only">{summary}</span>
    </p>
  );
}
