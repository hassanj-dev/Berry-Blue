"use client";

import { ThumbsDown, ThumbsUp } from "lucide-react";
import { useState, useSyncExternalStore, useTransition } from "react";
import { actionButton } from "@/components/game/action-styles";
import { t } from "@/i18n";
import type { VoteCounts } from "@/lib/vote-count";
import { castVote } from "@/lib/vote-actions";

type Vote = -1 | 0 | 1;

// The visitor's own vote lives in localStorage. The memory copy is the fallback when storage is blocked.
const memory = new Map<string, Vote>();
const listeners = new Set<() => void>();

function storageKey(gameId: string) {
  return "vote:" + gameId;
}

function readVote(gameId: string): Vote {
  try {
    const value = localStorage.getItem(storageKey(gameId));
    return value === "1" ? 1 : value === "-1" ? -1 : 0;
  } catch {
    return memory.get(gameId) ?? 0;
  }
}

function saveVote(gameId: string, vote: Vote) {
  memory.set(gameId, vote);
  try {
    if (vote === 0) localStorage.removeItem(storageKey(gameId));
    else localStorage.setItem(storageKey(gameId), String(vote));
  } catch {
    // Storage can be blocked (private mode). The memory copy keeps the vote for this visit.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function applyVote(counts: VoteCounts, from: Vote, to: Vote): VoteCounts {
  return {
    likes: Math.max(0, counts.likes + (to === 1 ? 1 : 0) - (from === 1 ? 1 : 0)),
    dislikes: Math.max(0, counts.dislikes + (to === -1 ? 1 : 0) - (from === -1 ? 1 : 0)),
  };
}

export function VoteButtons({
  gameId,
  initialCounts,
}: {
  gameId: string;
  initialCounts: VoteCounts;
}) {
  // The server render has no vote (0); the browser reads the saved one after hydration.
  const vote = useSyncExternalStore(
    subscribe,
    () => readVote(gameId),
    () => 0 as Vote,
  );
  const [counts, setCounts] = useState(initialCounts);
  const [pending, startTransition] = useTransition();

  function choose(target: 1 | -1) {
    if (pending) return;

    const from = vote;
    const to: Vote = from === target ? 0 : target;
    const before = counts;

    // Show the change at once, then replace it with the real numbers (or undo it if saving failed).
    setCounts(applyVote(before, from, to));
    saveVote(gameId, to);

    startTransition(async () => {
      const result = await castVote(gameId, from, to);
      if (result) {
        setCounts(result);
      } else {
        setCounts(before);
        saveVote(gameId, from);
      }
    });
  }

  const total = counts.likes + counts.dislikes;
  const percent = total === 0 ? 0 : Math.round((counts.likes / total) * 100);
  const likes = counts.likes.toLocaleString("en-US");
  const dislikes = counts.dislikes.toLocaleString("en-US");
  const summary =
    total === 0
      ? t("game.noVotes")
      : t("game.voteSummary", {
          percent: String(percent),
          count: total.toLocaleString("en-US"),
        });

  return (
    <div className="flex items-center gap-2 max-sm:gap-0 max-sm:[&>button:nth-child(1)]:rounded-r-none max-sm:[&>button:nth-child(2)]:-ml-px max-sm:[&>button:nth-child(2)]:rounded-l-none">
      <button
        type="button"
        aria-pressed={vote === 1}
        aria-label={t("game.like") + " (" + likes + ")"}
        title={t("game.like")}
        disabled={pending}
        onClick={() => choose(1)}
        className={actionButton}
      >
        <ThumbsUp
          size={18}
          strokeWidth={1.5}
          fill={vote === 1 ? "currentColor" : "none"}
          aria-hidden="true"
        />
        <span className="tabular-nums">{likes}</span>
      </button>
      <button
        type="button"
        aria-pressed={vote === -1}
        aria-label={t("game.dislike") + " (" + dislikes + ")"}
        title={t("game.dislike")}
        disabled={pending}
        onClick={() => choose(-1)}
        className={actionButton}
      >
        <ThumbsDown
          size={18}
          strokeWidth={1.5}
          fill={vote === -1 ? "currentColor" : "none"}
          aria-hidden="true"
        />
        <span className="tabular-nums">{dislikes}</span>
      </button>
      {/* Screen readers only: the vote summary is read out, but no percentage is shown on screen. */}
      <p className="sr-only" aria-live="polite" title={summary}>
        {summary}
      </p>
    </div>
  );
}
