import { ArrowDown } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { Container } from "@/components/site/Container";
import { ControlDeck } from "@/components/site/ControlDeck";
import { GuideExplorer } from "@/components/site/GuideExplorer";
import { Keycap } from "@/components/site/Keycap";
import { PageHero } from "@/components/site/PageHero";
import { RichText } from "@/components/site/RichText";
import { SectionHeading } from "@/components/site/SectionHeading";
import { cx, focusRing, h2Class, iconInline, surfaceCard } from "@/components/site/ui";
import { getGuides } from "@/lib/content";
import { gameGuide, type GuideBlock, type GuideSection } from "@/lib/guide-content";

export const metadata: Metadata = {
  title: "Game guides",
  description: gameGuide.intro,
  alternates: { canonical: "/guides" },
};

export default function GuidesPage() {
  return (
    <>
      <PageHero title={gameGuide.title} description={gameGuide.intro} aside={<GuideIndex />} />
      <div>
        {gameGuide.sections.map((section) => (
          <GuideSectionView key={section.id} section={section} />
        ))}
      </div>
      <Suspense fallback={null}>
        <MoreGuides />
      </Suspense>
    </>
  );
}

function GuideIndex() {
  return (
    <nav aria-label="Guide sections">
      <ol className="border-b border-border">
        {gameGuide.sections.map((section) => (
          <li key={section.id} className="border-t border-border">
            <a
              href={`#${section.id}`}
              className={cx(
                "group flex h-12 items-center justify-between gap-4 rounded-sm text-muted transition-colors hover:text-foreground",
                focusRing,
              )}
            >
              <span>{section.title}</span>
              <ArrowDown
                {...iconInline}
                className="shrink-0 text-subtle transition-colors group-hover:text-foreground"
              />
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

function GuideSectionView({ section }: { section: GuideSection }) {
  const headingId = `${section.id}-title`;
  return (
    <section id={section.id} aria-labelledby={headingId} className="scroll-mt-16">
      <Container className="grid gap-6 py-8 md:py-10 lg:grid-cols-12 lg:gap-10">
        <h2 id={headingId} className={cx(h2Class, "lg:col-span-4")}>
          {section.title}
        </h2>
        <div className="flex flex-col gap-6 lg:col-span-8">
          {section.blocks.map((block, index) => (
            <GuideBlockView
              key={index}
              block={block}
              visual={block.type === "list" ? section.visual : undefined}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}

function GuideBlockView({ block, visual }: { block: GuideBlock; visual?: "controls" }) {
  if (block.type === "paragraph") {
    return (
      <p className="max-w-2xl text-pretty text-base leading-relaxed text-muted sm:text-[1.0625rem]">
        <RichText text={block.text} keys />
      </p>
    );
  }

  if (block.type === "steps") {
    return (
      <ol className="border-b border-border">
        {block.items.map((item, index) => (
          <li key={item} className="flex items-start gap-5 border-t border-border py-5">
            <Keycap>{index + 1}</Keycap>
            <p className="max-w-2xl text-pretty pt-1 text-base leading-relaxed sm:text-[1.0625rem]">
              <RichText text={item} keys />
            </p>
          </li>
        ))}
      </ol>
    );
  }

  if (block.type === "list") {
    return (
      <>
        {visual === "controls" && <ControlDeck />}
        <ul className="border-b border-border">
          {block.items.map((item) => (
            <li
              key={item.label}
              className="text-pretty border-t border-border py-4 leading-relaxed text-muted"
            >
              <span className="font-medium text-foreground">{item.label}:</span>{" "}
              <RichText text={item.text} />
            </li>
          ))}
        </ul>
      </>
    );
  }

  return (
    <p className={cx("text-pretty p-5 leading-relaxed text-muted", surfaceCard)}>
      <RichText text={block.text} />
    </p>
  );
}

/** Guides saved in the database. Renders nothing when there are none. */
async function MoreGuides() {
  const guides = await getGuides();
  if (guides.length === 0) return null;

  return (
    <section aria-labelledby="more-guides">
      <Container className="flex flex-col gap-8 py-8 md:py-10">
        <SectionHeading
          id="more-guides"
          title="More guides"
          description="Step-by-step help to get the most out of your games"
        />
        <GuideExplorer guides={guides} />
      </Container>
    </section>
  );
}
