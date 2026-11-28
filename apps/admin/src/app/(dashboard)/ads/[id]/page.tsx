import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { z } from "zod";
import { AdForm, type AdRow } from "@/components/AdForm";
import { requireAdmin } from "@/lib/auth";
import { createSecretClient } from "@/lib/supabase/secret";

export const metadata: Metadata = { title: "Edit ad" };

export default async function EditAdPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();

  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();

  const { data, error } = await createSecretClient()
    .from("ads")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`ad load failed: ${error.message}`);
  if (!data) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Edit ad</h1>
      <AdForm ad={data as AdRow} />
    </div>
  );
}
