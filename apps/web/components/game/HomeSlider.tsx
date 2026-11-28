import { HeroSlider } from "@/components/game/HeroSlider";
import { getHomeBanners } from "@/lib/banners";
import { getShelf } from "@/lib/games";
import { HOME_SLIDES, HOME_TRENDING_LIMIT } from "@/lib/home";

// /game/<slug> links get the heart button on the banner.
function gameSlugOf(href: string) {
  return /^\/game\/([a-z0-9-]+)\/?$/.exec(href)?.[1];
}

export async function HomeSlider() {
  // Banners made in the admin come first. No active banner: trending games, as before.
  const banners = await getHomeBanners();

  if (banners.length > 0) {
    return (
      <HeroSlider
        slides={banners.map((banner) => ({
          id: banner.id,
          href: banner.linkUrl,
          favoriteSlug: gameSlugOf(banner.linkUrl),
          title: banner.title,
          tag: banner.tag,
          description: banner.description,
          thumbnailUrl: banner.imageUrl,
        }))}
      />
    );
  }

  const games = await getShelf("trending", HOME_TRENDING_LIMIT);

  const slides = games.slice(0, HOME_SLIDES).map((game) => ({
    id: game.slug,
    href: "/game/" + game.slug,
    favoriteSlug: game.slug,
    title: game.title,
    tag: game.categorySlug,
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
      className="aspect-[16/11] animate-pulse rounded-2xl bg-border sm:aspect-[2/1] lg:aspect-auto lg:h-[clamp(16rem,40vh,22rem)]"
    />
  );
}
