import { Check, X } from "lucide-react";
import Link from "next/link";
import type { Category } from "@berryblue/shared";
import { FilterMenu } from "@/components/game/FilterMenu";
import { t } from "@/i18n";
import { cn } from "@/lib/cn";
import { DEVICES, SORTS, gamesHref, type GamesFilters, type SortName } from "@/lib/games-query";
import type { TagOption } from "@/lib/tags";

type GamesFilterBarProps = {
  sort: SortName;
  filters: GamesFilters;
  categories: Category[];
  tags: TagOption[];
};

function Option({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <li>
      <Link
        href={href}
        aria-current={active ? "true" : undefined}
        className={cn(
          "flex min-h-10 items-center justify-between gap-3 rounded-lg px-3 text-sm capitalize",
          active ? "bg-primary text-primary-foreground" : "hover:bg-foreground/10",
        )}
      >
        {label}
        {active && <Check size={16} aria-hidden="true" />}
      </Link>
    </li>
  );
}

// The sort dropdown. On phones it sits next to "Showing 1-12 of N" instead of in the filter row.
export function SortMenu({
  sort,
  filters,
  variant = "pill",
}: {
  sort: SortName;
  filters: GamesFilters;
  variant?: "pill" | "plain";
}) {
  return (
    <FilterMenu label={t(`games.sort.${sort}`)} align="right" variant={variant}>
      {SORTS.map((option) => (
        <Option
          key={option}
          href={gamesHref({ ...filters, sort: option })}
          active={option === sort}
          label={t(`games.sort.${option}`)}
        />
      ))}
    </FilterMenu>
  );
}

// A new filter never keeps the old page number, so it starts again at page 1.
export function GamesFilterBar({ sort, filters, categories, tags }: GamesFilterBarProps) {
  const category = categories.find((c) => c.slug === filters.category);
  const tagName = filters.tag?.replace(/-/g, " ");

  const applied: { name: string; href: string }[] = [];
  if (category) {
    applied.push({
      name: category.name,
      href: gamesHref({ ...filters, sort, category: undefined }),
    });
  }
  if (filters.device) {
    applied.push({
      name: t(`devices.${filters.device}`),
      href: gamesHref({ ...filters, sort, device: undefined }),
    });
  }
  if (tagName) {
    applied.push({ name: tagName, href: gamesHref({ ...filters, sort, tag: undefined }) });
  }

  return (
    <section aria-label={t("games.filters.label")} className="flex flex-col gap-3">
      <div className="relative flex flex-wrap items-center gap-2">
        {categories.length > 0 && (
          <FilterMenu label={t("games.filters.category")}>
            <Option
              href={gamesHref({ ...filters, sort, category: undefined })}
              active={!filters.category}
              label={t("games.filters.all")}
            />
            {categories.map((c) => (
              <Option
                key={c.id}
                href={gamesHref({ ...filters, sort, category: c.slug })}
                active={filters.category === c.slug}
                label={c.name}
              />
            ))}
          </FilterMenu>
        )}

        <FilterMenu label={t("games.filters.device")}>
          <Option
            href={gamesHref({ ...filters, sort, device: undefined })}
            active={!filters.device}
            label={t("games.filters.anyDevice")}
          />
          {DEVICES.map((device) => (
            <Option
              key={device}
              href={gamesHref({ ...filters, sort, device })}
              active={filters.device === device}
              label={t(`devices.${device}`)}
            />
          ))}
        </FilterMenu>

        {tags.length > 0 && (
          <FilterMenu label={t("games.filters.tag")}>
            {tags.map(({ tag }) => (
              <Option
                key={tag}
                href={gamesHref({ ...filters, sort, tag: filters.tag === tag ? undefined : tag })}
                active={filters.tag === tag}
                label={tag.replace(/-/g, " ")}
              />
            ))}
          </FilterMenu>
        )}

        <div className="max-sm:hidden sm:ml-auto">
          <SortMenu sort={sort} filters={filters} />
        </div>
      </div>

      {applied.length > 0 && (
        <ul className="flex flex-wrap items-center gap-2">
          {applied.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                aria-label={t("games.filters.remove", { name: item.name })}
                className="inline-flex h-8 items-center gap-1.5 rounded-full bg-primary px-3 text-xs font-medium capitalize text-primary-foreground hover:bg-primary-hover"
              >
                {item.name}
                <X size={14} aria-hidden="true" />
              </Link>
            </li>
          ))}
          <li>
            <Link href={gamesHref({ sort })} className="px-2 text-sm text-brand hover:underline">
              {t("games.filters.clear")}
            </Link>
          </li>
        </ul>
      )}
    </section>
  );
}
