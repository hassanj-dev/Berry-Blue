"use client";

import { Search, X } from "lucide-react";
import { cx, focusRing, iconProps } from "./ui";

export function SearchField({
  id,
  label,
  placeholder,
  value,
  onChange,
}: {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <Search
        {...iconProps}
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
      />
      <input
        id={id}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className={cx(
          "h-12 w-full rounded-lg border border-border bg-surface pl-12 pr-12 text-sm text-foreground placeholder:text-muted",
          "transition-colors hover:border-foreground/30 [&::-webkit-search-cancel-button]:appearance-none",
          focusRing,
        )}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className={cx(
            "absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted transition-colors hover:bg-foreground/5 hover:text-foreground",
            focusRing,
          )}
        >
          <X size={16} strokeWidth={1.5} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
