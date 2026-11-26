import { Eye, Play } from "lucide-react";
import { t } from "@/i18n";
import { cn } from "@/lib/cn";
import { getPlayCount } from "@/lib/play-count";

const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });

type PlayCountProps = {
  gameId: string;
  // "eye" is used in the phone info row under the title.
  icon?: "play" | "eye";
  className?: string;
};

export async function PlayCount({ gameId, icon = "play", className }: PlayCountProps) {
  const count = await getPlayCount(gameId);
  if (count === null) return null;

  const label = t("game.plays", { count: count.toLocaleString("en-US") });
  const Glyph = icon === "eye" ? Eye : Play;

  return (
    <p
      className={cn("flex items-center gap-1.5 text-sm tabular-nums text-muted", className)}
      title={label}
    >
      <Glyph
        size={16}
        strokeWidth={1.5}
        fill={icon === "play" ? "currentColor" : "none"}
        aria-hidden="true"
      />
      <span aria-hidden="true">{compact.format(count)}</span>
      <span className="sr-only">{label}</span>
    </p>
  );
}
