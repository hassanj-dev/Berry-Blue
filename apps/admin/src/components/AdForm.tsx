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
import { saveAd, type AdFormState } from "@/lib/ads-actions";

export type AdRow = {
  id: string;
  name: string;
  kind: "popup" | "notification";
  mode: "image" | "layout";
  image_url: string | null;
  title: string | null;
  body: string | null;
  button_text: string | null;
  link_url: string | null;
  show_countdown: boolean;
  pages: "all" | "home" | "game";
  device: "all" | "mobile" | "desktop";
  delay_min: number;
  delay_max: number;
  auto_close: number;
  frequency: "visit" | "daily" | "once" | "days" | "hours";
  repeat_days?: number;
  repeat_hours?: number;
  rotation?: "shuffle" | "priority";
  weight?: number;
  starts_at: string | null;
  ends_at: string | null;
  active: boolean;
  created_at: string;
};

const MAX_BYTES = 500 * 1024;

// Cuts empty (fully transparent) edges off a PNG/WebP, so a cut-out shape has no invisible
// margin that shows up as a dark strip on the site. Returns null when there is nothing to cut.
async function trimTransparent(file: File): Promise<File | null> {
  try {
    const bitmap = await createImageBitmap(file);
    const { width, height } = bitmap;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;
    ctx.drawImage(bitmap, 0, 0);
    const { data } = ctx.getImageData(0, 0, width, height);

    let top = height,
      left = width,
      right = -1,
      bottom = -1;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (data[(y * width + x) * 4 + 3] > 16) {
          if (x < left) left = x;
          if (x > right) right = x;
          if (y < top) top = y;
          if (y > bottom) bottom = y;
        }
      }
    }
    if (right < 0) return null; // fully transparent: leave as is
    const w = right - left + 1;
    const h = bottom - top + 1;
    if (w === width && h === height) return null;

    const out = document.createElement("canvas");
    out.width = w;
    out.height = h;
    out.getContext("2d")?.drawImage(canvas, left, top, w, h, 0, 0, w, h);
    const blob = await new Promise<Blob | null>((resolve) => out.toBlob(resolve, "image/png"));
    if (!blob || blob.size > MAX_BYTES) return null;
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".png", { type: "image/png" });
  } catch {
    return null;
  }
}

const inputClass =
  "h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm placeholder:text-muted focus:border-border-strong focus-visible:outline-none";
const labelClass = "flex flex-col gap-1 text-sm font-medium";
const hintClass = "text-xs font-normal text-muted";

// Recommended image size for each ad type and style.
function target(kind: AdRow["kind"], mode: AdRow["mode"]) {
  if (mode === "image") return kind === "popup" ? { w: 800, h: 1000 } : { w: 400, h: 200 };
  return kind === "popup" ? { w: 800, h: 400 } : { w: 200, h: 200 };
}

function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const p = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}T${p(date.getHours())}:${p(date.getMinutes())}`;
}

export function AdForm({ ad }: { ad?: AdRow }) {
  const [state, formAction, pending] = useActionState<AdFormState, FormData>(saveAd, {
    error: null,
  });
  const [kind, setKind] = useState<AdRow["kind"]>(ad?.kind ?? "popup");
  const [mode, setMode] = useState<AdRow["mode"]>(ad?.mode ?? "image");
  const [title, setTitle] = useState(ad?.title ?? "");
  const [body, setBody] = useState(ad?.body ?? "");
  const [button, setButton] = useState(ad?.button_text ?? "");
  const [frequency, setFrequency] = useState<AdRow["frequency"]>(ad?.frequency ?? "visit");
  const [countdown, setCountdown] = useState(ad?.show_countdown ?? false);
  const [preview, setPreview] = useState<string | null>(ad?.image_url ?? null);
  const [imageNote, setImageNote] = useState<string | null>(null);
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const blobUrl = useRef<string | null>(null);

  // Dates are set after mount so they show in the browser's own time zone.
  useEffect(() => {
    setStartsAt(toLocalInput(ad?.starts_at ?? null));
    setEndsAt(toLocalInput(ad?.ends_at ?? null));
  }, [ad?.starts_at, ad?.ends_at]);

  useEffect(() => {
    return () => {
      if (blobUrl.current) URL.revokeObjectURL(blobUrl.current);
    };
  }, []);

  const size = target(kind, mode);

  async function onFile(event: ChangeEvent<HTMLInputElement>) {
    const input = event.target;
    let file = input.files?.[0];
    setImageNote(null);
    if (!file) return;
    if (file.size > MAX_BYTES) {
      setImageNote("Image is bigger than 500 KB. Please compress it.");
      event.target.value = "";
      return;
    }

    let trimmed = false;
    if (mode === "image" && (file.type === "image/png" || file.type === "image/webp")) {
      const cut = await trimTransparent(file);
      if (cut) {
        const transfer = new DataTransfer();
        transfer.items.add(cut);
        input.files = transfer.files; // this is the file that gets saved
        file = cut;
        trimmed = true;
      }
    }

    const url = URL.createObjectURL(file);
    if (blobUrl.current) URL.revokeObjectURL(blobUrl.current);
    blobUrl.current = url;
    setPreview(url);

    const probe = new Image();
    probe.onload = () => {
      if (trimmed) setImageNote("Empty transparent edges were trimmed automatically.");
      const ratio = probe.naturalWidth / probe.naturalHeight;
      if (mode !== "image" && Math.abs(ratio - size.w / size.h) > 0.05) {
        setImageNote(
          `This image is ${probe.naturalWidth}×${probe.naturalHeight}. Recommended ${size.w}×${size.h}; it will be cropped to fit.`,
        );
      }
    };
    probe.src = url;
  }

  // Submitting by hand keeps what you typed if the server finds a problem.
  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    data.set("starts_at", startsAt ? new Date(startsAt).toISOString() : "");
    data.set("ends_at", endsAt ? new Date(endsAt).toISOString() : "");
    startTransition(() => formAction(data));
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="flex flex-col gap-5">
        {ad && <input type="hidden" name="id" value={ad.id} />}

        <label className={labelClass}>
          Name (only you see this)
          <input
            name="name"
            required
            maxLength={80}
            defaultValue={ad?.name ?? ""}
            className={inputClass}
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className={labelClass}>
            Type
            <select
              name="kind"
              value={kind}
              onChange={(event) => setKind(event.target.value as AdRow["kind"])}
              className={inputClass}
            >
              <option value="popup">Popup (centre of the screen)</option>
              <option value="notification">Notification (small, in the corner)</option>
            </select>
          </label>
          <label className={labelClass}>
            Style
            <select
              name="mode"
              value={mode}
              onChange={(event) => setMode(event.target.value as AdRow["mode"])}
              className={inputClass}
            >
              <option value="image">Full design (I upload one image)</option>
              <option value="layout">Our layout (image, title, text, button)</option>
            </select>
          </label>
        </div>

        <label className={labelClass}>
          Image {mode === "layout" && "(optional)"}
          <input
            type="file"
            name="image"
            accept="image/png,image/jpeg,image/webp"
            onChange={onFile}
            className="text-sm file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-foreground/10 file:px-3 file:py-2 file:text-sm file:font-medium"
          />
          <span className={hintClass}>
            {mode === "image" && kind === "popup"
              ? "Any shape works: landscape, portrait or square. PNG, JPG or WebP, up to 500 KB. For a transparent (background removed) image use WebP or PNG: it is shown with no frame. If the PNG is over 500 KB, save it as WebP (keeps transparency, much smaller)."
              : `Recommended ${size.w}×${size.h} px. PNG, JPG or WebP, up to 500 KB.`}
          </span>
          {imageNote && (
            <span role="status" className="text-xs font-normal text-amber-400">
              {imageNote}
            </span>
          )}
        </label>

        {mode === "layout" && (
          <>
            <label className={labelClass}>
              Title
              <input
                name="title"
                maxLength={80}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={inputClass}
              />
            </label>
            <label className={labelClass}>
              Text
              <textarea
                name="body"
                maxLength={200}
                rows={3}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className={inputClass + " h-auto py-2"}
              />
            </label>
            <label className={labelClass}>
              Button text
              <input
                name="button_text"
                maxLength={30}
                value={button}
                onChange={(e) => setButton(e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                name="show_countdown"
                checked={countdown}
                onChange={(e) => setCountdown(e.target.checked)}
              />
              Show countdown to the end date
            </label>
          </>
        )}

        <label className={labelClass}>
          Link (where a click goes)
          <input
            name="link_url"
            required
            placeholder="https://example.com/offer"
            defaultValue={ad?.link_url ?? ""}
            className={inputClass}
          />
        </label>

        <fieldset className="grid gap-4 rounded-2xl border border-border p-4 sm:grid-cols-2">
          <legend className="px-2 text-sm font-semibold">When it shows</legend>
          <label className={labelClass}>
            Page
            <select name="pages" defaultValue={ad?.pages ?? "all"} className={inputClass}>
              <option value="all">All pages</option>
              <option value="home">Home only</option>
              <option value="game">Game pages only</option>
            </select>
          </label>
          <label className={labelClass}>
            Device
            <select name="device" defaultValue={ad?.device ?? "all"} className={inputClass}>
              <option value="all">Mobile and desktop</option>
              <option value="mobile">Mobile only</option>
              <option value="desktop">Desktop only</option>
            </select>
          </label>
          <label className={labelClass}>
            Earliest (seconds after page opens)
            <input
              name="delay_min"
              type="number"
              min={0}
              max={600}
              defaultValue={ad?.delay_min ?? 5}
              className={inputClass}
            />
          </label>
          <label className={labelClass}>
            Latest (seconds)
            <input
              name="delay_max"
              type="number"
              min={0}
              max={600}
              defaultValue={ad?.delay_max ?? 30}
              className={inputClass}
            />
            <span className={hintClass}>Each visitor gets a random time between the two.</span>
          </label>
          <label className={labelClass}>
            Close by itself after (seconds)
            <input
              name="auto_close"
              type="number"
              min={0}
              max={120}
              defaultValue={ad?.auto_close ?? 10}
              className={inputClass}
            />
            <span className={hintClass}>0 = stays until the visitor closes it.</span>
          </label>
          <label className={labelClass}>
            How often
            <select
              name="frequency"
              value={frequency}
              onChange={(event) => setFrequency(event.target.value as AdRow["frequency"])}
              className={inputClass}
            >
              <option value="visit">Once per visit (browser session)</option>
              <option value="daily">Once a day</option>
              <option value="hours">Once every few hours</option>
              <option value="days">Once every few days</option>
              <option value="once">Only once, ever</option>
            </select>
          </label>
          {frequency === "hours" && (
            <label className={labelClass}>
              Show again after (hours)
              <input
                name="repeat_hours"
                type="number"
                min={1}
                max={720}
                defaultValue={ad?.repeat_hours ?? 6}
                className={inputClass}
              />
              <span className={hintClass}>
                The same visitor sees this ad only once in this many hours.
              </span>
            </label>
          )}
          {frequency === "days" && (
            <label className={labelClass}>
              Show again after (days)
              <input
                name="repeat_days"
                type="number"
                min={1}
                max={365}
                defaultValue={ad?.repeat_days ?? 3}
                className={inputClass}
              />
              <span className={hintClass}>
                The same visitor sees this ad only once in this many days.
              </span>
            </label>
          )}
          <label className={labelClass}>
            When several ads are ready
            <select name="rotation" defaultValue={ad?.rotation ?? "shuffle"} className={inputClass}>
              <option value="shuffle">Shuffle with the other ads (random)</option>
              <option value="priority">Priority: show before shuffled ads</option>
            </select>
            <span className={hintClass}>
              Only one ad shows at a time. Priority ads go first; when they are done (or off) the
              shuffled ones show.
            </span>
          </label>
          <label className={labelClass}>
            Chance (1 to 10)
            <input
              name="weight"
              type="number"
              min={1}
              max={10}
              defaultValue={ad?.weight ?? 1}
              className={inputClass}
            />
            <span className={hintClass}>
              In a shuffle, 3 shows about 3 times as often as 1. Keep 1 for equal chance.
            </span>
          </label>
          <label className={labelClass}>
            Start (optional)
            <input
              type="datetime-local"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              className={inputClass}
            />
          </label>
          <label className={labelClass}>
            End (optional)
            <input
              type="datetime-local"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
              className={inputClass}
            />
          </label>
        </fieldset>

        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" name="active" defaultChecked={ad?.active ?? true} />
          Ad is on
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
            {pending ? "Saving…" : "Save ad"}
          </button>
          <Link
            href="/ads"
            className="flex h-10 items-center rounded-xl border border-border px-5 text-sm font-medium"
          >
            Cancel
          </Link>
        </div>
      </div>

      <aside className="lg:sticky lg:top-6 lg:self-start">
        <p className="mb-2 text-sm font-semibold">Preview</p>
        <div className="flex justify-center rounded-2xl border border-border bg-black/40 p-4">
          {mode === "image" ? (
            <div className="relative">
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={preview}
                  alt=""
                  className="block h-auto max-h-72 w-auto max-w-full rounded-xl"
                />
              ) : (
                <div className="flex aspect-[4/5] w-56 items-center justify-center rounded-xl bg-surface text-xs text-muted">
                  Upload an image
                </div>
              )}
              <span className="absolute left-1.5 top-1.5 rounded bg-black px-1 py-[2px] text-[8px] font-semibold leading-none tracking-wider text-white">
                AD
              </span>
            </div>
          ) : (
            <div className="w-64 overflow-hidden rounded-xl border border-border bg-surface">
              {preview && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={preview}
                  alt=""
                  className={
                    kind === "popup"
                      ? "aspect-[2/1] w-full object-cover"
                      : "mx-3 mt-3 size-14 rounded-lg object-cover"
                  }
                />
              )}
              <div className="flex flex-col gap-1 p-3">
                <p className="font-bold">{title || "Title"}</p>
                <p className="text-sm text-muted">{body || "Text"}</p>
                {countdown && <p className="text-xs text-muted">Countdown shows here</p>}
                <span className="mt-2 flex h-9 items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground">
                  {button || "Button"}
                </span>
              </div>
            </div>
          )}
        </div>
        <p className="mt-2 text-xs text-muted">
          Rough preview. The close (X) button is added on the website.
        </p>
      </aside>
    </form>
  );
}
