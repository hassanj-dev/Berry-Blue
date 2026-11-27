import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/Button";
import { getAdmin } from "@/lib/auth";
import { logout } from "@/lib/auth-actions";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Login" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  if (await getAdmin()) redirect("/overview");

  const { error } = await searchParams;

  return (
    <main className="login-dark relative mx-auto flex min-h-dvh w-full max-w-sm flex-col justify-center gap-6 px-4 py-10">
      <div className="flex flex-col items-center gap-3 text-center">
        <Logo href="/login" alwaysDark />
        <p className="text-sm text-muted">Sign in to manage games, providers and reports.</p>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 md:p-6">
        <h1 className="text-xl font-bold">Admin login</h1>

        {error === "forbidden" && (
          <div
            role="alert"
            className="flex flex-col gap-2 rounded-xl border border-danger p-3 text-sm"
          >
            <p>This account is not authorized as an admin.</p>
            <form action={logout}>
              <Button type="submit" variant="secondary" size="sm">
                Sign out
              </Button>
            </form>
          </div>
        )}

        <LoginForm />
      </div>
    </main>
  );
}
