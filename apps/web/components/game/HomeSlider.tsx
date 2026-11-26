import { HeroSlider } from "@/components/game/HeroSlider";
import { getShelf } from "@/lib/games";
import { HOME_SLIDES, HOME_TRENDING_LIMIT } from "@/lib/home";

export async function HomeSlider() {
  const games = await getShelf("trending", HOME_TRENDING_LIMIT);

  const slides = games.slice(0, HOME_SLIDES).map((game) => ({
    slug: game.slug,
    title: game.title,
    categorySlug: game.categorySlug,
    description: game.description ?? "",
    thumbnailUrl: game.thumbnailUrl,
  }));

  if (slides.length === 0) return null;

  return <HeroSlider slides={slides} />;
}

export function HomeSliderSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="aspect-[16/11] animate-pulse rounded-3xl bg-border sm:aspect-[2/1] lg:aspect-auto lg:h-[22rem] xl:h-[26rem]"
    />
  );
}
