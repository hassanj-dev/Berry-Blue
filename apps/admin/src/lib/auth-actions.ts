"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { isAdminUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type LoginState = { error: string | null };

const loginSchema = z.object({ email: z.email(), password: z.string().min(1) });

const LOGIN_FAILED = "Incorrect email or password, or this account is not an admin.";

export async function login(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: LOGIN_FAILED };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error || !data.user) return { error: LOGIN_FAILED };

  // Check with this user id instead of re-reading the cookie: the cookie just set may not be visible in this same request.
  if (!(await isAdminUser(data.user.id))) {
    await supabase.auth.signOut();
    return { error: LOGIN_FAILED };
  }

  redirect("/overview");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
