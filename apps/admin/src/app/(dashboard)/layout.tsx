import { LogOut } from "lucide-react";
import type { ReactNode } from "react";

import { AdminNav } from "@/components/AdminNav";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { requireAdmin } from "@/lib/auth";
import { logout } from "@/lib/auth-actions";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const admin = await requireAdmin();

  return (
    <div className="flex min-h-dvh">
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 border-r border-border lg:block">
        <div className="scroll-row sticky top-0 flex h-dvh flex-col gap-3 overflow-y-auto overflow-x-hidden px-3 py-4">
          <Logo className="h-9 px-3" />
          <div className="mt-2">
            <AdminNav />
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 border-b border-border bg-background">
          <div className="mx-auto flex w-full max-w-6xl items-center gap-2 px-4 py-2 md:px-8 md:py-3">
            <Logo className="lg:hidden" />
            <div className="ml-auto flex items-center gap-1">
              <span className="hidden max-w-56 truncate px-2 text-sm text-muted sm:block">
                {admin.email}
              </span>
              <ThemeToggle />
              <form action={logout}>
                <button
                  type="submit"
                  aria-label="Sign out"
                  title="Sign out"
                  className="flex h-10 cursor-pointer items-center gap-2 rounded-full px-3 text-sm font-medium text-muted transition-colors hover:text-foreground"
                >
                  <LogOut size={18} strokeWidth={1.75} aria-hidden="true" />
                  <span className="hidden sm:inline">Sign out</span>
                </button>
              </form>
            </div>
          </div>
          {/* Phone and tablet navigation */}
          <div className="border-t border-border lg:hidden">
            <AdminNav variant="chips" />
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
