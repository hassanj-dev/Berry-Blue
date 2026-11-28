import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { z } from "zod";
import { BlogForm, type BlogRow } from "@/components/BlogForm";
import { requireAdmin } from "@/lib/auth";
import { createSecretClient } from "@/lib/supabase/secret";

export const metadata: Metadata = { title: "Edit post" };

export default async function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();

  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();

  const { data, error } = await createSecretClient()
    .from("blog_posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`blog load failed: ${error.message}`);
  if (!data) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Edit post</h1>
      <BlogForm post={data as BlogRow} />
    </div>
  );
}
