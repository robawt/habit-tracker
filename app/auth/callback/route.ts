import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// When the user clicks the magic link in their email, Supabase
// redirects them here with a `code` in the URL. We exchange that
// code for a real session (sets cookies), then send them into the app.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(`${origin}/dashboard`);
}
