import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { formatValidationErrors, getStaged, listCategories } from "@/lib/moderation";
import { ReviewForm } from "./ReviewForm";

export const metadata: Metadata = { title: "Review game" };

const isHttpUrl = (value: string | null): value is string => !!value && /^https?:\/\//i.test(value);

export default async function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();

  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();

  const game = await getStaged(id);
  if (!game) notFound();

  const errors = formatValidationErrors(game.validation_errors);
  const categories = game.status === "pending" ? await listCategories() : [];

  // Pre-select a category if the provider's category matches one of ours (admin can still change it).
  const providerCategory = game.provider_category?.trim().toLowerCase();
  const suggested =
    categories.find((c) => c.id === game.category_id) ??
    categories.find(
      (c) => c.slug === providerCategory || c.name.toLowerCase() === providerCategory,
    );

  const rows: [string, string][] = [
    ["Provider", game.provider],
    ["Provider game ID", game.provider_game_id],
    ["Provider category", game.provider_category ?? "-"],
    ["Slug", game.slug ?? "-"],
    ["Tags", game.tags.length ? game.tags.join(", ") : "-"],
    ["Devices", game.devices.length ? game.devices.join(", ") : "-"],
    ["Status", game.status],
  ];

  return (
    <div className="flex flex-col gap-6">
      <Link
        href={"/moderation?status=" + game.status}
        className="text-sm text-brand hover:underline"
      >
        &larr; Back to list
      </Link>

      <h1 className="text-2xl font-bold">{game.title ?? "(no title)"}</h1>

      {errors.length > 0 && (
        <div role="alert" className="rounded-2xl border border-danger p-4">
          <h2 className="font-bold text-danger">Validation errors</h2>
          <ul className="mt-2 list-disc pl-5 text-sm">
            {errors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-[16rem_1fr]">
        <div className="flex flex-col gap-3">
          {isHttpUrl(game.thumbnail_url) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={game.thumbnail_url}
              alt=""
              className="w-full rounded-2xl border border-border"
            />
          ) : (
            <p className="rounded-2xl border border-border bg-surface p-4 text-sm text-muted">
              Thumbnail: {game.thumbnail_url ?? "none"}
            </p>
          )}
          {isHttpUrl(game.embed_url) ? (
            <a
              href={game.embed_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-brand hover:underline"
            >
              Open game in a new tab
            </a>
          ) : (
            <p className="text-sm text-muted">Embed: {game.embed_url ?? "none"}</p>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <p className="text-sm">{game.description || "No description."}</p>
          <dl className="grid grid-cols-[10rem_1fr] gap-x-4 gap-y-2 text-sm">
            {rows.map(([label, value]) => (
              <div key={label} className="contents">
                <dt className="text-muted">{label}</dt>
                <dd className="break-all">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {game.status === "pending" ? (
        <ReviewForm
          stagedId={game.id}
          defaultSlug={game.slug ?? ""}
          defaultCategoryId={suggested?.id ?? ""}
          categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        />
      ) : (
        <p className="rounded-2xl border border-border bg-surface p-4 text-sm">
          This game is <strong>{game.status}</strong>, so it cannot be approved or rejected from
          here.
        </p>
      )}
    </div>
  );
}
