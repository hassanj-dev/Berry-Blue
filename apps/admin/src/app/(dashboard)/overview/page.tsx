import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { createSecretClient } from "@/lib/supabase/secret";

export const metadata: Metadata = { title: "Overview" };

// Same limit as the Games page and the health-check worker.
const FLAGGED_AFTER = 3;

async function countStaged(status: string) {
  const { count, error } = await createSecretClient()
    .from("staged_games")
    .select("id", { count: "exact", head: true })
    .eq("status", status);

  return error ? null : count;
}

async function countLiveGames() {
  const { count, error } = await createSecretClient()
    .from("games")
    .select("id", { count: "exact", head: true })
    .eq("is_published", true);

  return error ? null : count;
}

// Live games whose embed failed FLAGGED_AFTER checks in a row.
async function countFlaggedGames() {
  const { count, error } = await createSecretClient()
    .from("game_health")
    .select("game_id, games!inner(is_published)", { count: "exact", head: true })
    .gte("consecutive_failures", FLAGGED_AFTER)
    .eq("games.is_published", true);

  return error ? null : count;
}

export default async function OverviewPage() {
  await requireAdmin();

  const [pending, invalid, rejected, live, flagged] = await Promise.all([
    countStaged("pending"),
    countStaged("invalid"),
    countStaged("rejected"),
    countLiveGames(),
    countFlaggedGames(),
  ]);

  const cards = [
    { label: "Pending review", value: pending },
    { label: "Invalid", value: invalid },
    { label: "Rejected", value: rejected },
    { label: "Live games", value: live },
    { label: "Flagged games", value: flagged },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Overview</h1>
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {cards.map((card) => (
          <li key={card.label} className="rounded-2xl border border-border bg-surface p-4">
            <p className="text-sm text-muted">{card.label}</p>
            <p className="mt-1 text-3xl font-bold">{card.value ?? "-"}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
