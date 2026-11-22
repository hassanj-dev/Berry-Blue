import Link from "next/link";
import { t } from "@/i18n";
import { cn } from "@/lib/cn";
import { SORTS, type SortName } from "@/lib/games-query";

export function SortTabs({ current }: { current: SortName }) {
  return (
    <nav aria-label={t("games.sortBy")}>
      <ul className="flex flex-wrap gap-2">
        {SORTS.map((sort) => (
          <li key={sort}>
            <Link
              href={"/games?sort=" + sort}
              aria-current={sort === current ? "true" : undefined}
              className={cn(
                "inline-flex min-h-11 items-center rounded-xl border border-border px-4 text-sm font-medium",
                sort === current ? "bg-brand text-brand-foreground" : "bg-surface text-foreground",
              )}
            >
              {t(`games.sort.${sort}`)}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
