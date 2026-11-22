import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

// Bina login wala (anonymous) client. Isse sirf wohi data milta hai jo RLS ijazat deta hai.
export function createPublicClient() {
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
