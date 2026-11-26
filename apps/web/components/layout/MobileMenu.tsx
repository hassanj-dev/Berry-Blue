import { Shapes } from "lucide-react";
import Link from "next/link";
import { categoryIcons } from "@/components/layout/category-icons";
import { Icon } from "@/components/layout/icons";
import { MenuShell } from "@/components/layout/MenuShell";
import { NavLink } from "@/components/layout/NavLink";
import { t } from "@/i18n";
import { getCategories } from "@/lib/games";
import { footerNav, sidebarNav } from "@/lib/nav";

const itemClass =
  "flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium hover:bg-foreground/10 aria-[current=page]:bg-primary aria-[current=page]:text-primary-foreground";

// Phone and tablet navigation. Desktop uses the sidebar.
export async function MobileMenu() {
  const categories = await getCategories();

  return (
    <MenuShell label={t("nav.menu")}>
      <nav aria-label={t("nav.main")}>
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
      </nav>

      {categories.length > 0 && (
        <nav aria-label={t("nav.categories")} className="mt-2 border-t border-border pt-2">
          <p className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted">
            {t("nav.categories")}
          </p>
          <ul className="grid grid-cols-2 gap-0.5">
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
        </nav>
      )}

      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 border-t border-border px-3 pt-3 text-xs">
        {footerNav.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className="text-muted">
              {t(item.labelKey)}
            </Link>
          </li>
        ))}
      </ul>
    </MenuShell>
  );
}
