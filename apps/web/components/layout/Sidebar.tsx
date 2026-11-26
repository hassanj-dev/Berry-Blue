import {
  Brain,
  Car,
  Coffee,
  Gamepad2,
  Puzzle,
  Shapes,
  Swords,
  Trophy,
  Type,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { Icon } from "@/components/layout/icons";
import { Logo } from "@/components/layout/Logo";
import { NavLink } from "@/components/layout/NavLink";
import { t } from "@/i18n";
import { getCategories } from "@/lib/games";
import { footerNav, sidebarNav } from "@/lib/nav";
import { siteConfig } from "@/lib/site";

// NavLink sets aria-current="page" on the active item.
const itemClass =
  "flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium text-muted transition-colors hover:bg-foreground/10 hover:text-foreground aria-[current=page]:bg-primary aria-[current=page]:text-primary-foreground";

// By category slug. A new category without an entry gets the Shapes icon.
const categoryIcons: Record<string, LucideIcon> = {
  action: Swords,
  arcade: Gamepad2,
  casual: Coffee,
  puzzle: Puzzle,
  racing: Car,
  sports: Trophy,
  strategy: Brain,
  word: Type,
};

async function SidebarCategories() {
  const categories = await getCategories();
  if (categories.length === 0) return null;

  return (
    <nav aria-labelledby="sidebar-categories" className="border-t border-border pt-4">
      <h2
        id="sidebar-categories"
        className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted"
      >
        {t("nav.categories")}
      </h2>
      <Suspense fallback={null}>
        <ul className="flex flex-col gap-1">
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
      <div className="scroll-row sticky top-0 flex h-dvh flex-col gap-4 overflow-y-auto overflow-x-hidden px-3 py-4">
        <Logo className="h-9 px-3" />

        <nav aria-label={t("nav.main")}>
          <Suspense fallback={null}>
            <ul className="flex flex-col gap-1">
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

        <div className="mt-auto border-t border-border px-3 pt-4">
          <nav aria-label={t("footer.links")}>
            <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
              {footerNav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-muted hover:text-foreground">
                    {t(item.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <p className="mt-3 text-xs text-muted">
            {t("footer.copyright", { name: siteConfig.name })}
          </p>
        </div>
      </div>
    </aside>
  );
}
