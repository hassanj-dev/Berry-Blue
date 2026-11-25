"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useState, type KeyboardEvent } from "react";
import { t } from "@/i18n";
import { SEARCH_MAX_LENGTH, SEARCH_MIN_LENGTH, SUGGEST_MIN_LENGTH } from "@/lib/search-query";

type Suggestion = { title: string; slug: string };

function tidy(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

// The response is not trusted: keep only items that look right.
function parseSuggestions(data: unknown): Suggestion[] {
  if (typeof data !== "object" || data === null || !("suggestions" in data)) return [];
  if (!Array.isArray(data.suggestions)) return [];

  return data.suggestions.filter(
    (item): item is Suggestion =>
      typeof item === "object" &&
      item !== null &&
      typeof item.title === "string" &&
      typeof item.slug === "string",
  );
}

export function SearchBox() {
  const router = useRouter();
  const listId = useId();
  const [value, setValue] = useState("");
  const [items, setItems] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  const text = tidy(value);
  const visible = open && text.length >= SUGGEST_MIN_LENGTH && items.length > 0;

  // Wait 200 ms after the last key, and cancel the old request when a new letter is typed.
  useEffect(() => {
    if (text.length < SUGGEST_MIN_LENGTH) return;

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch("/api/search/suggest?q=" + encodeURIComponent(text), {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("status " + response.status);
        setItems(parseSuggestions(await response.json()));
        setActive(-1);
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error("Search suggestions failed:", error);
        setItems([]);
      }
    }, 200);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [text]);

  function openGame(slug: string) {
    setOpen(false);
    setActive(-1);
    setValue("");
    setItems([]);
    router.push("/game/" + slug);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setOpen(false);
      setActive(-1);
      return;
    }

    if (event.key === "Enter") {
      const chosen = visible ? items[active] : undefined;
      if (chosen) {
        event.preventDefault();
        openGame(chosen.slug);
      }
      return;
    }

    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    if (items.length === 0) return;

    event.preventDefault();
    if (!visible) {
      setOpen(true);
      return;
    }

    const count = items.length;
    setActive((current) =>
      event.key === "ArrowDown" ? (current + 1) % count : current <= 0 ? count - 1 : current - 1,
    );
  }

  return (
    // A plain GET form: Enter still opens /search?q=... even without JavaScript.
    <form action="/search" role="search" className="relative min-w-0 flex-1 md:ml-auto md:max-w-xs">
      <input
        type="search"
        name="q"
        required
        minLength={SEARCH_MIN_LENGTH}
        maxLength={SEARCH_MAX_LENGTH}
        enterKeyHint="search"
        autoComplete="off"
        role="combobox"
        aria-expanded={visible}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={visible && active >= 0 ? `${listId}-${active}` : undefined}
        aria-label={t("search.label")}
        placeholder={t("search.placeholder")}
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
          setOpen(true);
          setActive(-1);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={onKeyDown}
        className="h-10 w-full rounded-full border border-border bg-surface px-4 text-sm"
      />

      {visible ? (
        <ul
          id={listId}
          role="listbox"
          aria-label={t("search.suggestions")}
          className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-border bg-surface py-1 shadow-lg"
        >
          {items.map((item, index) => (
            <li
              key={item.slug}
              id={`${listId}-${index}`}
              role="option"
              aria-selected={index === active}
              // mousedown would take focus away from the input and close the list before the click lands.
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => openGame(item.slug)}
              onMouseEnter={() => setActive(index)}
              className={
                "cursor-pointer truncate px-4 py-2 text-sm " +
                (index === active ? "bg-background text-foreground" : "text-muted")
              }
            >
              {item.title}
            </li>
          ))}
        </ul>
      ) : null}
    </form>
  );
}
