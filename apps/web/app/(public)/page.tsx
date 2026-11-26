import { Suspense } from "react";
import { ContinuePlaying } from "@/components/game/ContinuePlaying";
import { GameShelf, GameShelfSkeleton } from "@/components/game/GameShelf";
import { HomeHero } from "@/components/game/HomeHero";
import { CategoryTabs } from "@/components/layout/CategoryTabs";
import { t } from "@/i18n";

export default function HomePage() {
  return (
    <main className="flex flex-col gap-8 md:gap-10 lg:gap-12">
      <div>
        <h1 className="text-2xl font-[600] md:text-3xl">{t("home.title")}</h1>
        <p className="mt-1 text-sm text-muted md:text-base">{t("home.subtitle")}</p>
      </div>

      <Suspense fallback={null}>
        <CategoryTabs />
      </Suspense>

      <Suspense fallback={null}>
        <HomeHero />
      </Suspense>

      <ContinuePlaying />

      <Suspense fallback={<GameShelfSkeleton />}>
        <GameShelf shelf="trending" priority limit={9} variant="carousel" hideFirstOnDesktop />
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
