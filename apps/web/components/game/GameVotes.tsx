import { VoteButtons } from "@/components/game/VoteButtons";
import { getVoteCounts } from "@/lib/vote-count";

export async function GameVotes({ gameId }: { gameId: string }) {
  const counts = await getVoteCounts(gameId);
  if (!counts) return null;

  return <VoteButtons gameId={gameId} initialCounts={counts} />;
}
