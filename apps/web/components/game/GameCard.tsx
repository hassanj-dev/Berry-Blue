import Image from "next/image";
import Link from "next/link";
import type { Game } from "@berryblue/shared";
import { DeviceIcon } from "@/components/game/DeviceIcon";
import { t } from "@/i18n";

export type GameCardData = Pick<
  Game,
  "slug" | "title" | "categorySlug" | "devices" | "tags" | "thumbnailUrl"
>;

type GameCardProps = {
  game: GameCardData;
  priority?: boolean;
};

export function GameCard({ game, priority = false }: GameCardProps) {
  return (
    <article className="group relative flex flex-col gap-2 rounded-2xl border border-border bg-surface p-3 transition hover:border-brand">
      <div className="relative overflow-hidden rounded-xl">
        <Image
          src={game.thumbnailUrl}
          alt=""
          width={400}
          height={400}
          sizes="(min-width: 768px) 25vw, 50vw"
          priority={priority}
          className="aspect-square w-full object-cover transition group-hover:scale-105"
        />
        <button
          type="button"
          disabled
          aria-label={t("card.likeSoon")}
          className="absolute right-2 top-2 z-10 flex size-10 items-center justify-center rounded-full bg-background/80 text-muted backdrop-blur disabled:cursor-not-allowed"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21.2l7.8-7.7 1-1.1a5.5 5.5 0 0 0 0-7.8z" />
          </svg>
        </button>
      </div>

      <h3 className="truncate text-sm font-semibold">
        <Link
          href={"/game/" + game.slug}
          aria-label={t("card.playAria", { title: game.title })}
          className="after:absolute after:inset-0 after:rounded-2xl focus-visible:after:outline-2 focus-visible:after:outline-brand"
        >
          {game.title}
        </Link>
      </h3>
      <p className="-mt-1 text-xs capitalize text-muted">{game.categorySlug}</p>

      {game.tags.length > 0 && (
        <ul className="flex flex-wrap gap-1">
          {game.tags.slice(0, 2).map((tag) => (
            <li
              key={tag}
              className="rounded-md border border-border px-1.5 py-0.5 text-[10px] text-muted"
            >
              {tag}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-1 flex items-center justify-between gap-2">
        <ul aria-label={t("card.devices")} className="flex gap-1.5 text-muted">
          {game.devices.map((device) => (
            <li key={device}>
              <DeviceIcon device={device} />
              <span className="sr-only">{t(`devices.${device}`)}</span>
            </li>
          ))}
        </ul>
        <span
          aria-hidden="true"
          className="rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-brand-foreground"
        >
          {t("common.play")}
        </span>
      </div>
    </article>
  );
}

export function GameCardSkeleton() {
  return (
    <div
      className="flex animate-pulse flex-col gap-2 rounded-2xl border border-border bg-surface p-3"
      aria-hidden="true"
    >
      <div className="aspect-square rounded-xl bg-border" />
      <div className="h-4 w-3/4 rounded bg-border" />
      <div className="h-3 w-1/3 rounded bg-border" />
      <div className="h-4 w-1/2 rounded bg-border" />
      <div className="mt-1 flex items-center justify-between">
        <div className="h-4 w-12 rounded bg-border" />
        <div className="h-7 w-14 rounded-lg bg-border" />
      </div>
    </div>
  );
}
