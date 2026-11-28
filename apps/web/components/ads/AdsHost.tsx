"use client";

import { X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { pickAd } from "./pick";

type Ad = {
  id: string;
  kind: "popup" | "notification";
  mode: "image" | "layout";
  image_url: string | null;
  title: string | null;
  body: string | null;
  button_text: string | null;
  link_url: string;
  show_countdown: boolean;
  ends_at: string | null;
  pages: "all" | "home" | "game";
  device: "all" | "mobile" | "desktop";
  delay_min: number;
  delay_max: number;
  auto_close: number;
  frequency: "visit" | "daily" | "days" | "hours" | "once";
  repeat_days?: number;
  repeat_hours?: number;
  weight?: number;
  rotation?: "shuffle" | "priority";
};

// At least this long between two ads in the same visit.
const GAP_MS = 60_000;

function isAd(value: unknown): value is Ad {
  if (typeof value !== "object" || value === null) return false;
  const ad = value as Record<string, unknown>;
  return (
    typeof ad.id === "string" &&
    (ad.kind === "popup" || ad.kind === "notification") &&
    (ad.mode === "image" || ad.mode === "layout") &&
    typeof ad.link_url === "string" &&
    typeof ad.delay_min === "number" &&
    typeof ad.delay_max === "number" &&
    typeof ad.auto_close === "number"
  );
}

function parseAds(data: unknown): Ad[] {
  if (typeof data !== "object" || data === null || !("ads" in data)) return [];
  return Array.isArray(data.ads) ? data.ads.filter(isAd) : [];
}

// Storage can be blocked (private mode): then the ad is simply not limited.
function read(store: "session" | "local", key: string): string | null {
  try {
    return (store === "session" ? sessionStorage : localStorage).getItem(key);
  } catch {
    return null;
  }
}

function write(store: "session" | "local", key: string, value: string) {
  try {
    (store === "session" ? sessionStorage : localStorage).setItem(key, value);
  } catch {
    // ignore
  }
}

const today = () => new Date().toISOString().slice(0, 10);

function seen(ad: Ad): boolean {
  const key = "ad:" + ad.id;
  if (ad.frequency === "once") return read("local", key) !== null;
  if (ad.frequency === "daily") return read("local", key) === today();
  if (ad.frequency === "hours") {
    const last = Number(read("local", key));
    const wait = Math.max(1, ad.repeat_hours ?? 6) * 3_600_000;
    return last > 0 && Date.now() - last < wait;
  }
  if (ad.frequency === "days") {
    const last = Number(read("local", key));
    const wait = Math.max(1, ad.repeat_days ?? 3) * 86_400_000;
    return last > 0 && Date.now() - last < wait;
  }
  return read("session", key) !== null;
}

function markSeen(ad: Ad) {
  const key = "ad:" + ad.id;
  if (ad.frequency === "once") write("local", key, "1");
  else if (ad.frequency === "daily") write("local", key, today());
  else if (ad.frequency === "hours") write("local", key, String(Date.now()));
  else if (ad.frequency === "days") write("local", key, String(Date.now()));
  else write("session", key, "1");
  write("session", "ad:last", String(Date.now()));
  write("local", "ad:lastid", ad.id);
}

export function AdsHost() {
  const pathname = usePathname();
  const [ad, setAd] = useState<Ad | null>(null);
  const showing = useRef(false);
  const close = useCallback(() => {
    showing.current = false;
    setAd(null);
  }, []);

  useEffect(() => {
    const page = pathname === "/" ? "home" : pathname.startsWith("/game/") ? "game" : "other";
    const mobile = window.matchMedia("(max-width: 1023px)").matches;
    // Test mode: open any page with ?adtest=1 to skip the "already seen", gap and delay rules.
    // ?adtest=1 (any ad), ?adtest=popup or ?adtest=notification (only that type).
    const testParam = new URLSearchParams(window.location.search).get("adtest");
    const test = testParam !== null && testParam !== "0";
    const forceKind = testParam === "popup" || testParam === "notification" ? testParam : null;
    // One ad at a time: never start another while one is on screen or just closed.
    if (showing.current) return;
    if (!test && Date.now() - Number(read("session", "ad:last") ?? 0) < GAP_MS) return;

    const controller = new AbortController();
    let timer: number | undefined;
    let cancelled = false;

    (async () => {
      try {
        const response = await fetch("/api/ads", { signal: controller.signal });
        if (!response.ok) return;
        const all = parseAds(await response.json());
        const eligible = all.filter(
          (item) =>
            (item.pages === "all" || item.pages === page) &&
            (item.device === "all" || (item.device === "mobile") === mobile) &&
            (!forceKind || item.kind === forceKind) &&
            (test || !seen(item)),
        );
        if (test)
          console.info(
            `[ads] page="${page}" mobile=${mobile} fromServer=${all.length} eligible=${eligible.length}`,
          );
        if (eligible.length === 0) return;

        const pick = pickAd(eligible, read("local", "ad:lastid"));
        if (!pick) return;
        const min = Math.min(pick.delay_min, pick.delay_max);
        const max = Math.max(pick.delay_min, pick.delay_max);
        const wait = test ? 1000 : (min + Math.random() * (max - min)) * 1000;

        timer = window.setTimeout(() => {
          if (cancelled || showing.current) return;
          showing.current = true;
          markSeen(pick);
          setAd(pick);
        }, wait);
      } catch (error) {
        if (!controller.signal.aborted) console.error("Ads failed:", error);
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [pathname]);

  if (!ad) return null;
  return <AdView key={ad.id} ad={ad} onClose={close} />;
}

// Animation for the progress line (shared by both ad types).
const AD_CSS = `
@keyframes ad-bar { from { transform: scaleX(1) } to { transform: scaleX(0) } }
@media (prefers-reduced-motion: reduce) { .ad-anim { animation: none !important } }
`;

const SPRING = "ease-[cubic-bezier(0.34,1.56,0.64,1)]";

function subscribeToSecond(onTick: () => void) {
  const id = window.setInterval(onTick, 1000);
  return () => window.clearInterval(id);
}

const readSecond = (): number | null => Math.floor(Date.now() / 1000) * 1000;
const readSecondOnServer = (): number | null => null;

function Countdown({ endsAt }: { endsAt: string }) {
  const now = useSyncExternalStore(subscribeToSecond, readSecond, readSecondOnServer);

  if (now === null) return null;
  const left = new Date(endsAt).getTime() - now;
  if (!(left > 0)) return null;

  const parts: [string, number][] = [
    ["Days", Math.floor(left / 86_400_000)],
    ["Hours", Math.floor(left / 3_600_000) % 24],
    ["Minutes", Math.floor(left / 60_000) % 60],
    ["Seconds", Math.floor(left / 1000) % 60],
  ];

  return (
    <div className="grid grid-cols-4 gap-2" aria-hidden="true">
      {parts.map(([label, value]) => (
        <div key={label} className="flex flex-col items-center rounded-2xl bg-foreground/10 py-2.5">
          <span className="font-mono text-xl font-extrabold tabular-nums leading-none">
            {String(value).padStart(2, "0")}
          </span>
          <span className="mt-1 text-[10px] uppercase tracking-wide text-muted">{label}</span>
        </div>
      ))}
    </div>
  );
}

// Popup chrome, placed inside the (relative, overflow-hidden) ad box:
// X at the top right, small black "AD" tag at the bottom left, and a loading line
// along the bottom edge that empties while the ad waits to close by itself.
function PopupChrome({
  seconds,
  onClose,
  barClass,
}: {
  seconds: number;
  onClose: () => void;
  barClass: string;
}) {
  return (
    <>
      <button
        type="button"
        aria-label="Close ad"
        onClick={onClose}
        className="absolute right-2 top-2 z-10 flex size-8 cursor-pointer items-center justify-center rounded-full bg-black/65 text-white ring-1 ring-white/25 transition hover:bg-black/85 active:scale-90"
      >
        <X size={16} strokeWidth={2.5} aria-hidden="true" />
      </button>

      <span className="pointer-events-none absolute bottom-2.5 left-2 z-10 rounded bg-black px-1.5 py-[3px] text-[9px] font-semibold leading-none tracking-wider text-white">
        AD
      </span>

      {seconds > 0 && (
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[3px] bg-black/30"
          aria-hidden="true"
        >
          <div
            className={`ad-anim h-full w-full origin-left ${barClass}`}
            style={{ animation: `ad-bar ${seconds}s linear forwards` }}
          />
        </div>
      )}
    </>
  );
}

function AdView({ ad, onClose }: { ad: Ad; onClose: () => void }) {
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setEntered(true));
    const timer = ad.auto_close > 0 ? window.setTimeout(onClose, ad.auto_close * 1000) : undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
      window.removeEventListener("keydown", onKey);
    };
  }, [ad.auto_close, onClose]);

  const external = /^https?:\/\//i.test(ad.link_url);
  const linkProps = {
    href: ad.link_url,
    onClick: onClose,
    ...(external ? { target: "_blank", rel: "noopener noreferrer sponsored" } : {}),
  };
  const alt = ad.title ?? "Advertisement";
  const imageMode = ad.mode === "image" && !!ad.image_url;

  if (ad.kind === "popup") {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Advertisement"
        onClick={(event) => {
          if (event.target === event.currentTarget) onClose();
        }}
        className={`fixed inset-0 z-[70] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm transition-opacity duration-300 ${entered ? "opacity-100" : "opacity-0"}`}
      >
        <style>{AD_CSS}</style>

        <div
          className={`relative transition duration-500 ${SPRING} ${entered ? "translate-y-0 scale-100 opacity-100" : "translate-y-6 scale-90 opacity-0"}`}
        >
          {imageMode ? (
            // Full design: the image is shown as uploaded, with the X, AD tag and loading line on top.
            // Note: for a transparent PNG these sit on the edges of the image box, not its cut-out shape.
            <div className="relative overflow-hidden rounded-2xl">
              <a {...linkProps} className="block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={ad.image_url ?? ""}
                  alt={alt}
                  draggable={false}
                  className="block h-auto max-h-[72dvh] w-auto max-w-[min(36rem,calc(100vw-2rem))]"
                />
              </a>
              <PopupChrome seconds={ad.auto_close} onClose={onClose} barClass="bg-primary" />
            </div>
          ) : (
            <div className="relative w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-[28px] bg-surface p-2 shadow-2xl ring-1 ring-white/10">
              {ad.image_url && (
                <div className="relative overflow-hidden rounded-3xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={ad.image_url}
                    alt=""
                    className="block aspect-[2/1] w-full object-cover"
                  />
                </div>
              )}
              <div className="flex flex-col gap-3 px-3 pb-9 pt-4">
                {ad.title && (
                  <p
                    className={`text-2xl font-extrabold leading-tight tracking-tight ${ad.image_url ? "" : "pr-8"}`}
                  >
                    {ad.title}
                  </p>
                )}
                {ad.body && <p className="text-[15px] leading-snug text-muted">{ad.body}</p>}
                {ad.show_countdown && ad.ends_at && <Countdown endsAt={ad.ends_at} />}
                <a
                  {...linkProps}
                  className="mt-1 flex h-14 items-center justify-center rounded-2xl bg-primary px-4 text-base font-bold text-primary-foreground transition hover:brightness-110 active:scale-[0.98]"
                >
                  {ad.button_text ?? "Open"}
                </a>
              </div>
              <PopupChrome seconds={ad.auto_close} onClose={onClose} barClass="bg-primary" />
            </div>
          )}
        </div>
      </div>
    );
  }

  const wrapper = `fixed inset-x-3 bottom-20 z-[70] transition duration-500 ${SPRING} sm:inset-x-auto sm:right-5 sm:w-[22rem] lg:bottom-5 ${entered ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"}`;

  if (imageMode) {
    // Full design: no frame at all. Just the picture in its own shape (not cropped, no card,
    // border, shadow or loading bar), so a transparent PNG shows only its cut-out shape.
    return (
      <div
        role="complementary"
        aria-label="Advertisement"
        className={`${wrapper} flex justify-end`}
      >
        <style>{AD_CSS}</style>
        <div className="relative w-fit max-w-full">
          <a {...linkProps} className="block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={ad.image_url ?? ""}
              alt={alt}
              draggable={false}
              className="block h-auto max-h-[45dvh] w-auto max-w-full"
            />
          </a>
          <button
            type="button"
            aria-label="Close ad"
            onClick={onClose}
            className="absolute right-1 top-1 z-10 flex size-7 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white ring-1 ring-white/25 transition hover:bg-black/80"
          >
            <X size={14} strokeWidth={2.5} aria-hidden="true" />
          </button>
          <span className="pointer-events-none absolute left-1 top-1 rounded bg-black px-1.5 py-[3px] text-[9px] font-semibold leading-none tracking-wider text-white">
            AD
          </span>
        </div>
      </div>
    );
  }

  return (
    <div role="complementary" aria-label="Advertisement" className={wrapper}>
      <style>{AD_CSS}</style>
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-surface shadow-2xl ring-1 ring-black/10">
        <button
          type="button"
          aria-label="Close ad"
          onClick={onClose}
          className="absolute right-2 top-2 z-10 flex size-7 cursor-pointer items-center justify-center rounded-full bg-black/45 text-white backdrop-blur transition hover:bg-black/70"
        >
          <X size={14} strokeWidth={2.5} aria-hidden="true" />
        </button>

        <div className="flex items-start gap-3 p-3.5 pr-11">
          {ad.image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={ad.image_url} alt="" className="size-16 shrink-0 rounded-xl object-cover" />
          )}
          <div className="flex min-w-0 flex-col gap-1">
            <span className="text-[10px] font-medium uppercase tracking-wide text-muted">
              Sponsored
            </span>
            {ad.title && <p className="truncate text-[15px] font-bold leading-tight">{ad.title}</p>}
            {ad.body && (
              <p className="line-clamp-2 text-[13px] leading-snug text-muted">{ad.body}</p>
            )}
            <a
              {...linkProps}
              className="mt-1.5 flex h-8 w-fit items-center rounded-full bg-primary px-4 text-xs font-bold text-primary-foreground transition hover:brightness-110 active:scale-95"
            >
              {ad.button_text ?? "Open"}
            </a>
          </div>
        </div>

        {ad.auto_close > 0 && (
          <div
            className="ad-anim absolute bottom-0 left-0 h-[3px] w-full origin-left bg-primary"
            style={{ animation: `ad-bar ${ad.auto_close}s linear forwards` }}
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  );
}
