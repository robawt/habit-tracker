"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const supabase = createClient();

  // Show auth errors from the magic link callback (e.g. expired code)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("error") === "auth_failed") {
      setError(params.get("message") ?? "Authentication failed. Please try again.");
      // Clean up the URL so refreshing doesn't re-show the error
      window.history.replaceState({}, "", "/");
    }
  }, []);

  // Magic link auth: no password to manage, Supabase emails the
  // user a one-time login link that lands them on /auth/callback.
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });

    setSubmitting(false);
    if (error) setError(error.message);
    else setSent(true);
  }

  if (sent) {
    return (
      <div className="mt-20 text-center">
        <h1 className="text-2xl font-bold mb-2">Check your email</h1>
        <p className="text-slate-600">
          We sent a login link to <b>{email}</b>.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-20">
      <h1 className="text-3xl font-bold mb-6 text-center">🔥 Habit Tracker</h1>
      <form onSubmit={handleLogin} className="max-w-sm mx-auto space-y-3">
        <input
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded-lg px-4 py-2"
        />
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-slate-900 text-white rounded-lg px-4 py-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Sending..." : "Send magic link"}
        </button>
        {error && <p className="text-red-600 text-sm">{error}</p>}
      </form>
    </div>
  );
}
