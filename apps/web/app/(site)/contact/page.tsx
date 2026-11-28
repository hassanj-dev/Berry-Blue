import { ArrowRight, Gamepad2, Handshake, Mail, type LucideIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/layout/ContactForm";
import { Container } from "@/components/site/Container";
import { PageHero } from "@/components/site/PageHero";
import { SectionHeading } from "@/components/site/SectionHeading";
import { cx, focusRing, iconProps, surfaceCard } from "@/components/site/ui";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Questions, feedback or a problem with a game? Send us a message.",
  alternates: { canonical: "/contact" },
};

type InfoItem = { Icon: LucideIcon; title: string; text: string; href?: string };

// Contact details come only from siteConfig. Nothing is invented here.
const info: InfoItem[] = [
  ...(siteConfig.contactEmail
    ? [
        {
          Icon: Mail,
          title: "Email",
          text: siteConfig.contactEmail,
          href: `mailto:${siteConfig.contactEmail}`,
        },
      ]
    : []),
  {
    Icon: Gamepad2,
    title: "A game does not work?",
    text: "Tell us the game name, your device, browser and what happened.",
  },
  {
    Icon: Handshake,
    title: "Game owners and providers",
    text: "Write to us to add or remove a game.",
  },
];

const help = [
  { title: "FAQs", text: "Quick answers to common questions.", href: "/faqs" },
  { title: "Game guides", text: "Step-by-step help for your games.", href: "/guides" },
  { title: "Blog", text: "News, tips and updates.", href: "/blog" },
];

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Contact us"
        description="Questions, feedback or a problem with a game? Send us a message."
      />

      <section className="py-12 md:py-16">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[5fr_7fr] lg:gap-16">
            <div className="flex flex-col gap-8">
              <h2 className="text-xl font-semibold">Other ways to reach us</h2>
              <ul className="flex flex-col gap-6">
                {info.map(({ Icon, title, text, href }) => (
                  <li key={title} className="flex gap-4">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-surface text-muted">
                      <Icon {...iconProps} />
                    </span>
                    <div className="flex min-w-0 flex-col gap-1 text-sm">
                      <p className="font-medium">{title}</p>
                      {href ? (
                        <a
                          href={href}
                          className={cx(
                            "break-words rounded-sm text-foreground underline underline-offset-2",
                            focusRing,
                          )}
                        >
                          {text}
                        </a>
                      ) : (
                        <p className="text-muted">{text}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className={`p-6 md:p-8 ${surfaceCard}`}>
              <ContactForm />
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-border py-12 md:py-16">
        <Container className="flex flex-col gap-8">
          <SectionHeading
            title="Looking for a quick answer?"
            description="These pages may already cover it."
          />
          <ul className="grid gap-4 md:grid-cols-3">
            {help.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cx(
                    "group flex h-full items-center justify-between gap-4 p-5 transition-colors hover:border-foreground/30",
                    surfaceCard,
                    focusRing,
                  )}
                >
                  <div className="flex flex-col gap-1">
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-sm text-muted">{item.text}</p>
                  </div>
                  <ArrowRight
                    size={18}
                    strokeWidth={1.5}
                    aria-hidden="true"
                    className="shrink-0 text-muted transition-colors group-hover:text-foreground"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </>
  );
}
