"use client";

import { Minus, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useId, useRef, useState, type KeyboardEvent } from "react";
import { EmptyState } from "./EmptyState";
import { RichText } from "./RichText";
import { matchesQuery } from "./search";
import { SearchField } from "./SearchField";
import { btn, cx, focusRing, iconProps, metaText } from "./ui";

export type FaqItem = { id: string | number; question: string; answer: string };

const ROW = "grid grid-cols-[2rem_1fr_1.5rem] gap-x-3 sm:grid-cols-[3rem_1fr_1.5rem] sm:gap-x-4";

/**
 * Searchable accordion. Each question is a real <button> with aria-expanded and
 * aria-controls, so Enter and Space work natively. Arrow Up/Down, Home and End
 * move between questions (WAI-ARIA accordion pattern).
 */
export function FaqExplorer({ faqs }: { faqs: FaqItem[] }) {
  const uid = useId();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<ReadonlySet<string>>(
    () => new Set(faqs[0] ? [String(faqs[0].id)] : []),
  );
  const triggers = useRef<Array<HTMLButtonElement | null>>([]);

  const searching = query.trim().length > 0;
  const visible = faqs
    .map((faq, index) => ({ faq, number: index + 1 }))
    .filter(({ faq }) => matchesQuery(`${faq.question} ${faq.answer}`, query));

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
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <SearchField
          id={`${uid}-search`}
          label="Search questions"
          placeholder="Search questions"
          value={query}
          onChange={setQuery}
        />
        <p role="status" aria-live="polite" className={metaText}>
          {searching
            ? `${visible.length} of ${faqs.length} questions`
            : `${faqs.length} ${faqs.length === 1 ? "question" : "questions"}`}
        </p>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No matching questions"
          description="Try different words, or send us your question"
        >
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => setQuery("")} className={btn("secondary", "sm")}>
              Clear search
            </button>
            <Link href="/contact" className={btn("primary", "sm")}>
              Contact us
            </Link>
          </div>
        </EmptyState>
      ) : (
        <ul className="border-t border-border">
          {visible.map(({ faq, number }, index) => {
            const key = String(faq.id);
            const isOpen = open.has(key);
            const buttonId = `${uid}-q-${key}`;
            const panelId = `${uid}-a-${key}`;
            return (
              <li key={key} className="border-b border-border">
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
                      ROW,
                      "group w-full items-baseline rounded-sm py-5 text-left",
                      focusRing,
                    )}
                  >
                    <span aria-hidden="true" className={metaText}>
                      {String(number).padStart(2, "0")}
                    </span>
                    <span className="text-pretty text-lg font-medium">{faq.question}</span>
                    <span className="self-center text-muted transition-colors group-hover:text-foreground">
                      {isOpen ? <Minus {...iconProps} /> : <Plus {...iconProps} />}
                    </span>
                  </button>
                </h2>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  hidden={!isOpen}
                  className={cx(ROW, "rise-in pb-6")}
                >
                  <p className="col-start-2 max-w-2xl whitespace-pre-line text-pretty leading-relaxed text-muted">
                    <RichText text={faq.answer} />
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
