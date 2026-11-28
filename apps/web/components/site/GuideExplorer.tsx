"use client";

import { ArrowRight, BookOpen } from "lucide-react";
import Link from "next/link";
import { useId, useState } from "react";
import { EmptyState } from "./EmptyState";
import { Keycap } from "./Keycap";
import { matchesQuery } from "./search";
import { SearchField } from "./SearchField";
import { btn, cx, focusRing, iconInline, metaText, surfaceCard } from "./ui";

export type GuideStep = { title: string; body: string };
export type GuideItem = {
  id: string | number;
  slug: string;
  title: string;
  summary?: string | null;
  steps: GuideStep[];
};

const PREVIEW_STEPS = 3;

/**
 * Search runs over what the data really contains: title, summary and step
 * titles. There is no game or category filter because guides have no such
 * field yet. Adding one means adding a column first, not faking it here.
 */
export function GuideExplorer({ guides }: { guides: GuideItem[] }) {
  const uid = useId();
  const [query, setQuery] = useState("");
  const searching = query.trim().length > 0;
  const visible = guides.filter((guide) =>
    matchesQuery(
      `${guide.title} ${guide.summary ?? ""} ${guide.steps.map((s) => s.title).join(" ")}`,
      query,
    ),
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex max-w-xl flex-col gap-3">
        <SearchField
          id={`${uid}-search`}
          label="Search guides"
          placeholder="Search guides"
          value={query}
          onChange={setQuery}
        />
        <p role="status" aria-live="polite" className={metaText}>
          {searching
            ? `${visible.length} of ${guides.length} guides`
            : `${guides.length} ${guides.length === 1 ? "guide" : "guides"}`}
        </p>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No matching guides"
          description="Try different words, or clear the search to see every guide"
        >
          <button type="button" onClick={() => setQuery("")} className={btn("secondary", "sm")}>
            Clear search
          </button>
        </EmptyState>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((guide) => {
            const preview = guide.steps.slice(0, PREVIEW_STEPS);
            const remaining = guide.steps.length - preview.length;
            return (
              <li key={guide.id}>
                <Link
                  href={`/guides/${guide.slug}`}
                  className={cx(
                    "group flex h-full flex-col gap-5 p-6 transition-colors hover:border-foreground/30",
                    surfaceCard,
                    focusRing,
                  )}
                >
                  <div className="flex flex-col gap-2">
                    <h3 className="text-lg font-semibold leading-snug">{guide.title}</h3>
                    {guide.summary && (
                      <p className="line-clamp-3 text-sm text-muted">{guide.summary}</p>
                    )}
                  </div>

                  {preview.length > 0 && (
                    <ol className="flex flex-col gap-2 border-t border-border pt-4">
                      {preview.map((step, index) => (
                        <li key={index} className="flex items-center gap-3 text-sm">
                          <Keycap size="sm">{index + 1}</Keycap>
                          <span className="min-w-0 truncate text-muted">{step.title}</span>
                        </li>
                      ))}
                      {remaining > 0 && (
                        <li className="pl-9 text-xs text-muted">+{remaining} more</li>
                      )}
                    </ol>
                  )}

                  <span className="mt-auto flex items-center justify-between pt-1 text-sm">
                    <span className={metaText}>
                      {guide.steps.length} {guide.steps.length === 1 ? "step" : "steps"}
                    </span>
                    <span className="inline-flex items-center gap-1 font-medium">
                      Read guide <ArrowRight {...iconInline} />
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
