import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Only the columns the popup needs. The database policy already hides ads that are off or outside their dates.
const CORE =
  "id, kind, mode, image_url, title, body, button_text, link_url, show_countdown, ends_at, pages, device, delay_min, delay_max, auto_close, frequency";
const COLUMNS = `${CORE}, repeat_days, repeat_hours, weight, rotation`;

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.error("ads: Supabase URL or public key is missing in the web env");
    return NextResponse.json(
      { ads: [] },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });
  let { data, error } = await supabase.from("ads").select(COLUMNS).limit(50);

  // A new SQL file was not run yet: keep ads working with the basic columns instead of failing.
  if (error && /does not exist/i.test(error.message)) {
    console.warn("ads: run the newest SQL migration in Supabase. Using basic columns for now.");
    ({ data, error } = await supabase.from("ads").select(CORE).limit(50));
  }

  if (error) {
    console.error("ads: load failed:", error.message);
    return NextResponse.json(
      { ads: [] },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }

  return NextResponse.json({ ads: data ?? [] }, { headers: { "Cache-Control": "no-store" } });
}
