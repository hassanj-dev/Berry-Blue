import { Handshake, ShieldCheck, Smartphone, Zap, type LucideIcon } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/site/Container";
import { Keycap } from "@/components/site/Keycap";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/SectionHeading";
import { SocialLinks } from "@/components/site/SocialLinks";
import { btn, cx, h2Class, iconProps, surfaceCard } from "@/components/site/ui";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: `${siteConfig.name} is a place to play free games instantly, right in your browser.`,
  alternates: { canonical: "/about" },
};

const facts = [
  { value: "Free", label: "Every game costs nothing" },
  { value: "No downloads", label: "Games open in your browser" },
  { value: "Any device", label: "Phone, tablet or computer" },
];

const features: Array<{ Icon: LucideIcon; title: string; text: string }> = [
  { Icon: Zap, title: "Instant play", text: "Pick a game, press Play and start. No sign-up." },
  {
    Icon: ShieldCheck,
    title: "Safe frames",
    text: "Each game runs in a protected frame, separate from the site.",
  },
  {
    Icon: Smartphone,
    title: "Made for phones",
    text: "Fast pages, and a Low Internet mode for slow connections.",
  },
  {
    Icon: Handshake,
    title: "Permission first",
    text: "Games from providers are added only with their permission.",
  },
];

const steps = [
  { title: "Pick a game", text: "Browse all games, Trending or a category." },
  { title: "Press Play", text: "The game opens on its own page, ready to go." },
  { title: "Go full screen", text: "Use the full screen button for a bigger view." },
  { title: "Save it", text: "Tap the heart to add it to your Favorites." },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow={`About ${siteConfig.name}`}
        title="Free games that open in your browser"
        description="Pick a game, press Play and start. No downloads and no sign-up."
        split="even"
        aside={
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-background">
            <Image
              src="/images/about.page.png"
              alt="A blue controller with blue buttons on a dark control panel"
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        }
      >
        <div className="flex flex-wrap gap-3">
          <Link href="/games" className={btn("primary")}>
            Browse games
          </Link>
          <Link href="/contact" className={btn("secondary")}>
            Contact us
          </Link>
        </div>
      </PageHero>

      <section aria-label="At a glance">
        <Container>
          <ul className="grid divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {facts.map((fact) => (
              <li
                key={fact.value}
                className="flex flex-col gap-1 py-6 sm:px-8 sm:py-8 sm:first:pl-0 sm:last:pr-0"
              >
                <span className="text-xl font-semibold tracking-tight">{fact.value}</span>
                <span className="text-sm text-muted">{fact.label}</span>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section>
        <Container className="grid gap-8 py-8 md:py-10 lg:grid-cols-12 lg:gap-10">
          <h2 className={cx(h2Class, "lg:col-span-4")}>About {siteConfig.name}</h2>
          <div className="flex max-w-2xl flex-col gap-5 lg:col-span-8">
            <p className="text-pretty text-xl leading-snug sm:text-[1.5rem] sm:leading-snug">
              {siteConfig.name} is a place to play free games instantly, right in your browser.
            </p>
            <p className="text-pretty text-base leading-relaxed text-muted sm:text-[1.0625rem]">
              Browse Action, Arcade, Casual, Puzzle, Racing, Sports, Strategy and Word games. Every
              game opens on its own page, on any device, with nothing to install.
            </p>
          </div>
        </Container>
      </section>

      <Section
        title="What makes it useful"
        description="The parts of the site that matter when you just want to play"
      >
        <ul className="grid gap-x-10 sm:grid-cols-2">
          {features.map(({ Icon, title, text }) => (
            <li key={title} className="flex flex-col gap-4 border-t border-border pb-10 pt-6">
              <Icon {...iconProps} className="text-muted" />
              <div className="flex flex-col gap-1">
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="text-pretty text-muted">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        title="From click to play in seconds"
        description="Four steps, from the game list to your Favorites"
      >
        <ol className="border-b border-border">
          {steps.map((step, index) => (
            <li
              key={step.title}
              className="grid grid-cols-[auto_1fr] items-center gap-x-5 gap-y-1 border-t border-border py-5 sm:grid-cols-[auto_12rem_1fr]"
            >
              <Keycap className="row-span-2 sm:row-span-1">{index + 1}</Keycap>
              <h3 className="text-lg font-semibold">{step.title}</h3>
              <p className="text-muted">{step.text}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section title="Follow BerryBlue" description="Find us on social media">
        <SocialLinks />
      </Section>

      <section>
        <Container className="py-8 md:py-10">
          <div
            className={cx(
              "flex flex-col gap-8 p-8 md:flex-row md:items-center md:justify-between md:p-12",
              surfaceCard,
            )}
          >
            <div className="flex flex-col gap-2">
              <h2 className={h2Class}>Ready to play?</h2>
              <p className="text-muted">Pick a game and start in seconds</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/games" className={btn("primary")}>
                Browse games
              </Link>
              <Link href="/faqs" className={btn("secondary")}>
                Read the FAQs
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
