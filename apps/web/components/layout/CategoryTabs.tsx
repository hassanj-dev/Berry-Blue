import { Suspense } from "react";
import { NavLink } from "@/components/layout/NavLink";
import { t } from "@/i18n";
import { getCategories } from "@/lib/games";

// Phone and tablet only: on desktop the categories are in the sidebar.
export async function CategoryTabs() {
  const categories = await getCategories();
  if (categories.length === 0) return null;

  return (
    <nav aria-label={t("category.browse")} className="lg:hidden">
      <Suspense fallback={null}>
        <ul className="scroll-row -mx-4 flex gap-2 overflow-x-auto scroll-px-4 px-4 py-1 md:-mx-8 md:scroll-px-8 md:px-8">
          <li className="shrink-0">
            <NavLink href="/games" className="chip">
              {t("games.filters.all")}
            </NavLink>
          </li>
          {categories.map((category) => (
            <li key={category.id} className="shrink-0">
              <NavLink href={"/category/" + category.slug} className="chip">
                {category.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </Suspense>
    </nav>
  );
}
