import { createClient } from "@supabase/supabase-js";
import { cacheLife, cacheTag } from "next/cache";
import { faqs as approvedFaqs } from "@/lib/static-pages";

export type Faq = { id: string; question: string; answer: string };
export type GuideStep = { title: string; body: string };
export type Guide = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  steps: GuideStep[];
};

function client() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

/**
 * Questions saved in the database win. When the table is empty or cannot be
 * reached, the approved questions from lib/static-pages.ts are shown instead,
 * so the page is never blank.
 */
export async function getFaqs(): Promise<Faq[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("faqs");
  const db = client();
  if (!db) return approvedFaqs;
  const { data, error } = await db
    .from("faqs")
    .select("id, question, answer")
    .order("sort_order")
    .order("created_at");
  if (error) console.error("faqs failed:", error.message);
  return data && data.length > 0 ? (data as Faq[]) : approvedFaqs;
}

export async function getGuides(): Promise<Guide[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("guides");
  const db = client();
  if (!db) return [];
  const { data, error } = await db
    .from("guides")
    .select("id, title, slug, summary, steps")
    .order("sort_order")
    .order("created_at");
  if (error) console.error("guides failed:", error.message);
  return (data ?? []) as Guide[];
}

export async function getGuide(slug: string): Promise<Guide | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag("guides");
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) return null;
  const db = client();
  if (!db) return null;
  const { data } = await db
    .from("guides")
    .select("id, title, slug, summary, steps")
    .eq("slug", slug)
    .maybeSingle();
  return (data as Guide | null) ?? null;
}
