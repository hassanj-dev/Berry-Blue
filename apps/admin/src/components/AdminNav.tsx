"use client";

import {
  Flag,
  Gamepad2,
  LayoutDashboard,
  Plug,
  ScrollText,
  Shapes,
  ShieldCheck,
  Tag,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/overview", label: "Overview", icon: LayoutDashboard },
  { href: "/moderation", label: "Moderation", icon: ShieldCheck },
  { href: "/games", label: "Games", icon: Gamepad2 },
  { href: "/providers", label: "Providers", icon: Plug },
  { href: "/categories", label: "Categories", icon: Shapes },
  { href: "/tags", label: "Tags", icon: Tag },
  { href: "/reports", label: "Reports", icon: Flag },
  { href: "/audit-logs", label: "Audit log", icon: ScrollText },
];

const sidebarItemClass =
  "flex h-9 items-center gap-3 rounded-xl px-3 text-sm font-medium text-muted transition-colors hover:bg-foreground/10 hover:text-foreground aria-[current=page]:bg-primary aria-[current=page]:text-primary-foreground";

export function AdminNav({ variant = "sidebar" }: { variant?: "sidebar" | "chips" }) {
  const pathname = usePathname();
  const current = (href: string) =>
    pathname === href || pathname.startsWith(href + "/") ? "page" : undefined;

  if (variant === "chips") {
    return (
      <nav aria-label="Admin" className="scroll-row flex gap-2 overflow-x-auto px-4 py-2 md:px-8">
        {items.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} aria-current={current(href)} className="chip">
            <Icon size={16} strokeWidth={1.75} aria-hidden="true" />
            {label}
          </Link>
        ))}
      </nav>
    );
  }

  return (
    <nav aria-label="Admin">
      <ul className="flex flex-col gap-0.5">
        {items.map(({ href, label, icon: Icon }) => (
          <li key={href}>
            <Link href={href} aria-current={current(href)} className={sidebarItemClass}>
              <Icon size={20} strokeWidth={1.75} aria-hidden="true" />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
