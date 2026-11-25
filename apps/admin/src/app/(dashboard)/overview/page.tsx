import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { createSecretClient } from "@/lib/supabase/secret";

export const metadata: Metadata = { title: "Overview" };

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

export default async function OverviewPage() {
  await requireAdmin();

  const [pending, invalid, rejected, live] = await Promise.all([
    countStaged("pending"),
    countStaged("invalid"),
    countStaged("rejected"),
    countLiveGames(),
  ]);

  const cards = [
    { label: "Pending review", value: pending },
    { label: "Invalid", value: invalid },
    { label: "Rejected", value: rejected },
    { label: "Live games", value: live },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Overview</h1>
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
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
