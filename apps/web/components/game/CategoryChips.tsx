import Link from "next/link";
import { t } from "@/i18n";
import { cn } from "@/lib/cn";
import { getCategories } from "@/lib/games";

export async function CategoryChips({ current }: { current?: string }) {
  const categories = await getCategories();
  if (categories.length === 0) return null;

  return (
    <nav aria-label={t("category.browse")} className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
      <ul className="flex gap-2 whitespace-nowrap">
        {categories.map((category) => {
          const active = category.slug === current;
          return (
            <li key={category.id}>
              <Link
                href={"/category/" + category.slug}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-10 items-center rounded-full border px-4 text-sm font-medium",
                  active
                    ? "border-brand bg-brand text-brand-foreground"
                    : "border-border bg-surface text-muted hover:border-brand",
                )}
              >
                {category.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
