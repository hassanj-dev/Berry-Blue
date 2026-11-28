import type { Metadata } from "next";
import { AdForm } from "@/components/AdForm";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "New ad" };

export default async function NewAdPage() {
  await requireAdmin();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">New ad</h1>
      <AdForm />
    </div>
  );
}
