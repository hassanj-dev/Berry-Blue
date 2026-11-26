import { LiveRating } from "@/components/game/LiveRating";
import { getVoteCounts } from "@/lib/vote-count";

// Read when the page loads; LiveRating keeps it up to date after that.
export async function GameRating({ gameId, className }: { gameId: string; className?: string }) {
  const counts = await getVoteCounts(gameId);
  if (!counts) return null;

  return <LiveRating gameId={gameId} initialCounts={counts} className={className} />;
}
