import Image from "next/image";
import Link from "next/link";
import { FavoriteAction } from "@/components/game/FavoriteButton";
import { ThumbBlock } from "@/components/game/ThumbBlock";
import { t } from "@/i18n";
import { getShelf } from "@/lib/games";

// Desktop only. The most trending game, big. Phones get the Trending carousel instead.
export async function HomeHero() {
  // Same arguments as the Trending shelf on the home page, so both read one cache entry.
  const [game] = await getShelf("trending", 9);
  if (!game) return null;

  return (
    <section
      aria-labelledby="hero-title"
      className="relative hidden min-h-72 items-center overflow-hidden rounded-3xl bg-surface lg:flex"
    >
      <div className="absolute inset-y-0 right-0 w-3/5">
        <Image
          src={game.thumbnailUrl}
          alt=""
          fill
          sizes="60vw"
          priority
          className="card-thumb object-cover"
        />
        <ThumbBlock title={game.title} className="absolute inset-0 text-8xl" />
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-linear-to-r from-surface from-35% via-surface/60 to-transparent"
      />

      <div className="relative z-[1] flex max-w-md flex-col items-start gap-4 p-10">
        <p className="text-sm capitalize text-muted">{game.categorySlug}</p>
        <h2 id="hero-title" className="text-4xl font-[600] leading-tight">
          {game.title}
        </h2>
        {game.description ? <p className="line-clamp-2 text-muted">{game.description}</p> : null}
        <div className="mt-2 flex items-center gap-3">
          <Link
            href={"/game/" + game.slug}
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-primary px-8 text-base font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            {t("game.playNow")}
          </Link>
          <FavoriteAction slug={game.slug} />
        </div>
      </div>
    </section>
  );
}
