import { ArrowRight, Newspaper } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { Container } from "@/components/site/Container";
import { EmptyState } from "@/components/site/EmptyState";
import { PageHero } from "@/components/site/PageHero";
import { btn, cx, focusRing, iconProps } from "@/components/site/ui";
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
        description={`News, tips and updates from ${siteConfig.name}.`}
      />
      <Container className="py-12 md:py-16">
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
        description="New articles will appear here as soon as they are published."
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
        <section aria-labelledby="latest-articles" className="flex flex-col gap-8">
          <h2 id="latest-articles" className="text-2xl font-semibold tracking-tight">
            Latest articles
          </h2>
          <ul className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
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
    <div className="relative aspect-[1200/630] w-full overflow-hidden rounded-xl border border-border bg-surface">
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
      className={cx("group grid gap-8 rounded-2xl lg:grid-cols-12 lg:items-center", focusRing)}
    >
      <div className="lg:col-span-7">
        <PostCover
          post={post}
          priority
          sizes="(min-width: 1280px) 660px, (min-width: 1024px) 58vw, 100vw"
        />
      </div>
      <div className="flex flex-col gap-4 lg:col-span-5">
        <p className="text-sm font-medium text-muted">Featured</p>
        <h2 className="text-balance text-3xl font-semibold leading-tight tracking-tight decoration-1 underline-offset-4 group-hover:underline sm:text-4xl">
          {post.title}
        </h2>
        {post.excerpt && <p className="line-clamp-4 text-muted">{post.excerpt}</p>}
        <div className="flex items-center gap-4 text-sm">
          <time dateTime={post.published_at} className="text-muted">
            {formatPostDate(post.published_at)}
          </time>
          <span className="inline-flex items-center gap-1 font-medium">
            Read article <ArrowRight size={16} strokeWidth={1.5} aria-hidden="true" />
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
      className={cx("group flex h-full flex-col gap-4 rounded-xl", focusRing)}
    >
      <PostCover post={post} sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw" />
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold leading-snug decoration-1 underline-offset-4 group-hover:underline">
          {post.title}
        </h3>
        {post.excerpt && <p className="line-clamp-2 text-sm text-muted">{post.excerpt}</p>}
        <time dateTime={post.published_at} className="text-sm text-muted">
          {formatPostDate(post.published_at)}
        </time>
      </div>
    </Link>
  );
}

function BlogSkeleton() {
  const block = "animate-pulse rounded-xl bg-foreground/5 motion-reduce:animate-none";
  return (
    <div role="status" className="flex flex-col gap-16">
      <span className="sr-only">Loading articles</span>
      <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
        <div className={cx("aspect-[1200/630] w-full lg:col-span-7", block)} />
        <div className="flex flex-col gap-4 lg:col-span-5">
          <div className={cx("h-4 w-20", block)} />
          <div className={cx("h-10 w-full", block)} />
          <div className={cx("h-10 w-2/3", block)} />
          <div className={cx("h-16 w-full", block)} />
        </div>
      </div>
      <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
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
