import Link from "next/link";

// Games per page, in Games and in Moderation.
export const PAGE_SIZE = 10;

export function paginate<T>(items: T[], rawPage: string) {
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const page = Math.min(Math.max(1, Number.parseInt(rawPage, 10) || 1), totalPages);
  return {
    page,
    totalPages,
    visible: items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
  };
}

// 1 ... 4 5 6 ... 20  (everything is shown when there are 7 pages or fewer)
function pageNumbers(current: number, total: number): (number | "gap")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const wanted = [...new Set([1, total, current - 1, current, current + 1])]
    .filter((n) => n >= 1 && n <= total)
    .sort((a, b) => a - b);

  const result: (number | "gap")[] = [];
  wanted.forEach((n, i) => {
    const previous = wanted[i - 1];
    if (previous !== undefined && n - previous > 1) result.push("gap");
    result.push(n);
  });
  return result;
}

export function Pagination({
  page,
  totalPages,
  hrefFor,
}: {
  page: number;
  totalPages: number;
  hrefFor: (n: number) => string;
}) {
  if (totalPages <= 1) return null;

  const itemClass =
    "inline-flex min-h-10 min-w-10 items-center justify-center rounded-xl border border-border px-3 text-sm font-medium ";

  return (
    <nav aria-label="Pages" className="flex flex-wrap items-center gap-2">
      {page > 1 && (
        <Link href={hrefFor(page - 1)} className={itemClass + "bg-surface hover:border-brand"}>
          Previous
        </Link>
      )}
      {pageNumbers(page, totalPages).map((n, i) =>
        n === "gap" ? (
          <span key={"gap-" + i} className="px-1 text-muted">
            &hellip;
          </span>
        ) : (
          <Link
            key={n}
            href={hrefFor(n)}
            aria-current={n === page ? "page" : undefined}
            className={
              itemClass +
              (n === page ? "bg-brand text-brand-foreground" : "bg-surface hover:border-brand")
            }
          >
            {n}
          </Link>
        ),
      )}
      {page < totalPages && (
        <Link href={hrefFor(page + 1)} className={itemClass + "bg-surface hover:border-brand"}>
          Next
        </Link>
      )}
    </nav>
  );
}
