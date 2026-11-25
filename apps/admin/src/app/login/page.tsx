import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/auth";
import { logout } from "@/lib/auth-actions";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Login" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  if (await getAdmin()) redirect("/overview");

  const { error } = await searchParams;

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-6 px-4">
      <h1 className="text-2xl font-bold">Admin login</h1>

      {error === "forbidden" && (
        <div
          role="alert"
          className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-3 text-sm"
        >
          <p>This account is not authorized as an admin.</p>
          <form action={logout}>
            <button type="submit" className="underline">
              Sign out
            </button>
          </form>
        </div>
      )}

      <LoginForm />
    </main>
  );
}
