import { createClient } from "@supabase/supabase-js";

// Secret key RLS ko bypass karti hai: sirf server-side scripts mein, kabhi browser ya NEXT_PUBLIC_ mein nahi.
export function createSecretClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;

  if (!url || !key) {
    throw new Error("SUPABASE_URL and SUPABASE_SECRET_KEY must be set in apps/worker/.env");
  }

  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
