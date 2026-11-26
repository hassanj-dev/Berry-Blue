"use client";

import { Maximize, Minimize, Play } from "lucide-react";
import Image from "next/image";
import { useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { actionButton } from "@/components/game/action-styles";
import { ThumbBlock } from "@/components/game/ThumbBlock";
import { t } from "@/i18n";
import { recordPlay } from "@/lib/play-actions";
import { addRecent } from "@/lib/recent";
import { cn } from "@/lib/cn";

type GamePlayerProps = {
  title: string;
  thumbnailUrl: string;
  embedUrl: string;
  // First row under the player: play count, like and dislike.
  stats?: ReactNode;
  // Second row, left side: favorite and share.
  actions?: ReactNode;
  // Second row, right side, before the fullscreen button: report and phone QR.
  meta?: ReactNode;
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
  stats,
  actions,
  meta,
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

  const fullscreenLabel = isFullscreen ? t("game.exitFullscreen") : t("game.fullscreen");

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
          <iframe
            src={embedUrl}
            title={t("game.playerTitle", { title })}
            sandbox={sandboxFor(embedUrl)}
            allow="fullscreen"
            allowFullScreen
            className="absolute inset-0 size-full border-0"
          />
        ) : (
          <>
            <Image
              src={thumbnailUrl}
              alt=""
              fill
              priority
              sizes="(min-width: 1152px) 1152px, 100vw"
              className="card-thumb object-cover"
            />
            <ThumbBlock title={title} className="absolute inset-0 text-7xl" />
            <div className="absolute inset-0 flex items-center justify-center bg-background/50">
              <button
                type="button"
                onClick={handlePlay}
                className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-primary px-8 py-4 text-lg font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
              >
                <Play size={20} strokeWidth={1.5} fill="currentColor" aria-hidden="true" />
                {t("game.playNow")}
              </button>
            </div>
          </>
        )}

        {/* Inside the player box, so it is also there in fullscreen, before and during play. */}
        {isFullscreen && (
          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label={t("game.exitFullscreen")}
            title={t("game.exitFullscreen")}
            className="absolute right-3 top-3 z-10 flex size-11 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
          >
            <Minimize size={20} strokeWidth={1.5} aria-hidden="true" />
          </button>
        )}
      </div>

      <div className="relative mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2">
        <div className="flex flex-wrap items-center gap-2">{stats}</div>
        <div className="flex items-center justify-between gap-2 sm:flex-1 sm:justify-start">
          {actions}
          <div className="contents sm:ml-auto sm:flex sm:items-center sm:gap-2">
            {meta}
            {canFullscreen && (
              <button
                type="button"
                onClick={toggleFullscreen}
                aria-label={fullscreenLabel}
                title={fullscreenLabel}
                className={actionButton}
              >
                {isFullscreen ? (
                  <Minimize size={18} strokeWidth={1.5} aria-hidden="true" />
                ) : (
                  <Maximize size={18} strokeWidth={1.5} aria-hidden="true" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
