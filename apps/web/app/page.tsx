import { siteConfig } from "@/lib/site";

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl p-4 md:p-8">
      <h1 className="text-2xl font-bold text-brand md:text-4xl">
        {siteConfig.name}
      </h1>
      <p className="mt-2 text-muted">Design tokens test page</p>

      <div className="mt-6 flex flex-wrap gap-3">
        <button className="rounded-xl bg-brand px-4 py-2 font-semibold text-brand-foreground">
          Play
        </button>
        <button className="rounded-xl border border-border bg-surface px-4 py-2 font-semibold">
          Details
        </button>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-border bg-surface p-3"
          >
            <div className="aspect-square rounded-xl bg-accent/20" />
            <p className="mt-2 text-sm font-semibold">Game {i + 1}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
