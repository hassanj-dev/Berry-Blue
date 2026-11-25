"use client";

import { t } from "@/i18n";
import { cn } from "@/lib/cn";
import { toggleFavorite, useFavorites } from "@/lib/favorites";

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21.2l7.8-7.7 1-1.1a5.5 5.5 0 0 0 0-7.8z" />
    </svg>
  );
}

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
        "absolute right-2 top-2 z-10 flex size-10 cursor-pointer items-center justify-center rounded-full bg-background/80 backdrop-blur hover:text-brand",
        saved ? "text-brand" : "text-muted",
      )}
    >
      <HeartIcon filled={saved} />
    </button>
  );
}

// Text button under the player on the game page.
export function FavoriteAction({ slug }: { slug: string }) {
  const saved = useFavorites().includes(slug);

  return (
    <button
      type="button"
      aria-pressed={saved}
      onClick={() => toggleFavorite(slug)}
      className={cn(
        "inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-sm hover:border-brand",
        saved ? "border-brand text-brand" : "border-border",
      )}
    >
      <HeartIcon filled={saved} />
      {t("favorites.action")}
    </button>
  );
}
