import { LayoutGrid, Shapes } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { categoryIcons } from "@/components/layout/category-icons";
import { NavLink } from "@/components/layout/NavLink";
import { t } from "@/i18n";
import { getCategories } from "@/lib/games";

const tab =
  "relative inline-flex h-11 shrink-0 items-center gap-2 whitespace-nowrap px-3 text-sm font-medium text-muted transition-colors hover:text-foreground aria-[current=page]:text-foreground after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full aria-[current=page]:after:bg-brand";

// Phone and tablet only: on desktop the categories are in the sidebar.
// highlightAll: the home page shows All as the current tab.
export async function CategoryTabs({ highlightAll = false }: { highlightAll?: boolean }) {
  const categories = await getCategories();
  if (categories.length === 0) return null;

  return (
    <nav aria-label={t("category.browse")} className="lg:hidden">
      <Suspense fallback={null}>
        <ul className="scroll-row -mx-4 flex overflow-x-auto scroll-px-4 px-4 md:-mx-8 md:scroll-px-8 md:px-8">
          <li className="shrink-0">
            {highlightAll ? (
              <Link href="/games" aria-current="page" className={tab}>
                <LayoutGrid size={18} strokeWidth={1.75} aria-hidden="true" />
                {t("games.filters.all")}
              </Link>
            ) : (
              <NavLink href="/games" className={tab}>
                <LayoutGrid size={18} strokeWidth={1.75} aria-hidden="true" />
                {t("games.filters.all")}
              </NavLink>
            )}
          </li>
          {categories.map((category) => {
            const CategoryIcon = categoryIcons[category.slug] ?? Shapes;
            return (
              <li key={category.id} className="shrink-0">
                <NavLink href={"/category/" + category.slug} className={tab}>
                  <CategoryIcon size={18} strokeWidth={1.75} aria-hidden="true" />
                  {category.name}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </Suspense>
    </nav>
  );
}
