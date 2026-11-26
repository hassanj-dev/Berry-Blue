import Link from "next/link";
import { t } from "@/i18n";
import { cn } from "@/lib/cn";
import { gamesHref, type GamesFilters, type SortName } from "@/lib/games-query";

type PaginationProps = {
  sort: SortName;
  filters: GamesFilters;
  page: number;
  pageCount: number;
  // Optional: build the links yourself (default: /games?...).
  hrefFor?: (page: number) => string;
};

// Pehla, aakhri, aur maujooda page ke aas paas ke pages; beech ka farq "gap" se dikhate hain.
function pageItems(current: number, count: number): Array<number | "gap"> {
  const wanted = new Set([1, count, current - 1, current, current + 1]);
  const sorted = [...wanted].filter((p) => p >= 1 && p <= count).sort((a, b) => a - b);

  const items: Array<number | "gap"> = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) items.push("gap");
    items.push(p);
  });
  return items;
}

const base =
  "inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-border px-3 text-sm";

export function Pagination({
  sort,
  filters,
  page,
  pageCount,
  hrefFor: customHref,
}: PaginationProps) {
  if (pageCount <= 1) return null;

  const hrefFor = customHref ?? ((target: number) => gamesHref({ ...filters, sort, page: target }));

  return (
    <nav aria-label={t("games.pagination.label")} className="mt-8">
      <ul className="flex flex-wrap items-center justify-center gap-2">
        <li>
          {page > 1 ? (
            <Link href={hrefFor(page - 1)} rel="prev" className={cn(base, "bg-surface")}>
              {t("games.pagination.previous")}
            </Link>
          ) : (
            <span aria-disabled="true" className={cn(base, "text-muted opacity-50")}>
              {t("games.pagination.previous")}
            </span>
          )}
        </li>

        {pageItems(page, pageCount).map((item, i) =>
          item === "gap" ? (
            <li key={"gap-" + i} aria-hidden="true" className="px-1 text-muted">
              &hellip;
            </li>
          ) : (
            <li key={item}>
              <Link
                href={hrefFor(item)}
                aria-current={item === page ? "page" : undefined}
                aria-label={t("games.pagination.page", { page: item })}
                className={cn(
                  base,
                  item === page ? "bg-primary text-primary-foreground" : "bg-surface",
                )}
              >
                {item}
              </Link>
            </li>
          ),
        )}

        <li>
          {page < pageCount ? (
            <Link href={hrefFor(page + 1)} rel="next" className={cn(base, "bg-surface")}>
              {t("games.pagination.next")}
            </Link>
          ) : (
            <span aria-disabled="true" className={cn(base, "text-muted opacity-50")}>
              {t("games.pagination.next")}
            </span>
          )}
        </li>
      </ul>
    </nav>
  );
}
