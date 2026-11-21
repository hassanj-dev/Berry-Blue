import type { Game } from "@berryblue/shared";
import { Button } from "@/components/ui/Button";

export type GameCardData = Pick<Game, "slug" | "title" | "categorySlug" | "devices">;

const deviceLabels = { mobile: "Mobile", tablet: "Tablet", desktop: "Desktop" } as const;

export function GameCard({ game }: { game: GameCardData }) {
  return (
    <article className="flex flex-col gap-2 rounded-2xl border border-border bg-surface p-3">
      <div
        className="flex aspect-square items-center justify-center rounded-xl bg-accent/20 text-3xl font-bold text-brand"
        aria-hidden="true"
      >
        {game.title.charAt(0)}
      </div>
      <h3 className="truncate text-sm font-semibold">{game.title}</h3>
      <p className="text-xs capitalize text-muted">{game.categorySlug}</p>
      <ul className="flex flex-wrap gap-1">
        {game.devices.map((device) => (
          <li
            key={device}
            className="rounded-md border border-border px-1.5 py-0.5 text-[10px] text-muted"
          >
            {deviceLabels[device]}
          </li>
        ))}
      </ul>
      <Button className="mt-1 w-full">Play</Button>
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
      <div className="h-3 w-1/2 rounded bg-border" />
      <div className="mt-1 h-11 rounded-xl bg-border" />
    </div>
  );
}
