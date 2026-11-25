"use client";

import Image from "next/image";
import { useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { t } from "@/i18n";
import { recordPlay } from "@/lib/play-actions";
import { addRecent } from "@/lib/recent";
import { cn } from "@/lib/cn";

type GamePlayerProps = {
  title: string;
  thumbnailUrl: string;
  embedUrl: string;
  // Buttons shown under the player (like, share ... come in later steps).
  actions?: ReactNode;
  gameId: string;
  slug: string;
};

// sandbox = the least permission the game needs inside the iframe.
// allow-same-origin is only given to games on another domain: for our own games,
// allow-scripts together with allow-same-origin would defeat the sandbox.
function sandboxFor(embedUrl: string) {
  const base = "allow-scripts allow-pointer-lock";
  return embedUrl.startsWith("/") ? base : `${base} allow-same-origin`;
}

// The browser owns the fullscreen state, so we subscribe to it instead of copying it into
// our own state. This keeps the button correct even when the user presses Esc.
function subscribeFullscreen(onChange: () => void) {
  document.addEventListener("fullscreenchange", onChange);
  return () => document.removeEventListener("fullscreenchange", onChange);
}

function subscribeNothing() {
  return () => {};
}

export function GamePlayer({
  gameId,
  slug,
  title,
  thumbnailUrl,
  embedUrl,
  actions,
}: GamePlayerProps) {
  const [playing, setPlaying] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  const isFullscreen = useSyncExternalStore(
    subscribeFullscreen,
    () => document.fullscreenElement !== null,
    () => false,
  );
  // false on the server, so the button appears after hydration. iPhone Safari stays false.
  const canFullscreen = useSyncExternalStore(
    subscribeNothing,
    () => document.fullscreenEnabled,
    () => false,
  );

  function handlePlay() {
    setPlaying(true);
    addRecent(slug);

    // Count each game once per browser session (a page refresh does not count again).
    const key = "played:" + gameId;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // Storage can be blocked (private mode). The play is still counted.
    }
    void recordPlay(gameId);
  }

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await boxRef.current?.requestFullscreen();
      }
    } catch (error) {
      console.error("Fullscreen failed:", error);
    }
  }

  return (
    <div>
      <div
        ref={boxRef}
        className={cn(
          "relative aspect-[4/3] w-full overflow-hidden border border-border bg-surface md:aspect-video",
          isFullscreen ? "rounded-none border-0" : "rounded-2xl",
        )}
      >
        {playing ? (
          <>
            <iframe
              src={embedUrl}
              title={t("game.playerTitle", { title })}
              sandbox={sandboxFor(embedUrl)}
              allow="fullscreen"
              allowFullScreen
              className="absolute inset-0 size-full border-0"
            />
            {isFullscreen && (
              <button
                type="button"
                onClick={toggleFullscreen}
                className="absolute right-3 top-3 z-10 min-h-11 rounded-full bg-background/80 px-4 text-sm font-semibold backdrop-blur"
              >
                {t("game.exitFullscreen")}
              </button>
            )}
          </>
        ) : (
          <>
            <Image
              src={thumbnailUrl}
              alt=""
              fill
              priority
              sizes="(min-width: 1152px) 1152px, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-background/50">
              <button
                type="button"
                onClick={handlePlay}
                className="rounded-full bg-brand px-8 py-4 text-lg font-bold text-brand-foreground"
              >
                {t("game.playNow")}
              </button>
            </div>
          </>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {actions}
        {canFullscreen && (
          <Button
            variant="secondary"
            className="ml-auto"
            disabled={!playing}
            onClick={toggleFullscreen}
          >
            {isFullscreen ? t("game.exitFullscreen") : t("game.fullscreen")}
          </Button>
        )}
      </div>
    </div>
  );
}
