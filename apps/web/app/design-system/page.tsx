import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { GameCard, GameCardSkeleton, type GameCardData } from "@/components/game/GameCard";
import { Mascot } from "@/components/shared/Mascot";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Design system",
  robots: { index: false, follow: false },
};

const swatches = [
  { name: "background", className: "bg-background" },
  { name: "surface", className: "bg-surface" },
  { name: "border", className: "bg-border" },
  { name: "muted", className: "bg-muted" },
  { name: "brand", className: "bg-brand" },
  { name: "accent", className: "bg-accent" },
];

const games: GameCardData[] = [
  {
    slug: "puzzle-blocks",
    title: "Puzzle Blocks",
    categorySlug: "puzzle",
    tags: ["brain", "casual"],
    devices: ["mobile", "desktop"],
    thumbnailUrl: "/thumbs/puzzle-blocks.svg",
  },
  {
    slug: "speed-racer",
    title: "Speed Racer",
    categorySlug: "racing",
    tags: ["cars", "fast"],
    devices: ["mobile", "tablet", "desktop"],
    thumbnailUrl: "/thumbs/speed-racer.svg",
  },
  {
    slug: "word-quest",
    title: "Word Quest",
    categorySlug: "word",
    tags: ["letters"],
    devices: ["mobile"],
    thumbnailUrl: "/thumbs/word-quest.svg",
  },
  {
    slug: "tower-guard",
    title: "Tower Guard",
    categorySlug: "strategy",
    tags: [],
    devices: ["desktop"],
    thumbnailUrl: "/thumbs/tower-guard.svg",
  },
];
function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="mb-4 border-b border-border pb-2 text-lg font-bold">{title}</h2>
      {children}
    </section>
  );
}

export default function DesignSystemPage() {
  return (
    <main className="mx-auto max-w-5xl p-4 md:p-8">
      <h1 className="text-2xl font-bold text-brand md:text-4xl">{siteConfig.name} design system</h1>
      <p className="mt-2 text-muted">
        Internal page: colours, buttons, cards, mascot, mobile preview.
      </p>

      <Section title="Colours">
        <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
          {swatches.map((s) => (
            <div key={s.name}>
              <div className={"h-16 rounded-lg border border-border " + s.className} />
              <p className="mt-1 text-xs text-muted">{s.name}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Typography">
        <p className="text-3xl font-bold">Heading large</p>
        <p className="text-xl font-semibold">Heading medium</p>
        <p>Body text for descriptions and paragraphs.</p>
        <p className="text-sm text-muted">Small muted text for hints and labels.</p>
      </Section>

      <Section title="Buttons">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button size="lg">Large</Button>
          <Button disabled>Disabled</Button>
        </div>
      </Section>

      <Section title="Mascot (placeholder)">
        <div className="flex items-end gap-4">
          <Mascot size={64} />
          <Mascot size={96} />
          <Mascot size={144} />
        </div>
      </Section>

      <Section title="Game cards">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {games.map((game) => (
            <GameCard key={game.slug} game={game} />
          ))}
        </div>
        <h3 className="mb-3 mt-6 text-sm font-semibold text-muted">Loading skeletons</h3>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {games.map((game) => (
            <GameCardSkeleton key={game.slug} />
          ))}
        </div>
      </Section>

      <Section title="Mobile preview (375px)">
        <div className="mx-auto w-[375px] max-w-full rounded-[2rem] border-4 border-border bg-background p-3">
          <p className="mb-3 text-center font-bold text-brand">{siteConfig.name}</p>
          <div className="grid grid-cols-2 gap-3">
            {games.map((game) => (
              <GameCard key={game.slug} game={game} />
            ))}
          </div>
        </div>
      </Section>
    </main>
  );
}
