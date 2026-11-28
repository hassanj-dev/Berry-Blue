"use client";

import { deleteBlog, toggleBlog } from "@/lib/blog-actions";

export function BlogRowActions({ id, published }: { id: string; published: boolean }) {
  const button =
    "flex h-8 cursor-pointer items-center rounded-lg border border-border px-3 text-xs font-medium hover:bg-foreground/10";
  return (
    <>
      <form action={toggleBlog}>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="next" value={published ? "0" : "1"} />
        <button type="submit" className={button}>
          {published ? "Unpublish" : "Publish"}
        </button>
      </form>
      <form
        action={deleteBlog}
        onSubmit={(event) => {
          if (!window.confirm("Delete this post for good?")) event.preventDefault();
        }}
      >
        <input type="hidden" name="id" value={id} />
        <button type="submit" className={button + " text-red-400 hover:bg-red-500/10"}>
          Delete
        </button>
      </form>
    </>
  );
}
