import type { Metadata } from "next";
import Link from "next/link";
import type { BlogRow } from "@/components/BlogForm";
import { BlogRowActions } from "@/components/BlogRowActions";
import { PageHeader } from "@/components/ui/PageHeader";
import { requireAdmin } from "@/lib/auth";
import { createSecretClient } from "@/lib/supabase/secret";

export const metadata: Metadata = { title: "Blog" };

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export default async function BlogPage() {
  await requireAdmin();

  const { data, error } = await createSecretClient()
    .from("blog_posts")
    .select("id, title, slug, cover_url, status, published_at, updated_at")
    .order("created_at", { ascending: false });
  if (error) throw new Error(`blog list failed: ${error.message}`);

  const posts = (data ?? []) as Pick<
    BlogRow,
    "id" | "title" | "slug" | "cover_url" | "status" | "published_at" | "updated_at"
  >[];

  return (
    <div>
      <PageHeader
        title="Blog"
        description="Write articles here. Published ones appear on the Blog page of the website."
        actions={
          <Link
            href="/blog/new"
            className="flex h-10 items-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground"
          >
            New post
          </Link>
        }
      />

      {posts.length === 0 ? (
        <p className="text-muted">No posts yet. Write your first article.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface text-muted">
              <tr>
                <th className="px-3 py-2">Post</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => {
                const live = post.status === "published";
                return (
                  <tr key={post.id} className="border-t border-border align-middle">
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-3">
                        {post.cover_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={post.cover_url}
                            alt=""
                            className="h-12 w-20 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="h-12 w-20 rounded-lg bg-surface" />
                        )}
                        <div className="min-w-0">
                          <p className="truncate font-medium">{post.title}</p>
                          <p className="truncate text-xs text-muted">/blog/{post.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          live ? "bg-green-500/15 text-green-500" : "bg-foreground/10 text-muted"
                        }`}
                      >
                        {live ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-muted">
                      {dateFormat.format(
                        new Date(live && post.published_at ? post.published_at : post.updated_at),
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/blog/${post.id}`}
                          className="flex h-8 items-center rounded-lg border border-border px-3 text-xs font-medium hover:bg-foreground/10"
                        >
                          Edit
                        </Link>
                        <BlogRowActions id={post.id} published={live} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
