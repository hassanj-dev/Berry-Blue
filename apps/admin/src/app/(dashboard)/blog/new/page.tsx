import type { Metadata } from "next";
import { BlogForm } from "@/components/BlogForm";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "New post" };

export default async function NewBlogPage() {
  await requireAdmin();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">New post</h1>
      <BlogForm />
    </div>
  );
}
