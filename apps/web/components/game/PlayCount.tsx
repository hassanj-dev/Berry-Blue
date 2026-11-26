import { Play } from "lucide-react";
import { t } from "@/i18n";
import { getPlayCount } from "@/lib/play-count";

const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });

export async function PlayCount({ gameId }: { gameId: string }) {
  const count = await getPlayCount(gameId);
  if (count === null) return null;

  const label = t("game.plays", { count: count.toLocaleString("en-US") });

  return (
    <p className="flex items-center gap-1.5 text-sm tabular-nums text-muted" title={label}>
      <Play size={16} strokeWidth={1.5} fill="currentColor" aria-hidden="true" />
      <span aria-hidden="true">{compact.format(count)}</span>
      <span className="sr-only">{label}</span>
    </p>
  );
}
