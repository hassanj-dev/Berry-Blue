import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Markdown } from "@/components/blog/Markdown";
import { Container } from "@/components/site/Container";
import { JsonLd } from "@/components/site/JsonLd";
import {
  cx,
  focusRing,
  h1Class,
  h2Class,
  iconInline,
  metaText,
  skeletonBlock,
  surfaceCard,
} from "@/components/site/ui";
import { formatPostDate, getPost, getPosts, readingMinutes } from "@/lib/blog";
import { siteConfig } from "@/lib/site";

type Params = Promise<{ slug: string }>;

const backLink = cx(
  "inline-flex items-center gap-1 rounded-sm text-sm text-muted transition-colors hover:text-foreground",
  focusRing,
);

export default function BlogPostPage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<PostSkeleton />}>
      <Post params={params} />
    </Suspense>
  );
}

async function Post({ params }: { params: Params }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const url = `${siteConfig.url}/blog/${post.slug}`;

  return (
    <>
      <Container size="narrow" className="py-8 md:py-10">
        <article>
          {/* React hoists these into <head>. */}
          <title>{`${post.title} | ${siteConfig.name}`}</title>
          {post.excerpt && <meta name="description" content={post.excerpt} />}
          <link rel="canonical" href={url} />
          <meta property="og:type" content="article" />
          <meta property="og:url" content={url} />
          <meta property="og:site_name" content={siteConfig.name} />
          <meta name="twitter:card" content={post.cover_url ? "summary_large_image" : "summary"} />
          <JsonLd
            data={{
              "@context": "https://schema.org",
              "@type": "BlogPosting",
              headline: post.title,
              description: post.excerpt || undefined,
              image: post.cover_url || undefined,
              datePublished: post.published_at,
              dateModified: post.updated_at,
              mainEntityOfPage: url,
              publisher: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
            }}
          />
          <meta property="og:title" content={post.title} />
          {post.excerpt && <meta property="og:description" content={post.excerpt} />}
          {post.cover_url && <meta property="og:image" content={post.cover_url} />}

          <header className="rise-in flex flex-col gap-5">
            <nav aria-label="Breadcrumb">
              <Link href="/blog" className={backLink}>
                <ArrowLeft {...iconInline} /> Back to blog
              </Link>
            </nav>
            <h1 className={h1Class}>{post.title}</h1>
            <p className={metaText}>
              <time dateTime={post.published_at}>{formatPostDate(post.published_at)}</time>
              {" · "}
              {readingMinutes(post.content)} min read
            </p>
          </header>

          {post.cover_url && (
            <div className="relative mt-10 aspect-[1200/630] w-full overflow-hidden rounded-2xl border border-border bg-surface">
              <Image
                src={post.cover_url}
                alt=""
                fill
                priority
                sizes="(min-width: 768px) 720px, 100vw"
                className="object-cover"
              />
            </div>
          )}

          <div className="mt-10 text-base sm:text-[1.0625rem]">
            <Markdown source={post.content} />
          </div>

          <p className="mt-10 pt-2">
            <Link href="/blog" className={backLink}>
              <ArrowLeft {...iconInline} /> All posts
            </Link>
          </p>
        </article>
      </Container>
      <Suspense fallback={null}>
        <MoreArticles currentSlug={post.slug} />
      </Suspense>
    </>
  );
}

/** The latest other articles. Renders nothing when there are none. */
async function MoreArticles({ currentSlug }: { currentSlug: string }) {
  const others = (await getPosts()).filter((p) => p.slug !== currentSlug).slice(0, 3);
  if (others.length === 0) return null;

  return (
    <section aria-labelledby="more-articles">
      <Container className="flex flex-col gap-8 py-8 md:py-10">
        <h2 id="more-articles" className={h2Class}>
          More articles
        </h2>
        <ul className="grid gap-4 md:grid-cols-3">
          {others.map((item) => (
            <li key={item.id}>
              <Link
                href={`/blog/${item.slug}`}
                className={cx(
                  "group flex h-full flex-col gap-2 p-6 transition-colors hover:border-foreground/30",
                  surfaceCard,
                  focusRing,
                )}
              >
                <time dateTime={item.published_at} className={metaText}>
                  {formatPostDate(item.published_at)}
                </time>
                <h3 className="text-lg font-semibold leading-snug">{item.title}</h3>
                {item.excerpt && <p className="line-clamp-2 text-sm text-muted">{item.excerpt}</p>}
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

function PostSkeleton() {
  const block = skeletonBlock;
  return (
    <Container size="narrow" className="py-8 md:py-10">
      <div role="status" className="flex flex-col gap-5">
        <span className="sr-only">Loading article</span>
        <div className={cx("h-4 w-28", block)} />
        <div className={cx("h-12 w-full", block)} />
        <div className={cx("h-12 w-2/3", block)} />
        <div className={cx("mt-5 aspect-[1200/630] w-full", block)} />
      </div>
    </Container>
  );
}
