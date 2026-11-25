import Link from "next/link";
import type { Category } from "@berryblue/shared";
import { t } from "@/i18n";
import { cn } from "@/lib/cn";
import { DEVICES, gamesHref, type GamesFilters, type SortName } from "@/lib/games-query";
import type { TagOption } from "@/lib/tags";

const TAG_CHIP_LIMIT = 12;

type GamesFilterBarProps = {
  sort: SortName;
  filters: GamesFilters;
  categories: Category[];
  tags: TagOption[];
};

function Chip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link
        href={href}
        aria-current={active ? "true" : undefined}
        className={cn(
          "inline-flex min-h-10 items-center rounded-full border px-4 text-sm font-medium capitalize",
          active
            ? "border-brand bg-brand text-brand-foreground"
            : "border-border bg-surface text-muted hover:border-brand",
        )}
      >
        {children}
      </Link>
    </li>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1 text-xs font-semibold uppercase text-muted">{label}</p>
      <nav aria-label={label} className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
        <ul className="flex gap-2 whitespace-nowrap">{children}</ul>
      </nav>
    </div>
  );
}

// Plain links, no JavaScript. A chip that is already on turns that filter off.
// A new filter never keeps the old page number, so it starts again at page 1.
export function GamesFilterBar({ sort, filters, categories, tags }: GamesFilterBarProps) {
  const hasFilters = Boolean(filters.category || filters.device || filters.tag);

  const shownTags = tags.slice(0, TAG_CHIP_LIMIT).map((option) => option.tag);
  if (filters.tag && !shownTags.includes(filters.tag)) shownTags.push(filters.tag);

  return (
    <section aria-label={t("games.filters.label")} className="flex flex-col gap-3">
      {categories.length > 0 ? (
        <Group label={t("games.filters.category")}>
          <Chip
            href={gamesHref({ ...filters, sort, category: undefined })}
            active={!filters.category}
          >
            {t("games.filters.all")}
          </Chip>
          {categories.map((category) => {
            const active = filters.category === category.slug;
            return (
              <Chip
                key={category.id}
                href={gamesHref({ ...filters, sort, category: active ? undefined : category.slug })}
                active={active}
              >
                {category.name}
              </Chip>
            );
          })}
        </Group>
      ) : null}

      <Group label={t("games.filters.device")}>
        <Chip href={gamesHref({ ...filters, sort, device: undefined })} active={!filters.device}>
          {t("games.filters.anyDevice")}
        </Chip>
        {DEVICES.map((device) => {
          const active = filters.device === device;
          return (
            <Chip
              key={device}
              href={gamesHref({ ...filters, sort, device: active ? undefined : device })}
              active={active}
            >
              {t(`devices.${device}`)}
            </Chip>
          );
        })}
      </Group>

      {shownTags.length > 0 ? (
        <Group label={t("games.filters.tag")}>
          {shownTags.map((tag) => {
            const active = filters.tag === tag;
            return (
              <Chip
                key={tag}
                href={gamesHref({ ...filters, sort, tag: active ? undefined : tag })}
                active={active}
              >
                {tag.replace(/-/g, " ")}
              </Chip>
            );
          })}
        </Group>
      ) : null}

      {hasFilters ? (
        <p>
          <Link href={gamesHref({ sort })} className="text-sm text-brand hover:underline">
            {t("games.filters.clear")}
          </Link>
        </p>
      ) : null}
    </section>
  );
}
