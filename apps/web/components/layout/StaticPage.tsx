import { ChevronDown } from "lucide-react";
import { Container } from "@/components/site/Container";
import { PageHero, type HeroMeta } from "@/components/site/PageHero";
import { RichText } from "@/components/site/RichText";
import { cx, focusRing, h2Class, iconProps, metaText } from "@/components/site/ui";
import type { LegalBlock, LegalPage } from "@/lib/static-pages";

function sectionId(index: number) {
  return `section-${index + 1}`;
}

function Contents({ page }: { page: LegalPage }) {
  return (
    <ol className="flex flex-col">
      {page.sections.map((section, index) => (
        <li key={section.heading}>
          <a
            href={`#${sectionId(index)}`}
            className={cx(
              "grid grid-cols-[1.5rem_1fr] items-baseline gap-x-3 rounded-md py-2 text-sm text-muted transition-colors hover:text-foreground",
              focusRing,
            )}
          >
            <span aria-hidden="true" className={metaText}>
              {index + 1}
            </span>
            <span>{section.heading}</span>
          </a>
        </li>
      ))}
    </ol>
  );
}

function Block({ block }: { block: LegalBlock }) {
  if (block.type === "list") {
    return (
      <ul className="border-b border-border">
        {block.items.map((item) => (
          <li key={item} className="text-pretty border-t border-border py-3 leading-relaxed">
            {item}
          </li>
        ))}
      </ul>
    );
  }

  if (block.type === "address") {
    return (
      <address className="flex flex-col gap-1 not-italic leading-relaxed">
        {block.lines.map((line) => (
          <span key={line}>
            <RichText text={line} />
          </span>
        ))}
      </address>
    );
  }

  return (
    <p className="text-pretty leading-relaxed">
      {block.lead && <span className="font-medium text-foreground">{block.lead} </span>}
      <RichText text={block.text} />
    </p>
  );
}

/**
 * A legal document on the page grid: contents on the left, numbered sections
 * on the right. The text comes from lib/static-pages.ts and is shown as written.
 */
export function StaticPage({ page, meta }: { page: LegalPage; meta: HeroMeta[] }) {
  return (
    <>
      <PageHero eyebrow="Legal" title={page.title} meta={meta} />

      <Container className="grid gap-10 py-8 md:py-10 lg:grid-cols-12 lg:gap-10">
        <aside className="lg:col-span-4">
          <nav
            aria-labelledby="contents-heading"
            className="hidden flex-col gap-4 lg:sticky lg:top-24 lg:flex"
          >
            <h2 id="contents-heading" className="text-sm font-medium">
              On this page
            </h2>
            <Contents page={page} />
          </nav>

          <details className="group rounded-2xl border border-border bg-surface lg:hidden">
            <summary
              className={cx(
                "flex h-12 cursor-pointer list-none items-center justify-between rounded-2xl px-5 text-sm font-medium [&::-webkit-details-marker]:hidden",
                focusRing,
              )}
            >
              On this page
              <ChevronDown
                {...iconProps}
                className="text-muted transition-transform group-open:rotate-180 motion-reduce:transition-none"
              />
            </summary>
            <nav aria-label="On this page" className="border-t border-border px-5 py-3">
              <Contents page={page} />
            </nav>
          </details>
        </aside>

        <article className="lg:col-span-8">
          <p className="max-w-2xl text-pretty pb-8 text-base leading-relaxed sm:text-[1.0625rem]">
            <RichText text={page.intro} />
          </p>

          {page.sections.map((section, index) => (
            <section
              key={section.heading}
              id={sectionId(index)}
              aria-labelledby={`${sectionId(index)}-title`}
              className="grid scroll-mt-20 grid-cols-[2rem_1fr] gap-x-3 border-t border-border py-8 sm:grid-cols-[3rem_1fr] sm:gap-x-4"
            >
              <span aria-hidden="true" className={cx("pt-1.5", metaText)}>
                {index + 1}
              </span>
              <div className="flex max-w-2xl flex-col gap-4 text-muted">
                <h2
                  id={`${sectionId(index)}-title`}
                  className="text-xl font-semibold leading-snug tracking-tight text-foreground sm:text-2xl"
                >
                  <span className="sr-only">{index + 1}. </span>
                  {section.heading}
                </h2>
                {section.blocks.map((block, blockIndex) => (
                  <Block key={blockIndex} block={block} />
                ))}
              </div>
            </section>
          ))}
        </article>
      </Container>
    </>
  );
}
