"use client";

import { Icon } from "@/components/layout/icons";
import { t } from "@/i18n";
import { cn } from "@/lib/cn";
import { toggleFavorite, useFavorites } from "@/lib/favorites";

// Round heart on the home banner. The banner art is always dark, so the colours do not follow the theme.
export function BannerFavorite({ slug }: { slug: string }) {
  const saved = useFavorites().includes(slug);

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={t("favorites.action")}
      title={t("favorites.action")}
      onClick={() => toggleFavorite(slug)}
      className={cn(
        "flex size-9 cursor-pointer items-center justify-center rounded-full backdrop-blur transition-colors lg:size-10",
        saved ? "bg-primary text-primary-foreground" : "bg-white/15 text-white hover:bg-white/25",
      )}
    >
      <Icon name="heart" size={16} filled={saved} />
    </button>
  );
}
