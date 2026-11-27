"use client";

import { Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore, type FocusEvent } from "react";
import { BannerFavorite } from "@/components/game/BannerFavorite";
import { ThumbBlock } from "@/components/game/ThumbBlock";
import { t } from "@/i18n";
import { cn } from "@/lib/cn";

export type HeroSlide = {
  id: string;
  href: string;
  favoriteSlug?: string | undefined;
  title: string;
  tag: string;
  description: string;
  thumbnailUrl: string;
};

// How long one slide stays.
const SLIDE_MS = 4000;

function subscribeVisibility(onChange: () => void) {
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
}

// Low Internet Mode sets data-low-internet on <html>. No autoplay there.
function subscribeLowInternet(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-low-internet"],
  });
  return () => observer.disconnect();
}

function getLowInternet() {
  return document.documentElement.hasAttribute("data-low-internet");
}

export function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  const count = slides.length;
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const tabHidden = useSyncExternalStore(
    subscribeVisibility,
    () => document.hidden,
    () => false,
  );
  // true on the server, so there is no autoplay until the browser has checked.
  const lowInternet = useSyncExternalStore(subscribeLowInternet, getLowInternet, () => true);

  const running = count > 1 && !lowInternet && !hovered && !focused && !tabHidden;

  // One timer per slide. Changing the slide (or clicking a dot) restarts it.
  useEffect(() => {
    if (!running) return;
    const id = window.setTimeout(() => {
      setIndex((current) => (current + 1) % count);
    }, SLIDE_MS);
    return () => window.clearTimeout(id);
  }, [running, index, count]);

  function go(step: number) {
    setIndex((current) => (current + step + count) % count);
  }

  function handleFocus(event: FocusEvent<HTMLElement>) {
    // Only keyboard focus pauses. A mouse click on a dot must not freeze the slideshow.
    if (event.target.matches(":focus-visible")) setFocused(true);
  }

  function handleBlur(event: FocusEvent<HTMLElement>) {
    if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
  }

  return (
    <section
      aria-roledescription="carousel"
      aria-label={t("home.slider.label")}
      className="relative isolate touch-pan-y overflow-hidden rounded-3xl bg-surface"
      // Only a real mouse pauses on hover. On a phone a tap would leave the slideshow stuck.
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") setHovered(true);
      }}
      onPointerLeave={() => setHovered(false)}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={(event) => {
        if (count < 2) return;
        if (event.key === "ArrowLeft") go(-1);
        else if (event.key === "ArrowRight") go(1);
      }}
      onTouchStart={(event) => {
        touchStartX.current = event.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(event) => {
        const start = touchStartX.current;
        touchStartX.current = null;
        if (start === null) return;
        const distance = (event.changedTouches[0]?.clientX ?? start) - start;
        if (Math.abs(distance) > 50) go(distance < 0 ? 1 : -1);
      }}
    >
      <div
        className="relative aspect-[16/11] sm:aspect-[2/1] lg:aspect-auto lg:h-[clamp(16rem,40vh,22rem)]"
        aria-live={running ? "off" : "polite"}
      >
        {slides.map((slide, i) => {
          const active = i === index;

          return (
            <div
              key={slide.id}
              role="group"
              aria-roledescription="slide"
              aria-label={t("home.slider.slide", { n: i + 1, total: count })}
              inert={!active}
              className={cn(
                "absolute inset-0 transition-opacity duration-700 ease-out motion-reduce:transition-none",
                active ? "z-[1] opacity-100" : "pointer-events-none opacity-0",
              )}
            >
              <Image
                src={slide.thumbnailUrl}
                alt=""
                fill
                sizes="(min-width: 1024px) 70vw, 100vw"
                priority={i === 0}
                className="card-thumb object-cover"
              />
              <ThumbBlock title={slide.title} className="absolute inset-0 text-8xl" />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent lg:bg-linear-to-r"
              />
              <div
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 hidden h-24 bg-linear-to-t from-black/50 to-transparent lg:block"
              />

              <div className="absolute inset-0 flex flex-col items-start justify-end gap-3 p-4 pb-12 sm:p-6 sm:pb-14 lg:p-8 lg:pb-12">
                <span className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-medium capitalize leading-none text-white backdrop-blur empty:hidden">
                  {slide.tag}
                </span>
                <div className="flex flex-col gap-1">
                  <h2 className="m-0 line-clamp-2 pb-1 text-2xl font-[600] leading-[1.2] text-white sm:text-3xl lg:max-w-lg lg:text-3xl">
                    {slide.title}
                  </h2>
                  {slide.description ? (
                    <p className="m-0 line-clamp-1 text-sm leading-snug text-white/80 lg:max-w-md lg:text-base">
                      {slide.description}
                    </p>
                  ) : null}
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={slide.href}
                    className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary px-5 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary-hover lg:h-10 lg:px-6 lg:text-sm"
                  >
                    <Play size={14} strokeWidth={1.5} fill="currentColor" aria-hidden="true" />
                    {t("game.playNow")}
                  </Link>
                  {slide.favoriteSlug ? <BannerFavorite slug={slide.favoriteSlug} /> : null}
                </div>
              </div>
            </div>
          );
        })}

        {count > 1 && (
          <ul className="absolute inset-x-0 bottom-2 z-[2] flex items-center justify-center sm:bottom-3 lg:bottom-4">
            {slides.map((slide, i) => {
              const active = i === index;

              return (
                <li key={slide.id}>
                  <button
                    type="button"
                    onClick={() => setIndex(i)}
                    aria-label={t("home.slider.goTo", { n: i + 1 })}
                    aria-current={active ? "true" : undefined}
                    className="flex h-7 cursor-pointer items-center justify-center px-1"
                  >
                    <span
                      className={cn(
                        "block size-1.5 rounded-full transition-colors duration-300",
                        active ? "bg-white" : "bg-white/40",
                      )}
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
