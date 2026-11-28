import type { Metadata } from "next";
import { Suspense } from "react";
import { FavoritesList } from "@/components/game/FavoritesList";
import { GameShelf } from "@/components/game/GameShelf";
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
        <FavoritesList
          suggestions={
            <Suspense fallback={null}>
              <GameShelf shelf="trending" limit={4} title="You might like" />
            </Suspense>
          }
        />
      </div>
    </main>
  );
}
