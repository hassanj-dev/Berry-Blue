"use server";

import { createClient } from "@supabase/supabase-js";
import { headers } from "next/headers";
import { z } from "zod";

export type ContactState = { ok: boolean; error?: string };

const schema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(200),
  message: z.string().trim().min(5).max(4000),
});

// At most 5 messages per hour from one address. The list lives in server memory, so it
// resets on a restart and is per server instance: it slows spam down, it does not stop a
// determined bot. Add Cloudflare Turnstile if spam still gets through.
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

async function tooManyRequests(): Promise<boolean> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(ip, recent);
    return true;
  }
  hits.set(ip, [...recent, now]);
  if (hits.size > 5000) {
    for (const [key, times] of hits) {
      if (times.every((t) => now - t >= WINDOW_MS)) hits.delete(key);
    }
  }
  return false;
}

export async function sendContact(_: ContactState, form: FormData): Promise<ContactState> {
  if (form.get("website")) return { ok: true }; // honeypot: bots fill this
  const parsed = schema.safeParse({
    name: form.get("name"),
    email: form.get("email"),
    message: form.get("message"),
  });
  if (!parsed.success) return { ok: false, error: "Please fill in all fields with a valid email." };

  if (await tooManyRequests()) {
    return { ok: false, error: "Too many messages. Please try again in an hour." };
  }

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
