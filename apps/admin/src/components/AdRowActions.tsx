"use client";

import { deleteAd, toggleAd } from "@/lib/ads-actions";

const buttonClass =
  "h-8 cursor-pointer rounded-lg border border-border px-3 text-xs font-medium hover:bg-foreground/10";

export function AdRowActions({ id, active }: { id: string; active: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <form action={toggleAd}>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="next" value={active ? "0" : "1"} />
        <button type="submit" className={buttonClass}>
          {active ? "Turn off" : "Turn on"}
        </button>
      </form>
      <form
        action={deleteAd}
        onSubmit={(event) => {
          if (!window.confirm("Delete this ad?")) event.preventDefault();
        }}
      >
        <input type="hidden" name="id" value={id} />
        <button type="submit" className={buttonClass + " text-red-400"}>
          Delete
        </button>
      </form>
    </div>
  );
}
