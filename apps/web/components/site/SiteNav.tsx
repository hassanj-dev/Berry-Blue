"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { btn, cx, focusRing } from "./ui";

const links = [
  { href: "/guides", label: "Guides" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/faqs", label: "FAQs" },
  { href: "/contact", label: "Contact" },
] as const;

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteNav() {
  const pathname = usePathname();
  // The menu is "open for" one pathname, so it closes by itself on navigation
  // without a state-setting effect.
  const [openFor, setOpenFor] = useState<string | null>(null);
  const open = openFor === pathname;

  return (
    <div
      className="flex items-center gap-2"
      onKeyDown={(event) => {
        if (event.key === "Escape") setOpenFor(null);
      }}
    >
      <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
        {links.map(({ href, label }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cx(
                "rounded-lg px-3 py-2 text-sm transition-colors hover:text-foreground",
                active ? "bg-foreground/5 text-foreground" : "text-muted",
                focusRing,
              )}
            >
              {label}
            </Link>
          );
        })}
      </nav>

      <Link href="/games" className={cx(btn("primary", "sm"), "hidden md:inline-flex")}>
        Browse games
      </Link>

      <button
        type="button"
        aria-expanded={open}
        aria-controls="site-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpenFor(open ? null : pathname)}
        className={cx(
          "flex size-10 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-foreground/5 md:hidden",
          focusRing,
        )}
      >
        {open ? (
          <X size={20} strokeWidth={1.5} aria-hidden="true" />
        ) : (
          <Menu size={20} strokeWidth={1.5} aria-hidden="true" />
        )}
      </button>

      {open && (
        <div
          id="site-menu"
          className="absolute inset-x-0 top-full border-b border-border bg-background md:hidden"
        >
          <nav aria-label="Mobile" className="mx-auto flex max-w-6xl flex-col gap-1 p-4">
            {links.map(({ href, label }) => {
              const active = isActive(pathname, href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cx(
                    "flex h-12 items-center rounded-lg px-3 text-base transition-colors hover:bg-foreground/5",
                    active ? "bg-foreground/5 text-foreground" : "text-muted",
                    focusRing,
                  )}
                >
                  {label}
                </Link>
              );
            })}
            <Link href="/games" className={cx(btn("primary"), "mt-3")}>
              Browse games
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
}
