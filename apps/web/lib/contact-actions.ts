"use server";

import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

export type ContactState = { ok: boolean; error?: string };

const schema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(200),
  message: z.string().trim().min(5).max(4000),
});

export async function sendContact(_: ContactState, form: FormData): Promise<ContactState> {
  if (form.get("website")) return { ok: true }; // honeypot: bots fill this
  const parsed = schema.safeParse({
    name: form.get("name"),
    email: form.get("email"),
    message: form.get("message"),
  });
  if (!parsed.success) return { ok: false, error: "Please fill in all fields with a valid email." };

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return { ok: false, error: "Contact form is not set up yet." };

  const db = createClient(url, key, { auth: { persistSession: false } });
  const { error } = await db.from("contact_messages").insert(parsed.data);
  if (error) {
    console.error("contact failed:", error.message);
    return { ok: false, error: "Could not send. Please try again." };
  }
  return { ok: true };
}
