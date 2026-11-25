import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createSecretClient } from "@/lib/supabase/secret";

export type Admin = { id: string; email: string };

export async function isAdminUser(userId: string): Promise<boolean> {
  const { data, error } = await createSecretClient()
    .from("admin_users")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw new Error(`admin check failed: ${error.message}`);
  return data !== null;
}

// getUser() verifies the token with Supabase Auth (never trust the cookie alone).
const getAuth = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { user: null, isAdmin: false };
  return { user, isAdmin: await isAdminUser(user.id) };
});

export async function getAdmin(): Promise<Admin | null> {
  const { user, isAdmin } = await getAuth();
  return user && isAdmin ? { id: user.id, email: user.email ?? "" } : null;
}

// First line of every page and Server Action: do not rely on the layout (it does not re-run on every navigation).
export async function requireAdmin(): Promise<Admin> {
  const { user, isAdmin } = await getAuth();

  if (!user) redirect("/login");
  if (!isAdmin) redirect("/login?error=forbidden");

  return { id: user.id, email: user.email ?? "" };
}
