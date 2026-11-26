"use client";

import { Menu, X } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";

// Closes on a link tap, an outside tap or Esc.
export function MenuShell({ label, children }: { label: string; children: ReactNode }) {
  const ref = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!ref.current?.contains(event.target as Node)) ref.current?.removeAttribute("open");
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") ref.current?.removeAttribute("open");
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <details ref={ref} className="group order-1 lg:hidden">
      <summary
        aria-label={label}
        className="flex size-10 cursor-pointer list-none items-center justify-center rounded-full hover:bg-foreground/10 [&::-webkit-details-marker]:hidden"
      >
        <Menu size={22} aria-hidden="true" className="group-open:hidden" />
        <X size={22} aria-hidden="true" className="hidden group-open:block" />
      </summary>
      <div
        onClick={(event) => {
          if ((event.target as HTMLElement).closest("a")) ref.current?.removeAttribute("open");
        }}
        className="absolute inset-x-3 top-full z-50 mt-2 max-h-[70dvh] overflow-y-auto rounded-2xl border border-border bg-surface p-3 shadow-xl"
      >
        {children}
      </div>
    </details>
  );
}
