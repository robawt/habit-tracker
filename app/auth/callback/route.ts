import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// When the user clicks the magic link in their email, Supabase
// redirects them here with a `code` in the URL. We exchange that
// code for a real session (sets cookies), then send them into the app.
// If the exchange fails (e.g. expired code), redirect to login with
// an error so the user isn't stuck in a redirect loop.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("Auth callback error:", error.message);
      return NextResponse.redirect(
        `${origin}?error=auth_failed&message=${encodeURIComponent(error.message)}`
      );
    }
  }

  return NextResponse.redirect(`${origin}/dashboard`);
}
