"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { Field, fileClass, inputClass, textareaClass } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { updateGame, type EditGameState } from "@/lib/games-actions";

export type GameDefaults = {
  id: string;
  slug: string;
  title: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
  thumbnailUrl: string;
  thumbFocusX: number;
  categoryId: string;
  tags: string;
};

export type CategoryOption = { id: string; name: string };

const initialState: EditGameState = { error: null };

export function GameEditForm({
  game,
  categories,
}: {
  game: GameDefaults;
  categories: CategoryOption[];
}) {
  const [state, formAction, pending] = useActionState(updateGame, initialState);
  const [focus, setFocus] = useState(game.thumbFocusX);
  const [preview, setPreview] = useState(game.thumbnailUrl);
  const [localUrl, setLocalUrl] = useState<string | null>(null);

  // Free the temporary preview link of a chosen file.
  useEffect(
    () => () => {
      if (localUrl) URL.revokeObjectURL(localUrl);
    },
    [localUrl],
  );

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-5">
      <input type="hidden" name="gameId" value={game.id} />

      <Card className="flex flex-col gap-4">
        <Field label="Title">
          <input
            name="title"
            required
            maxLength={100}
            defaultValue={game.title}
            className={inputClass}
          />
        </Field>
        <Field label="Description (shown on the game page)">
          <textarea
            name="description"
            rows={5}
            maxLength={2000}
            defaultValue={game.description}
            className={textareaClass}
          />
        </Field>
      </Card>

      <Card className="flex flex-col gap-4">
        <Field label="Category">
          <select name="categoryId" required defaultValue={game.categoryId} className={inputClass}>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </Field>
        <Field
          label="Tags"
          hint="Separate with commas, e.g. word puzzle, kids. Letters, numbers and dashes only."
        >
          <input name="tags" defaultValue={game.tags} className={inputClass} />
        </Field>
      </Card>

      <Card className="flex flex-col gap-4">
        <h2 className="text-base font-semibold">SEO (Google)</h2>
        <Field
          label="Title tag"
          hint="Up to 70 characters, about 60 is best. Leave empty to use the game title."
        >
          <input
            name="metaTitle"
            maxLength={70}
            defaultValue={game.metaTitle}
            className={inputClass}
          />
        </Field>
        <Field
          label="Meta description"
          hint="Up to 160 characters. Leave empty to use the description above."
        >
          <textarea
            name="metaDescription"
            rows={3}
            maxLength={160}
            defaultValue={game.metaDescription}
            className={textareaClass}
          />
        </Field>
      </Card>

      <Card className="flex flex-col gap-4">
        <h2 className="text-base font-semibold">Thumbnail</h2>
        <div className="flex flex-wrap items-start gap-5">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-muted">How the game card shows it</span>
            <div className="relative aspect-[4/5] w-40 overflow-hidden rounded-2xl border border-border bg-background">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt=""
                className="absolute inset-0 size-full object-cover"
                style={{ objectPosition: `${focus}% 50%` }}
              />
            </div>
          </div>
          <div className="flex min-w-48 flex-1 flex-col gap-2">
            <label htmlFor="thumbFocusX" className="text-sm font-medium">
              Card focus (which part of a wide image to show)
            </label>
            <input
              id="thumbFocusX"
              type="range"
              name="thumbFocusX"
              min={0}
              max={100}
              value={focus}
              onChange={(event) => setFocus(Number(event.target.value))}
              className="w-full accent-[var(--brand)]"
            />
            <div className="flex gap-2">
              {[
                ["Left", 0],
                ["Center", 50],
                ["Right", 100],
              ].map(([label, value]) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setFocus(value as number)}
                  className="rounded-full border border-border px-3 py-1 text-xs hover:border-brand"
                >
                  {label}
                </button>
              ))}
            </div>
            <span className="text-xs text-muted">
              Only changes the card. The game page and slider show the whole image.
            </span>
          </div>
        </div>
        <Field
          label="Upload a new image"
          hint="Best: at least 800 × 1000 px, subject in the centre. Large images are scaled down to 1200 px. Max 5 MB."
        >
          <input
            type="file"
            name="thumbnail"
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
            className={fileClass}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) {
                setLocalUrl(null);
                setPreview(game.thumbnailUrl);
                return;
              }
              const url = URL.createObjectURL(file);
              setLocalUrl(url);
              setPreview(url);
            }}
          />
        </Field>
        <Field
          label="Or paste an image link"
          hint="https:// only. Used only if no file is chosen. The thumbnail job downloads and optimises it."
        >
          <input name="thumbnailUrl" type="url" placeholder="https://" className={inputClass} />
        </Field>
      </Card>

      {state.error && (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save changes"}
        </Button>
        <Link href="/games" className="text-sm text-muted hover:text-foreground">
          Cancel
        </Link>
      </div>
    </form>
  );
}
