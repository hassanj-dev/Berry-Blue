import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Markdown } from "@/components/blog/Markdown";
import { formatPostDate, getPost } from "@/lib/blog";
import { siteConfig } from "@/lib/site";

export default function BlogPostPage({ params }: PageProps<"/blog/[slug]">) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto h-96 w-full max-w-[720px] animate-pulse rounded-2xl bg-foreground/5" />
      }
    >
      <Post params={params} />
    </Suspense>
  );
}

async function Post({ params }: { params: PageProps<"/blog/[slug]">["params"] }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  return (
    <article className="mx-auto w-full max-w-[720px]">
      {/* React hoists these into <head>. */}
      <title>{`${post.title} | ${siteConfig.name}`}</title>
      {post.excerpt && <meta name="description" content={post.excerpt} />}
      <link rel="canonical" href={`/blog/${post.slug}`} />
      <meta property="og:type" content="article" />
      <meta property="og:title" content={post.title} />
      {post.excerpt && <meta property="og:description" content={post.excerpt} />}
      {post.cover_url && <meta property="og:image" content={post.cover_url} />}

      <p className="mb-3 text-sm text-muted">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>{" "}
        /{" "}
        <Link href="/blog" className="hover:text-foreground">
          Blog
        </Link>
      </p>
      <h1 className="text-3xl font-bold leading-tight md:text-4xl">{post.title}</h1>
      <time dateTime={post.published_at} className="mt-3 block text-sm text-muted">
        {formatPostDate(post.published_at)}
      </time>

      {post.cover_url && (
        <div className="relative mt-6 aspect-[1200/630] w-full overflow-hidden rounded-2xl bg-foreground/10">
          <Image src={post.cover_url} alt="" fill priority sizes="720px" className="object-cover" />
        </div>
      )}

      <div className="mt-6">
        <Markdown source={post.content} />
      </div>

      <p className="mt-10 border-t border-border pt-6">
        <Link href="/blog" className="text-sm font-medium text-primary">
          ← All posts
        </Link>
      </p>
    </article>
  );
}
