// After an import: ask the admin app to approve the games that pass the moderation rules.
// They land in Games > Pending (hidden). A failure here is only logged: the import itself is done.

export async function triggerAutoApprove() {
  const adminUrl = process.env.ADMIN_URL;
  const secret = process.env.AUTO_APPROVE_SECRET;

  if (!adminUrl || !secret) {
    console.log(
      "Auto approve is off (ADMIN_URL or AUTO_APPROVE_SECRET is not set in apps/worker/.env).",
    );
    return;
  }

  try {
    const response = await fetch(new URL("/api/auto-approve", adminUrl), {
      method: "POST",
      headers: { authorization: `Bearer ${secret}` },
      redirect: "manual",
      signal: AbortSignal.timeout(120_000),
    });

    if (response.status >= 300 && response.status < 400) {
      console.error(
        "Auto approve: the admin app redirected the request (probably its login check). The games stay in Moderation.",
      );
      return;
    }

    const body = (await response.json().catch(() => null)) as Record<string, unknown> | null;
    if (!response.ok) {
      console.error(`Auto approve failed (HTTP ${response.status}):`, body?.error ?? body);
      return;
    }

    console.log("Auto approve finished");
    console.table(body);
  } catch (error) {
    console.error(
      "Auto approve could not reach the admin app (is it running at ADMIN_URL?):",
      error instanceof Error ? error.message : error,
    );
  }
}
