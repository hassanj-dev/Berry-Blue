"use client";

import Link from "next/link";
import {
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { saveBlog, type BlogFormState } from "@/lib/blog-actions";

export type BlogRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_url: string | null;
  status: "draft" | "published";
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

const MAX_BYTES = 500 * 1024;

const inputClass =
  "h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm placeholder:text-muted focus:border-border-strong focus-visible:outline-none";
const labelClass = "flex flex-col gap-1 text-sm font-medium";
const hintClass = "text-xs font-normal text-muted";

export function BlogForm({ post }: { post?: BlogRow }) {
  const [state, formAction, pending] = useActionState<BlogFormState, FormData>(saveBlog, {
    error: null,
  });
  const [preview, setPreview] = useState<string | null>(post?.cover_url ?? null);
  const [imageNote, setImageNote] = useState<string | null>(null);
  const [removeCover, setRemoveCover] = useState(false);
  const blobUrl = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (blobUrl.current) URL.revokeObjectURL(blobUrl.current);
    };
  }, []);

  function onFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setImageNote(null);
    if (!file) return;
    if (file.size > MAX_BYTES) {
      setImageNote("Cover is bigger than 500 KB. Please compress it.");
      event.target.value = "";
      return;
    }
    const url = URL.createObjectURL(file);
    if (blobUrl.current) URL.revokeObjectURL(blobUrl.current);
    blobUrl.current = url;
    setPreview(url);
    setRemoveCover(false);
  }

  // Submitting by hand keeps what you typed if the server finds a problem.
  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    startTransition(() => formAction(data));
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="flex flex-col gap-5">
        {post && <input type="hidden" name="id" value={post.id} />}

        <label className={labelClass}>
          Title
          <input
            name="title"
            required
            maxLength={120}
            defaultValue={post?.title ?? ""}
            className={inputClass}
          />
        </label>

        <label className={labelClass}>
          Slug (web address)
          <input
            name="slug"
            maxLength={80}
            defaultValue={post?.slug ?? ""}
            placeholder="made from the title if left empty"
            className={inputClass}
          />
          <span className={hintClass}>
            Becomes berryblue.online/blog/your-slug. English letters and numbers only. Changing it
            later breaks old links.
          </span>
        </label>

        <label className={labelClass}>
          Summary
          <textarea
            name="excerpt"
            maxLength={300}
            rows={3}
            defaultValue={post?.excerpt ?? ""}
            className="w-full rounded-xl border border-border bg-surface p-3 text-sm placeholder:text-muted focus:border-border-strong focus-visible:outline-none"
          />
          <span className={hintClass}>
            Shown on the blog list and in Google results. Up to 300 characters.
          </span>
        </label>

        <label className={labelClass}>
          Article
          <textarea
            name="content"
            rows={22}
            defaultValue={post?.content ?? ""}
            spellCheck
            className="w-full rounded-xl border border-border bg-surface p-3 font-mono text-sm placeholder:text-muted focus:border-border-strong focus-visible:outline-none"
          />
          <span className={hintClass}>
            Markdown: <code># Heading</code>, <code>## Smaller heading</code>, <code>**bold**</code>
            , <code>*italic*</code>, <code>[text](https://link)</code>,{" "}
            <code>![alt](https://image-url)</code>, <code>- list item</code>,{" "}
            <code>1. numbered</code>, <code>&gt; quote</code>. Leave an empty line between
            paragraphs.
          </span>
        </label>

        {state.error && (
          <p
            role="alert"
            className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-400"
          >
            {state.error}
          </p>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={pending}
            className="h-10 cursor-pointer rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {pending ? "Saving…" : "Save post"}
          </button>
          <Link
            href="/blog"
            className="flex h-10 items-center rounded-xl border border-border px-5 text-sm font-medium"
          >
            Cancel
          </Link>
        </div>
      </div>

      <aside className="flex flex-col gap-5 lg:sticky lg:top-6 lg:self-start">
        <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-border p-4 text-sm font-medium">
          <input
            type="checkbox"
            name="published"
            defaultChecked={post?.status === "published"}
            className="size-4 accent-[var(--color-primary,#3b82f6)]"
          />
          <span>
            Published
            <span className={hintClass + " block"}>Off = draft, only you can see it.</span>
          </span>
        </label>

        <div>
          <p className="mb-2 text-sm font-semibold">Cover image</p>
          <div className="overflow-hidden rounded-2xl border border-border bg-surface">
            {preview && !removeCover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="" className="aspect-[1200/630] w-full object-cover" />
            ) : (
              <div className="flex aspect-[1200/630] w-full items-center justify-center text-xs text-muted">
                No cover
              </div>
            )}
          </div>
          <input
            type="file"
            name="cover"
            accept="image/png,image/jpeg,image/webp"
            onChange={onFile}
            className="mt-3 block w-full text-sm file:mr-3 file:h-9 file:cursor-pointer file:rounded-lg file:border file:border-border file:bg-surface file:px-3 file:text-sm"
          />
          <p className={hintClass + " mt-1"}>PNG, JPG or WebP, up to 500 KB. Best size 1200×630.</p>
          {imageNote && <p className="mt-1 text-xs text-amber-400">{imageNote}</p>}
          {post?.cover_url && (
            <label className="mt-2 flex items-center gap-2 text-xs text-muted">
              <input
                type="checkbox"
                name="remove_cover"
                checked={removeCover}
                onChange={(event) => setRemoveCover(event.target.checked)}
              />
              Remove current cover
            </label>
          )}
        </div>
      </aside>
    </form>
  );
}
