import { Handshake, ShieldCheck, Smartphone, Zap, type LucideIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/site/Container";
import { Keycap } from "@/components/site/Keycap";
import { PageHero } from "@/components/site/PageHero";
import { SectionHeading } from "@/components/site/SectionHeading";
import { btn, iconProps, surfaceCard } from "@/components/site/ui";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: `${siteConfig.name} is a place to play free games instantly, right in your browser.`,
  alternates: { canonical: "/about" },
};

// All copy below is carried over from the previous About page. Nothing new is
// claimed here. The owner should confirm each statement still matches the site.
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
      >
        <div className="flex flex-wrap gap-3">
          <Link href="/games" className={btn("primary")}>
            Browse games
          </Link>
          <Link href="/contact" className={btn("secondary")}>
            Contact us
          </Link>
        </div>
        <ul
          className={`mt-12 grid divide-y divide-border overflow-hidden sm:grid-cols-3 sm:divide-x sm:divide-y-0 ${surfaceCard}`}
        >
          {facts.map((fact) => (
            <li key={fact.value} className="flex flex-col gap-1 p-6">
              <span className="text-xl font-semibold">{fact.value}</span>
              <span className="text-sm text-muted">{fact.label}</span>
            </li>
          ))}
        </ul>
      </PageHero>

      <section className="py-16 md:py-24">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[5fr_7fr] lg:gap-16">
            <SectionHeading title={`About ${siteConfig.name}`} />
            <div className="flex max-w-xl flex-col gap-4 text-lg text-muted">
              <p>
                {siteConfig.name} is a place to play free games instantly, right in your browser.
              </p>
              <p>
                We are still building, and the games you see now are samples we use for testing.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-border py-16 md:py-24">
        <Container className="flex flex-col gap-10">
          <SectionHeading
            title="What makes it useful"
            description="The parts of the site that matter when you just want to play."
          />
          <ul className="grid gap-4 sm:grid-cols-2">
            {features.map(({ Icon, title, text }) => (
              <li key={title} className={`flex gap-4 p-6 ${surfaceCard}`}>
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-muted">
                  <Icon {...iconProps} />
                </span>
                <div className="flex flex-col gap-1">
                  <h3 className="font-semibold">{title}</h3>
                  <p className="text-sm text-muted">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="border-t border-border py-16 md:py-24">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[5fr_7fr] lg:gap-16">
            <SectionHeading
              title="From click to play in seconds"
              description="Four steps, from the game list to your Favorites."
            />
            <ol className={`flex flex-col divide-y divide-border ${surfaceCard}`}>
              {steps.map((step, index) => (
                <li key={step.title} className="flex items-start gap-4 p-5 sm:p-6">
                  <Keycap>{index + 1}</Keycap>
                  <div className="flex flex-col gap-1">
                    <h3 className="font-semibold">{step.title}</h3>
                    <p className="text-sm text-muted">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </section>

      <section className="border-t border-border py-16 md:py-24">
        <Container>
          <div
            className={`flex flex-col gap-6 p-8 md:flex-row md:items-center md:justify-between md:p-12 ${surfaceCard}`}
          >
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Ready to play?</h2>
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
