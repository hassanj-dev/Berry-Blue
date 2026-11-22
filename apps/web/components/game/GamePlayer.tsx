"use client";

import Image from "next/image";
import { useState } from "react";
import { t } from "@/i18n";

type GamePlayerProps = {
  title: string;
  thumbnailUrl: string;
  embedUrl: string;
};

// sandbox = iframe ke andar game ko kam se kam ijazat. Hum sirf wohi dete hain jo games ko chahiye.
// allow-same-origin sirf bahar ke (doosre domain ke) games ko milta hai: apni site ke game ko
// allow-scripts ke saath allow-same-origin dena sandbox ko bekaar kar deta hai.
function sandboxFor(embedUrl: string) {
  const base = "allow-scripts allow-pointer-lock";
  return embedUrl.startsWith("/") ? base : `${base} allow-same-origin`;
}

export function GamePlayer({ title, thumbnailUrl, embedUrl }: GamePlayerProps) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border bg-surface md:aspect-video">
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
            className="object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-background/50">
            <button
              type="button"
              onClick={() => setPlaying(true)}
              className="rounded-full bg-brand px-8 py-4 text-lg font-bold text-brand-foreground"
            >
              {t("game.playNow")}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
