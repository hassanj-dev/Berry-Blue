"use client";

import { ChevronDown, Search } from "lucide-react";
import Link from "next/link";
import { useId, useRef, useState, type KeyboardEvent } from "react";
import { EmptyState } from "./EmptyState";
import { matchesQuery } from "./search";
import { SearchField } from "./SearchField";
import { btn, cx, focusRingInset } from "./ui";

export type FaqItem = { id: string | number; question: string; answer: string };

/**
 * Searchable accordion. Each question is a real <button> with aria-expanded and
 * aria-controls, so Enter and Space work natively. Arrow Up/Down, Home and End
 * move between questions (WAI-ARIA accordion pattern).
 */
export function FaqExplorer({ faqs }: { faqs: FaqItem[] }) {
  const uid = useId();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<ReadonlySet<string>>(() => new Set());
  const triggers = useRef<Array<HTMLButtonElement | null>>([]);

  const searching = query.trim().length > 0;
  const visible = faqs.filter((faq) => matchesQuery(`${faq.question} ${faq.answer}`, query));

  function toggle(key: string) {
    setOpen((previous) => {
      const next = new Set(previous);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function onTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const last = visible.length - 1;
    let target: number | null = null;
    if (event.key === "ArrowDown") target = index === last ? 0 : index + 1;
    else if (event.key === "ArrowUp") target = index === 0 ? last : index - 1;
    else if (event.key === "Home") target = 0;
    else if (event.key === "End") target = last;
    if (target === null) return;
    event.preventDefault();
    triggers.current[target]?.focus();
  }

  return (
    <div className="flex flex-col gap-6">
      <SearchField
        id={`${uid}-search`}
        label="Search questions"
        placeholder="Search questions"
        value={query}
        onChange={setQuery}
      />

      <p role="status" aria-live="polite" className="text-sm text-muted">
        {searching
          ? `${visible.length} of ${faqs.length} questions`
          : `${faqs.length} ${faqs.length === 1 ? "question" : "questions"}`}
      </p>

      {visible.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No matching questions"
          description="Try different words, or send us your question."
        >
          <div className="flex flex-wrap justify-center gap-3">
            <button type="button" onClick={() => setQuery("")} className={btn("secondary", "sm")}>
              Clear search
            </button>
            <Link href="/contact" className={btn("primary", "sm")}>
              Contact us
            </Link>
          </div>
        </EmptyState>
      ) : (
        <ul className="flex flex-col gap-3">
          {visible.map((faq, index) => {
            const key = String(faq.id);
            const isOpen = open.has(key);
            const buttonId = `${uid}-q-${key}`;
            const panelId = `${uid}-a-${key}`;
            return (
              <li key={key} className="overflow-hidden rounded-2xl border border-border bg-surface">
                <h2>
                  <button
                    type="button"
                    id={buttonId}
                    ref={(element) => {
                      triggers.current[index] = element;
                    }}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => toggle(key)}
                    onKeyDown={(event) => onTriggerKeyDown(event, index)}
                    className={cx(
                      "flex w-full items-center justify-between gap-4 p-5 text-left font-medium transition-colors hover:bg-foreground/5",
                      focusRingInset,
                    )}
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      size={20}
                      strokeWidth={1.5}
                      aria-hidden="true"
                      className={cx(
                        "shrink-0 text-muted transition-transform duration-200 motion-reduce:transition-none",
                        isOpen && "rotate-180",
                      )}
                    />
                  </button>
                </h2>
                <div
                  id={panelId}
                  inert={!isOpen}
                  className={cx(
                    "grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none",
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                  )}
                >
                  <div className="overflow-hidden">
                    <p className="whitespace-pre-line px-5 pb-5 leading-relaxed text-muted">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
