import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Container } from "@/components/site/Container";
import { JsonLd } from "@/components/site/JsonLd";
import { Keycap } from "@/components/site/Keycap";
import {
  btn,
  cx,
  focusRing,
  h1Class,
  h2Class,
  iconInline,
  metaText,
  skeletonBlock,
  surfaceCard,
} from "@/components/site/ui";
import { getGuide, getGuides } from "@/lib/content";
import { siteConfig } from "@/lib/site";

/** Long enough to be worth a table of contents. */
const TOC_MIN_STEPS = 5;

async function GuideView({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = await getGuide(slug);
  if (!guide) notFound();

  const showToc = guide.steps.length >= TOC_MIN_STEPS;

  return (
    <>
      {/* React hoists these into <head>. Kept from the original page, which
          used this approach instead of generateMetadata under Suspense. */}
      <title>{`${guide.title} | ${siteConfig.name}`}</title>
      {guide.summary && <meta name="description" content={guide.summary} />}
      <link rel="canonical" href={`${siteConfig.url}/guides/${guide.slug}`} />
      <meta property="og:type" content="article" />
      <meta property="og:title" content={guide.title} />
      {guide.summary && <meta property="og:description" content={guide.summary} />}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "HowTo",
          name: guide.title,
          description: guide.summary || undefined,
          step: guide.steps.map((step, index) => ({
            "@type": "HowToStep",
            position: index + 1,
            name: step.title,
            text: step.body,
          })),
        }}
      />

      <section>
        <Container className="grid py-8 md:py-10 lg:grid-cols-12 lg:gap-10">
          <div className="rise-in flex flex-col gap-6 lg:col-span-9">
            <nav aria-label="Breadcrumb" className="text-sm text-muted">
              <Link
                href="/guides"
                className={cx(
                  "inline-flex items-center gap-1 rounded-sm transition-colors hover:text-foreground",
                  focusRing,
                )}
              >
                <ArrowLeft {...iconInline} /> Back to guides
              </Link>
            </nav>
            <div className="flex flex-col gap-5">
              <h1 className={h1Class}>{guide.title}</h1>
              {guide.summary && (
                <p className="max-w-xl text-pretty text-base leading-relaxed text-muted sm:text-[1.0625rem]">
                  {guide.summary}
                </p>
              )}
            </div>
            <p className={metaText}>
              {guide.steps.length} {guide.steps.length === 1 ? "step" : "steps"}
            </p>
          </div>
        </Container>
      </section>

      <Container className="grid gap-10 py-8 md:py-10 lg:grid-cols-12 lg:gap-10">
        {showToc && (
          <aside className="lg:col-span-4">
            <nav aria-labelledby="toc-heading" className="flex flex-col gap-4 lg:sticky lg:top-24">
              <h2 id="toc-heading" className="text-sm font-medium">
                On this page
              </h2>
              <ol className="flex flex-col">
                {guide.steps.map((step, index) => (
                  <li key={index}>
                    <a
                      href={`#step-${index + 1}`}
                      className={cx(
                        "flex items-baseline gap-3 rounded-md py-2 text-sm text-muted transition-colors hover:text-foreground",
                        focusRing,
                      )}
                    >
                      <span aria-hidden="true" className={cx("w-5 shrink-0", metaText)}>
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span>{step.title}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>
        )}

        <div className={cx("flex flex-col gap-10", showToc ? "lg:col-span-8" : "lg:col-span-9")}>
          {guide.steps.length === 0 ? (
            <p className={cx("p-6 text-muted", surfaceCard)}>This guide has no steps yet</p>
          ) : (
            <ol className="border-b border-border">
              {guide.steps.map((step, index) => (
                <li
                  key={index}
                  id={`step-${index + 1}`}
                  className="flex scroll-mt-24 gap-5 border-t border-border py-6"
                >
                  <Keycap>{index + 1}</Keycap>
                  <div className="flex min-w-0 max-w-2xl flex-col gap-2">
                    <h2 className="pt-1 text-xl font-semibold leading-snug tracking-tight">
                      {step.title}
                    </h2>
                    <p className="whitespace-pre-line text-pretty leading-relaxed text-muted">
                      {step.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          )}

          <div
            className={cx(
              "flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between",
              surfaceCard,
            )}
          >
            <div className="flex flex-col gap-1">
              <p className="font-semibold">Still stuck?</p>
              <p className="text-sm text-muted">Tell us what happened and we will take a look</p>
            </div>
            <Link href="/contact" className={btn("primary", "sm")}>
              Contact us
            </Link>
          </div>
        </div>
      </Container>

      <Suspense fallback={null}>
        <RelatedGuides currentSlug={guide.slug} />
      </Suspense>
    </>
  );
}

/** Other guides from the same table. Renders nothing when there are none. */
async function RelatedGuides({ currentSlug }: { currentSlug: string }) {
  const others = (await getGuides()).filter((g) => g.slug !== currentSlug).slice(0, 3);
  if (others.length === 0) return null;

  return (
    <section>
      <Container className="flex flex-col gap-8 py-8 md:py-10">
        <h2 className={h2Class}>More guides</h2>
        <ul className="grid gap-4 md:grid-cols-3">
          {others.map((guide) => (
            <li key={guide.id}>
              <Link
                href={`/guides/${guide.slug}`}
                className={cx(
                  "group flex h-full flex-col gap-2 p-6 transition-colors hover:border-foreground/30",
                  surfaceCard,
                  focusRing,
                )}
              >
                <h3 className="text-lg font-semibold leading-snug">{guide.title}</h3>
                {guide.summary && (
                  <p className="line-clamp-2 text-sm text-muted">{guide.summary}</p>
                )}
                <span className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-medium">
                  Read guide <ArrowRight {...iconInline} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

function GuideSkeleton() {
  const block = skeletonBlock;
  return (
    <div role="status">
      <span className="sr-only">Loading guide</span>
      <Container className="flex flex-col gap-4 py-8 md:py-10">
        <div className={cx("h-4 w-28", block)} />
        <div className={cx("h-12 w-full max-w-xl", block)} />
        <div className={cx("h-5 w-full max-w-lg", block)} />
        <div className="mt-8 flex max-w-3xl flex-col gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className={cx("h-28", block)} />
          ))}
        </div>
      </Container>
    </div>
  );
}

export default function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<GuideSkeleton />}>
      <GuideView params={params} />
    </Suspense>
  );
}
