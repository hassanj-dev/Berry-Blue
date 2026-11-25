"use client";

import { useState, useSyncExternalStore, useTransition } from "react";
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

const buttonClass = "rounded-lg border px-3 py-1.5 text-sm hover:border-brand disabled:opacity-60 ";

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

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        aria-pressed={vote === 1}
        disabled={pending}
        onClick={() => choose(1)}
        className={buttonClass + (vote === 1 ? "border-brand" : "border-border")}
      >
        {t("game.like")} ({counts.likes.toLocaleString("en-US")})
      </button>
      <button
        type="button"
        aria-pressed={vote === -1}
        disabled={pending}
        onClick={() => choose(-1)}
        className={buttonClass + (vote === -1 ? "border-brand" : "border-border")}
      >
        {t("game.dislike")} ({counts.dislikes.toLocaleString("en-US")})
      </button>
      <p className="text-sm text-muted" aria-live="polite">
        {total === 0
          ? t("game.noVotes")
          : t("game.voteSummary", {
              percent: String(percent),
              count: total.toLocaleString("en-US"),
            })}
      </p>
    </div>
  );
}
