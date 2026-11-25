import { Suspense } from "react";
import { ContinuePlaying } from "@/components/game/ContinuePlaying";
import { GameShelf, GameShelfSkeleton } from "@/components/game/GameShelf";
import { t } from "@/i18n";

export default function HomePage() {
  return (
    <main className="flex flex-col gap-10">
      <div>
        <h1 className="text-2xl font-bold md:text-4xl">{t("home.title")}</h1>
        <p className="mt-2 text-muted">{t("home.subtitle")}</p>
      </div>

      <ContinuePlaying />

      <Suspense fallback={<GameShelfSkeleton />}>
        <GameShelf shelf="trending" priority />
      </Suspense>
      <Suspense fallback={<GameShelfSkeleton />}>
        <GameShelf shelf="new" />
      </Suspense>
      <Suspense fallback={<GameShelfSkeleton />}>
        <GameShelf shelf="popular" />
      </Suspense>
    </main>
  );
}
