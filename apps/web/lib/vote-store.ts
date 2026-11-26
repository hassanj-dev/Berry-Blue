import type { VoteCounts } from "@/lib/vote-count";

// The newest like and dislike numbers on screen, per game. VoteButtons writes them,
// the star rating reads them, so the rating changes the moment someone votes (no refresh).
const counts = new Map<string, VoteCounts>();
const listeners = new Set<() => void>();

export function publishCounts(gameId: string, next: VoteCounts) {
  counts.set(gameId, next);
  listeners.forEach((listener) => listener());
}

export function readCounts(gameId: string): VoteCounts | undefined {
  return counts.get(gameId);
}

export function subscribeCounts(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
