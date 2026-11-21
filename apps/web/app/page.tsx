import { gameSchema } from "@berryblue/shared";
import { env } from "@/lib/env";
import { siteConfig } from "@/lib/site";

const sample = {
  id: "5b0f3c1e-8a52-4f0e-9d51-1c2b7a3e4f10",
  slug: "test-game",
  title: "Test Game",
  thumbnailUrl: "https://example.com/thumb.png",
  embedUrl: "https://example.com/play",
  categorySlug: "puzzle",
  devices: ["mobile", "desktop"],
  provider: "self-hosted",
  createdAt: "2026-11-18T00:00:00Z",
};

const good = gameSchema.safeParse(sample);
const bad = gameSchema.safeParse({ ...sample, slug: "Bad Slug!", devices: [] });

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl p-4 md:p-8">
      <h1 className="text-2xl font-bold text-brand md:text-4xl">{siteConfig.name}</h1>
      <p className="mt-2 text-muted">Shared schema and env test</p>

      <p className="mt-4">Good game: {good.success ? "valid" : "invalid"}</p>
      <p>Bad game: {bad.success ? "valid" : "invalid"}</p>
      {!bad.success && (
        <ul className="mt-2 list-disc pl-6 text-sm text-muted">
          {bad.error.issues.map((issue, i) => (
            <li key={i}>
              {issue.path.join(".")}: {issue.message}
            </li>
          ))}
        </ul>
      )}

      <p className="mt-4">Supabase host: {new URL(env.NEXT_PUBLIC_SUPABASE_URL).host}</p>
    </main>
  );
}
