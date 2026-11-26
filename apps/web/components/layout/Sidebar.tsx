import { Shapes } from "lucide-react";
import { categoryIcons } from "@/components/layout/category-icons";
import { Suspense } from "react";
import { Icon } from "@/components/layout/icons";
import { Logo } from "@/components/layout/Logo";
import { NavLink } from "@/components/layout/NavLink";
import { t } from "@/i18n";
import { getCategories } from "@/lib/games";
import { sidebarNav } from "@/lib/nav";

// NavLink sets aria-current="page" on the active item.
const itemClass =
  "flex h-9 shrink-0 [@media(max-height:760px)]:h-8 items-center gap-3 rounded-xl px-3 text-sm font-medium text-muted transition-colors hover:bg-foreground/10 hover:text-foreground aria-[current=page]:bg-primary aria-[current=page]:text-primary-foreground";

async function SidebarCategories() {
  const categories = await getCategories();
  if (categories.length === 0) return null;

  return (
    <nav aria-labelledby="sidebar-categories" className="mt-4 border-t border-border pt-6">
      <h2
        id="sidebar-categories"
        className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted"
      >
        {t("nav.categories")}
      </h2>
      <Suspense fallback={null}>
        <ul className="flex flex-col gap-1.5">
          {categories.map((category) => {
            const CategoryIcon = categoryIcons[category.slug] ?? Shapes;
            return (
              <li key={category.id}>
                <NavLink href={"/category/" + category.slug} className={itemClass}>
                  <CategoryIcon size={20} strokeWidth={1.75} aria-hidden="true" />
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

export function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 border-r border-border lg:block">
      <div className="scroll-row sticky top-0 flex h-dvh flex-col gap-3 overflow-y-auto overflow-x-hidden px-3 py-4">
        <Logo className="h-9 px-3" />

        <nav aria-label={t("nav.main")}>
          <Suspense fallback={null}>
            <ul className="flex flex-col gap-0.5">
              {sidebarNav.map((item) => (
                <li key={item.href}>
                  <NavLink href={item.href} className={itemClass}>
                    <Icon name={item.icon} />
                    {t(item.labelKey)}
                  </NavLink>
                </li>
              ))}
            </ul>
          </Suspense>
        </nav>

        <Suspense fallback={null}>
          <SidebarCategories />
        </Suspense>
      </div>
    </aside>
  );
}
