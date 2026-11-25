import "server-only";
import { createClient } from "@supabase/supabase-js";

// The secret key bypasses RLS. Because of "server-only", the build fails if this file is ever
// imported into browser code.
export function createSecretClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;

  if (!url || !key) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY must be set in apps/admin/.env.local",
    );
  }

  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
