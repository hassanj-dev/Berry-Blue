import { Suspense } from "react";
import { ContinuePlaying } from "@/components/game/ContinuePlaying";
import { GameShelf, GameShelfSkeleton } from "@/components/game/GameShelf";
import { HomeSlider, HomeSliderSkeleton } from "@/components/game/HomeSlider";
import { CategoryTabs } from "@/components/layout/CategoryTabs";
import { t } from "@/i18n";
import { HOME_SLIDES, HOME_TRENDING_LIMIT } from "@/lib/home";

export default function HomePage() {
  return (
    <main className="flex flex-col gap-6 md:gap-8 lg:gap-10">
      {/* Not shown: only for screen readers and search engines. */}
      <h1 className="sr-only">{t("home.title")}</h1>

      <Suspense fallback={<HomeSliderSkeleton />}>
        <HomeSlider />
      </Suspense>

      <Suspense fallback={null}>
        <CategoryTabs highlightAll />
      </Suspense>

      <ContinuePlaying />

      <Suspense fallback={<GameShelfSkeleton />}>
        <GameShelf
          shelf="trending"
          limit={HOME_TRENDING_LIMIT}
          variant="carousel"
          hideFirst={HOME_SLIDES}
        />
      </Suspense>
      <Suspense fallback={<GameShelfSkeleton />}>
        <GameShelf shelf="new" />
      </Suspense>
      <Suspense fallback={<GameShelfSkeleton />}>
        <GameShelf shelf="popular" limit={10} ranked title="Top 10 most played" />
      </Suspense>
    </main>
  );
}
