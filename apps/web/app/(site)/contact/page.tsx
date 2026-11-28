import { ArrowRight, Gamepad2, Handshake, type LucideIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/layout/ContactForm";
import { Container } from "@/components/site/Container";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/SectionHeading";
import { SocialLinks } from "@/components/site/SocialLinks";
import { cx, focusRing, h2Class, iconProps, surfaceCard } from "@/components/site/ui";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Questions, feedback or a problem with a game? Send us a message.",
  alternates: { canonical: "/contact" },
};

// Addresses come only from siteConfig, which follows the approved content.
const addresses = [
  { label: "Support", value: siteConfig.contactEmail },
  { label: "Privacy requests", value: siteConfig.privacyEmail },
  { label: "Content and rights", value: siteConfig.legalEmail },
].map((item) => ({ ...item, href: `mailto:${item.value}` }));

const notes: Array<{ Icon: LucideIcon; title: string; text: string }> = [
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
  { title: "FAQs", text: "Quick answers to common questions", href: "/faqs" },
  { title: "Game guides", text: "Step-by-step help for your games", href: "/guides" },
  { title: "Blog", text: "News, tips and updates", href: "/blog" },
];

export default function ContactPage() {
  return (
    <>
      <PageHero
        title="Contact us"
        description="Questions, feedback or a problem with a game? Send us a message."
        meta={addresses}
      />

      <section>
        <Container className="grid gap-12 py-8 md:py-10 lg:grid-cols-12 lg:gap-10">
          <div className="flex flex-col gap-6 lg:col-span-4">
            <h2 className={h2Class}>Before you write</h2>
            <ul className="border-b border-border">
              {notes.map(({ Icon, title, text }) => (
                <li key={title} className="flex gap-4 border-t border-border py-5">
                  <Icon {...iconProps} className="mt-1 shrink-0 text-muted" />
                  <div className="flex flex-col gap-1">
                    <h3 className="font-medium">{title}</h3>
                    <p className="text-pretty text-muted">{text}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold">Find us online</h3>
              <SocialLinks />
            </div>
          </div>

          <div className={cx("p-6 md:p-10 lg:col-span-8", surfaceCard)}>
            <ContactForm />
          </div>
        </Container>
      </section>

      <Section title="Looking for a quick answer?" description="These pages may already cover it">
        <ul className="border-b border-border">
          {help.map((item) => (
            <li key={item.href} className="border-t border-border">
              <Link
                href={item.href}
                className={cx(
                  "group grid grid-cols-[1fr_auto] items-center gap-x-6 gap-y-1 rounded-sm py-5 sm:grid-cols-[10rem_1fr_auto]",
                  focusRing,
                )}
              >
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="col-start-1 text-muted sm:col-start-2">{item.text}</p>
                <ArrowRight
                  {...iconProps}
                  className="col-start-2 row-span-2 row-start-1 text-muted transition-[color,transform] group-hover:translate-x-1 group-hover:text-foreground motion-reduce:transition-none sm:col-start-3 sm:row-span-1"
                />
              </Link>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
