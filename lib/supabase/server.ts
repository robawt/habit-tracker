import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// This client runs on the SERVER (Server Components, Route
// Handlers). It reads the session from cookies instead of
// browser storage, so pages can be rendered server-side while
// still knowing "who" is logged in — and RLS still applies.
export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Called from a Server Component — safe to ignore
            // because middleware refreshes the session anyway.
          }
        },
        remove(name: string, options) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch {}
        },
      },
    }
  );
}
