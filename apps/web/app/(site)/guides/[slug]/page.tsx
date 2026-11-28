import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Container } from "@/components/site/Container";
import { Keycap } from "@/components/site/Keycap";
import { btn, cx, focusRing, surfaceCard } from "@/components/site/ui";
import { getGuide, getGuides } from "@/lib/content";

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
      <title>{guide.title}</title>
      {guide.summary && <meta name="description" content={guide.summary} />}

      <section className="border-b border-border">
        <Container className="py-10 md:py-16">
          <div className="flex max-w-3xl flex-col gap-6">
            <nav aria-label="Breadcrumb" className="text-sm text-muted">
              <Link
                href="/guides"
                className={cx(
                  "inline-flex items-center gap-1 rounded-sm transition-colors hover:text-foreground",
                  focusRing,
                )}
              >
                <ArrowLeft size={16} strokeWidth={1.5} aria-hidden="true" /> Back to guides
              </Link>
            </nav>
            <div className="flex flex-col gap-4">
              <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
                {guide.title}
              </h1>
              {guide.summary && <p className="text-base text-muted sm:text-lg">{guide.summary}</p>}
            </div>
            <p className="text-sm text-muted tabular-nums">
              {guide.steps.length} {guide.steps.length === 1 ? "step" : "steps"}
            </p>
          </div>
        </Container>
      </section>

      <Container className="py-12 md:py-16">
        <div
          className={cx("grid gap-8", showToc && "lg:grid-cols-[minmax(0,48rem)_16rem] lg:gap-16")}
        >
          {showToc && (
            <aside className="lg:col-start-2 lg:row-start-1">
              <nav
                aria-labelledby="toc-heading"
                className={cx("flex flex-col gap-3 p-5 lg:sticky lg:top-24", surfaceCard)}
              >
                <h2 id="toc-heading" className="text-sm font-medium">
                  On this page
                </h2>
                <ol className="flex flex-col gap-1">
                  {guide.steps.map((step, index) => (
                    <li key={index}>
                      <a
                        href={`#step-${index + 1}`}
                        className={cx(
                          "flex items-start gap-3 rounded-md py-1 text-sm text-muted transition-colors hover:text-foreground",
                          focusRing,
                        )}
                      >
                        <span aria-hidden="true" className="w-4 shrink-0 text-right tabular-nums">
                          {index + 1}
                        </span>
                        <span>{step.title}</span>
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            </aside>
          )}

          <div
            className={cx(
              "flex max-w-3xl flex-col gap-10",
              showToc && "lg:col-start-1 lg:row-start-1",
            )}
          >
            {guide.steps.length === 0 ? (
              <p className={cx("p-6 text-muted", surfaceCard)}>This guide has no steps yet.</p>
            ) : (
              <ol className="flex flex-col gap-4">
                {guide.steps.map((step, index) => (
                  <li
                    key={index}
                    id={`step-${index + 1}`}
                    className={cx("flex scroll-mt-24 gap-4 p-5 sm:p-6", surfaceCard)}
                  >
                    <Keycap>{index + 1}</Keycap>
                    <div className="flex min-w-0 flex-col gap-2">
                      <h2 className="text-lg font-semibold leading-snug">{step.title}</h2>
                      <p className="whitespace-pre-line leading-relaxed text-muted">{step.body}</p>
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
                <p className="text-sm text-muted">Tell us what happened and we will take a look.</p>
              </div>
              <Link href="/contact" className={btn("primary", "sm")}>
                Contact us
              </Link>
            </div>
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
    <section className="border-t border-border py-12 md:py-16">
      <Container className="flex flex-col gap-6">
        <h2 className="text-2xl font-semibold tracking-tight">More guides</h2>
        <ul className="grid gap-4 md:grid-cols-3">
          {others.map((guide) => (
            <li key={guide.id}>
              <Link
                href={`/guides/${guide.slug}`}
                className={cx(
                  "group flex h-full flex-col gap-2 p-5 transition-colors hover:border-foreground/30",
                  surfaceCard,
                  focusRing,
                )}
              >
                <h3 className="font-semibold leading-snug">{guide.title}</h3>
                {guide.summary && (
                  <p className="line-clamp-2 text-sm text-muted">{guide.summary}</p>
                )}
                <span className="mt-auto inline-flex items-center gap-1 pt-2 text-sm font-medium">
                  Read guide <ArrowRight size={16} strokeWidth={1.5} aria-hidden="true" />
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
  const block = "animate-pulse rounded-xl bg-foreground/5 motion-reduce:animate-none";
  return (
    <div role="status">
      <span className="sr-only">Loading guide</span>
      <Container className="flex flex-col gap-4 py-12 md:py-16">
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
