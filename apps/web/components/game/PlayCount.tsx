import { t } from "@/i18n";
import { getPlayCount } from "@/lib/play-count";

export async function PlayCount({ gameId }: { gameId: string }) {
  const count = await getPlayCount(gameId);
  if (count === null) return null;

  return (
    <p className="text-sm text-muted">
      {t("game.plays", { count: count.toLocaleString("en-US") })}
    </p>
  );
}
