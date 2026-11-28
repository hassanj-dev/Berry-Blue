import Link from "next/link";
import { siteConfig } from "@/lib/site";
import { Container } from "./Container";
import { cx, focusRing } from "./ui";

const groups = [
  {
    title: "Explore",
    links: [
      { label: "Games", href: "/games" },
      { label: "Guides", href: "/guides" },
      { label: "Blog", href: "/blog" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "About", href: "/about" },
      { label: "FAQs", href: "/faqs" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms of Service", href: "/terms-of-service" },
    ],
  },
] as const;

export function SiteFooter() {
  // No current year on purpose: reading the clock in a server component needs
  // extra handling under Next's cache components and adds nothing here.
  return (
    <footer className="border-t border-border bg-surface">
      <Container className="py-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-[2fr_1fr_1fr_1fr]">
          <div className="flex max-w-xs flex-col gap-3">
            <p className="text-lg font-semibold tracking-tight">{siteConfig.name}</p>
            <p className="text-sm text-muted">Free games, instantly, right in your browser.</p>
          </div>
          {groups.map((group) => (
            <nav key={group.title} aria-label={group.title} className="flex flex-col gap-3">
              <h2 className="text-sm font-medium">{group.title}</h2>
              <ul className="flex flex-col gap-1">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={cx(
                        "inline-flex rounded-md py-1 text-sm text-muted transition-colors hover:text-foreground",
                        focusRing,
                      )}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <p className="mt-12 border-t border-border pt-6 text-sm text-muted">© {siteConfig.name}</p>
      </Container>
    </footer>
  );
}
