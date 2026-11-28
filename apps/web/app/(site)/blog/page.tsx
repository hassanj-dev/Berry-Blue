import { ArrowRight, Newspaper } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { Container } from "@/components/site/Container";
import { EmptyState } from "@/components/site/EmptyState";
import { PageHero } from "@/components/site/PageHero";
import {
  btn,
  cx,
  focusRing,
  h2Class,
  iconInline,
  iconProps,
  metaText,
  skeletonBlock,
} from "@/components/site/ui";
import { formatPostDate, getPosts } from "@/lib/blog";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Blog",
  description: `News, tips and updates from ${siteConfig.name}.`,
  alternates: { canonical: "/blog" },
};

type Post = Awaited<ReturnType<typeof getPosts>>[number];

/**
 * The page shell (hero, metadata) is static. The data read lives inside
 * <BlogContent>, which is wrapped in <Suspense>. That is what Next 16 asks for
 * when a route reads uncached data: the shell prerenders instantly and the
 * articles stream in behind a skeleton.
 */
export default function BlogPage() {
  return (
    <>
      <PageHero
        eyebrow="Blog"
        title="News and tips"
        description={`News, tips and updates from ${siteConfig.name}`}
      />
      <Container className="py-8 md:py-10">
        <Suspense fallback={<BlogSkeleton />}>
          <BlogContent />
        </Suspense>
      </Container>
    </>
  );
}

async function BlogContent() {
  const [featured, ...rest] = await getPosts();

  if (!featured) {
    return (
      <EmptyState
        icon={Newspaper}
        title="No articles yet"
        description="New articles will appear here as soon as they are published"
      >
        <Link href="/games" className={btn("secondary", "sm")}>
          Browse games
        </Link>
      </EmptyState>
    );
  }

  return (
    <div className="flex flex-col gap-16">
      <FeaturedPost post={featured} />
      {rest.length > 0 && (
        <section aria-labelledby="latest-articles" className="flex flex-col gap-6 pt-2">
          <h2 id="latest-articles" className={h2Class}>
            Latest articles
          </h2>
          <ul className="grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((post) => (
              <li key={post.id}>
                <PostCard post={post} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function PostCover({
  post,
  sizes,
  priority = false,
}: {
  post: Post;
  sizes: string;
  priority?: boolean;
}) {
  return (
    <div className="relative aspect-[1200/630] w-full overflow-hidden rounded-2xl border border-border bg-surface">
      {post.cover_url ? (
        // Decorative: the linked title next to it already names the article.
        <Image
          src={post.cover_url}
          alt=""
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      ) : (
        <div className="flex size-full items-center justify-center text-muted">
          <Newspaper {...iconProps} />
        </div>
      )}
    </div>
  );
}

function FeaturedPost({ post }: { post: Post }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={cx(
        "group grid gap-8 rounded-2xl lg:grid-cols-12 lg:items-center lg:gap-10",
        focusRing,
      )}
    >
      <div className="lg:col-span-7">
        <PostCover
          post={post}
          priority
          sizes="(min-width: 1280px) 720px, (min-width: 1024px) 58vw, 100vw"
        />
      </div>
      <div className="flex flex-col gap-4 lg:col-span-5">
        <p className="text-sm text-muted">Featured</p>
        <h2 className="text-balance text-2xl font-semibold leading-tight tracking-tight decoration-1 underline-offset-4 group-hover:underline sm:text-3xl">
          {post.title}
        </h2>
        {post.excerpt && (
          <p className="line-clamp-4 text-pretty text-base leading-relaxed text-muted sm:text-[1.0625rem]">
            {post.excerpt}
          </p>
        )}
        <div className="flex items-center justify-between gap-4 pt-2">
          <time dateTime={post.published_at} className={metaText}>
            {formatPostDate(post.published_at)}
          </time>
          <span className="inline-flex items-center gap-1 text-sm font-medium">
            Read article <ArrowRight {...iconInline} />
          </span>
        </div>
      </div>
    </Link>
  );
}

function PostCard({ post }: { post: Post }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={cx("group flex h-full flex-col gap-4 rounded-2xl", focusRing)}
    >
      <PostCover post={post} sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw" />
      <div className="flex flex-col gap-2">
        <time dateTime={post.published_at} className={metaText}>
          {formatPostDate(post.published_at)}
        </time>
        <h3 className="text-xl font-semibold leading-snug tracking-tight decoration-1 underline-offset-4 group-hover:underline">
          {post.title}
        </h3>
        {post.excerpt && <p className="line-clamp-2 text-pretty text-muted">{post.excerpt}</p>}
      </div>
    </Link>
  );
}

function BlogSkeleton() {
  const block = skeletonBlock;
  return (
    <div role="status" className="flex flex-col gap-16">
      <span className="sr-only">Loading articles</span>
      <div className="grid gap-8 lg:grid-cols-12 lg:items-center lg:gap-10">
        <div className={cx("aspect-[1200/630] w-full lg:col-span-7", block)} />
        <div className="flex flex-col gap-4 lg:col-span-5">
          <div className={cx("h-4 w-20", block)} />
          <div className={cx("h-10 w-full", block)} />
          <div className={cx("h-10 w-2/3", block)} />
          <div className={cx("h-16 w-full", block)} />
        </div>
      </div>
      <div className="grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex flex-col gap-4">
            <div className={cx("aspect-[1200/630] w-full", block)} />
            <div className={cx("h-6 w-4/5", block)} />
            <div className={cx("h-4 w-full", block)} />
          </div>
        ))}
      </div>
    </div>
  );
}
