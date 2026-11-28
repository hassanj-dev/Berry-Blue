import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { z } from "zod";
import { GameEditForm } from "@/components/GameEditForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { requireAdmin } from "@/lib/auth";
import { createSecretClient } from "@/lib/supabase/secret";

export const metadata: Metadata = { title: "Edit game" };

type Props = { params: Promise<{ id: string }> };

export default async function EditGamePage({ params }: Props) {
  await requireAdmin();

  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();

  const supabase = createSecretClient();

  const { data: categoryRows, error: categoriesError } = await supabase
    .from("categories")
    .select("id, name")
    .order("name");
  if (categoriesError) throw new Error(`categories failed: ${categoriesError.message}`);

  const { data, error } = await supabase
    .from("games")
    .select(
      "id, slug, title, description, meta_title, meta_description, thumbnail_url, thumb_focus_x, category_id, tags",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`game load failed: ${error.message}`);
  if (!data) notFound();

  return (
    <div>
      <PageHeader title="Edit game" description={`/game/${data.slug as string}`} />
      <GameEditForm
        game={{
          id: data.id as string,
          slug: data.slug as string,
          title: data.title as string,
          description: (data.description as string | null) ?? "",
          metaTitle: (data.meta_title as string | null) ?? "",
          metaDescription: (data.meta_description as string | null) ?? "",
          thumbnailUrl: data.thumbnail_url as string,
          thumbFocusX: (data.thumb_focus_x as number | null) ?? 50,
          categoryId: (data.category_id as string | null) ?? "",
          tags: ((data.tags as string[] | null) ?? []).join(", "),
        }}
        categories={(categoryRows ?? []) as { id: string; name: string }[]}
      />
    </div>
  );
}
