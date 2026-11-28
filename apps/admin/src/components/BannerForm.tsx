"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Field, fileClass, inputClass, textareaClass } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { saveBanner, type FormState } from "@/lib/banners-actions";

export type BannerDefaults = {
  id: string;
  title: string;
  tag: string;
  description: string;
  imageUrl: string | null;
  gameId: string;
  customLink: string;
  sortOrder: number;
  isActive: boolean;
};

export type GameOption = { id: string; title: string; slug: string };

const initialState: FormState = { error: null };

export function BannerForm({ banner, games }: { banner: BannerDefaults; games: GameOption[] }) {
  const [state, formAction, pending] = useActionState(saveBanner, initialState);
  const editing = banner.id !== "";

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-5">
      <input type="hidden" name="id" value={banner.id} />

      <Card className="flex flex-col gap-4">
        <Field
          label="Banner image"
          hint="Wide image, 1600 × 800 (2:1). On phones the sides are cropped, so keep the important part in the middle. Max 5 MB."
        >
          <input
            type="file"
            name="image"
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
            required={!editing}
            className={fileClass}
          />
        </Field>
        {banner.imageUrl && (
          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-muted">
              Current image (kept if you choose no new file)
            </span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={banner.imageUrl}
              alt=""
              className="aspect-[2/1] w-full max-w-md rounded-xl border border-border object-cover"
            />
          </div>
        )}
      </Card>

      <Card className="flex flex-col gap-4">
        <Field label="Title">
          <input
            name="title"
            required
            maxLength={100}
            defaultValue={banner.title}
            className={inputClass}
          />
        </Field>
        <Field
          label="Tag (small label above the title)"
          hint="Optional, e.g. New, Popular, Puzzle."
        >
          <input name="tag" maxLength={30} defaultValue={banner.tag} className={inputClass} />
        </Field>
        <Field label="Description" hint="Optional, one short line (200 max).">
          <textarea
            name="description"
            rows={2}
            maxLength={200}
            defaultValue={banner.description}
            className={textareaClass}
          />
        </Field>
      </Card>

      <Card className="flex flex-col gap-4">
        <Field label="Play button opens this game">
          <select name="gameId" defaultValue={banner.gameId} className={inputClass}>
            <option value="">— none, use a custom link below —</option>
            {games.map((game) => (
              <option key={game.id} value={game.id}>
                {game.title}
              </option>
            ))}
          </select>
        </Field>
        <Field
          label="Or a custom link"
          hint="Used only when no game is chosen. A page on the site (/games) or an https:// address."
        >
          <input
            name="customLink"
            defaultValue={banner.customLink}
            placeholder="/games"
            className={inputClass}
          />
        </Field>
      </Card>

      <Card className="flex flex-wrap items-end gap-6">
        <Field label="Order" hint="Smallest number shows first.">
          <input
            type="number"
            name="sortOrder"
            min={0}
            max={9999}
            defaultValue={banner.sortOrder}
            className={inputClass + " w-28"}
          />
        </Field>
        <label className="flex h-11 items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={banner.isActive}
            className="size-4"
          />
          Show on the homepage
        </label>
      </Card>

      {state.error && (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : editing ? "Save banner" : "Add banner"}
        </Button>
        <Link href="/homepage" className="text-sm text-muted hover:text-foreground">
          Cancel
        </Link>
      </div>
    </form>
  );
}
