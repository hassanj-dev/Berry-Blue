import Link from "next/link";
import type { ReactNode } from "react";

import { requireAdmin } from "@/lib/auth";
import { logout } from "@/lib/auth-actions";

const links = [
  { href: "/overview", label: "Overview" },
  { href: "/moderation", label: "Moderation" },
  { href: "/games", label: "Games" },
  { href: "/providers", label: "Providers" },
  { href: "/categories", label: "Categories" },
  { href: "/tags", label: "Tags" },
  { href: "/audit-logs", label: "Audit log" },
];

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const admin = await requireAdmin();

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface px-4 py-3">
        <nav className="flex flex-wrap items-center gap-4 text-sm font-medium">
          <span className="font-bold">BerryBlue Admin</span>
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="hover:underline">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-muted">{admin.email}</span>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-lg border border-border px-3 py-1.5 hover:border-brand"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>
      <div className="mx-auto w-full max-w-6xl flex-1 p-4 md:p-8">{children}</div>
    </div>
  );
}
