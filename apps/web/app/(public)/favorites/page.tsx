import type { Metadata } from "next";
import { FavoritesList } from "@/components/game/FavoritesList";
import { t } from "@/i18n";

// The list is private to this browser, so Google should not index it.
export const metadata: Metadata = {
  title: t("favorites.title"),
  robots: { index: false },
};

export default function FavoritesPage() {
  return (
    <main>
      <h1 className="text-2xl font-bold md:text-4xl">{t("favorites.title")}</h1>
      <p className="mt-1 text-sm text-muted">{t("favorites.subtitle")}</p>
      <div className="mt-6">
        <FavoritesList />
      </div>
    </main>
  );
}
