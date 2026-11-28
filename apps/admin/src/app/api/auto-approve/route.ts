import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { runAutoApprove } from "@/lib/auto-approve";

// Called by the worker after an import. It has no login, so it needs the shared secret.
// It does the same thing as the "Approve all that pass the rules" button.

function sameSecret(given: string, expected: string) {
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  const secret = process.env.AUTO_APPROVE_SECRET;
  const adminId = z.uuid().safeParse(process.env.AUTO_APPROVE_ADMIN_ID);

  if (!secret || !adminId.success) {
    return NextResponse.json(
      { error: "Auto approve is not set up (AUTO_APPROVE_SECRET / AUTO_APPROVE_ADMIN_ID)." },
      { status: 503 },
    );
  }

  const given = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  if (!sameSecret(given, secret)) {
    return NextResponse.json({ error: "Not allowed." }, { status: 401 });
  }

  try {
    return NextResponse.json(await runAutoApprove(adminId.data));
  } catch (error) {
    console.error("auto approve route failed:", error);
    return NextResponse.json({ error: "Auto approve failed." }, { status: 500 });
  }
}
