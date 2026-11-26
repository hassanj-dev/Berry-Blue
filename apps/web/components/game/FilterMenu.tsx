"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";

// A dropdown built on <details>. It closes on a choice, an outside click or Esc.
// On phones the panel opens as a sheet above the bottom navigation.
export function FilterMenu({
  label,
  align = "left",
  children,
}: {
  label: string;
  align?: "left" | "right";
  children: ReactNode;
}) {
  const ref = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!ref.current?.contains(event.target as Node)) ref.current?.removeAttribute("open");
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape" || !ref.current?.open) return;
      ref.current.open = false;
      ref.current.querySelector("summary")?.focus();
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <details ref={ref} className="group sm:relative">
      <summary className="flex h-10 cursor-pointer list-none items-center gap-1.5 rounded-full bg-foreground/10 px-4 text-sm font-medium capitalize max-sm:gap-1 max-sm:px-3 max-sm:text-xs hover:bg-foreground/20 [&::-webkit-details-marker]:hidden">
        {label}
        <ChevronDown size={16} aria-hidden="true" className="group-open:rotate-180" />
      </summary>
      <div
        onClick={(event) => {
          if ((event.target as HTMLElement).closest("a")) ref.current?.removeAttribute("open");
        }}
        className={
          "z-50 max-h-[50dvh] overflow-y-auto rounded-2xl border border-border bg-surface p-2 shadow-xl max-sm:fixed max-sm:inset-x-3 max-sm:bottom-[calc(0.75rem+env(safe-area-inset-bottom))] sm:absolute sm:top-full sm:mt-2 sm:w-64 " +
          (align === "right" ? "sm:right-0" : "sm:left-0")
        }
      >
        <ul className="flex flex-col gap-0.5">{children}</ul>
      </div>
    </details>
  );
}
