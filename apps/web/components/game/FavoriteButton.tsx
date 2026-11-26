"use client";

import { Bookmark } from "lucide-react";
import { iconProps } from "@/components/game/icon-style";
import { saveButton } from "@/components/game/action-styles";
import { Icon } from "@/components/layout/icons";
import { t } from "@/i18n";
import { cn } from "@/lib/cn";
import { toggleFavorite, useFavorites } from "@/lib/favorites";

// Heart on top of a game card. z-10 keeps it above the card's full-size link.
export function FavoriteButton({ slug, title }: { slug: string; title: string }) {
  const saved = useFavorites().includes(slug);

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={t("card.favorite") + ": " + title}
      onClick={() => toggleFavorite(slug)}
      className={cn(
        "absolute right-2 top-2 z-10 flex size-10 max-sm:size-9 cursor-pointer items-center justify-center rounded-full transition-colors",
        saved ? "bg-primary text-primary-foreground" : "bg-black/50 text-white hover:bg-black/70",
      )}
    >
      <Icon name="heart" size={18} filled={saved} />
    </button>
  );
}

// Round heart button on the game page (and in the home hero).
export function FavoriteAction({ slug }: { slug: string }) {
  const saved = useFavorites().includes(slug);

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={t("favorites.action")}
      title={t("favorites.action")}
      onClick={() => toggleFavorite(slug)}
      className={saveButton}
    >
      <Bookmark {...iconProps} fill={saved ? "currentColor" : "none"} aria-hidden="true" />
    </button>
  );
}
