"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type AuthMode = "magic-link" | "password";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<AuthMode>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) router.push("/dashboard");
    });
  }, []);

  // Show auth errors from the magic link callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("error") === "auth_failed") {
      setError(params.get("message") ?? "Authentication failed. Please try again.");
      window.history.replaceState({}, "", "/");
    }
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    if (mode === "magic-link") {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${location.origin}/auth/callback`,
        },
      });
      setSubmitting(false);
      if (error) setError(error.message);
      else setSent(true);
    } else {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              display_name: displayName.trim() || email.trim().split("@")[0],
            },
            emailRedirectTo: `${location.origin}/auth/callback`,
          },
        });
        setSubmitting(false);
        if (error) {
          setError(error.message);
        } else {
          setSent(true);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        setSubmitting(false);
        if (error) setError(error.message);
        else router.push("/dashboard");
      }
    }
  }

  if (sent) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="card p-8 max-w-md w-full text-center">
          <div className="w-14 h-14 bg-old-blue-500 text-old-yellow-400 text-2xl font-bold flex items-center justify-center mx-auto mb-4 border-2 border-old-navy shadow-box-sm">
            @
          </div>
          <h1 className="text-2xl font-bold text-old-navy mb-2">Check your email</h1>
          {mode === "password" && isSignUp ? (
            <p className="text-gray-600">
              We sent a confirmation link to{" "}
              <b className="text-old-navy">{email}</b>. Click it to activate
              your account, then sign in.
            </p>
          ) : (
            <p className="text-gray-600">
              We sent a login link to{" "}
              <b className="text-old-navy">{email}</b>.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="card p-8 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-old-blue-500 text-old-yellow-400 text-3xl font-bold flex items-center justify-center mx-auto mb-3 border-2 border-old-navy shadow-box">
            HT
          </div>
          <h1 className="text-3xl font-bold text-old-navy">Habit Tracker</h1>
          <p className="text-gray-500 mt-1">
            Build streaks with your team
          </p>
        </div>

        {/* Auth Mode Toggle */}
        <div className="flex border-2 border-old-navy shadow-box-sm mb-6">
          <button
            onClick={() => { setMode("password"); setError(null); }}
            className={`flex-1 py-2 text-sm font-bold ${
              mode === "password"
                ? "bg-old-blue-500 text-old-yellow-400"
                : "bg-white text-old-navy hover:bg-old-yellow-100"
            }`}
          >
            Email & Password
          </button>
          <button
            onClick={() => { setMode("magic-link"); setError(null); }}
            className={`flex-1 py-2 text-sm font-bold border-l-2 border-old-navy ${
              mode === "magic-link"
                ? "bg-old-blue-500 text-old-yellow-400"
                : "bg-white text-old-navy hover:bg-old-yellow-100"
            }`}
          >
            Magic Link
          </button>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email */}
          <div>
            <label className="label" htmlFor="email">
              Email address
            </label>
            <input
              id="email"
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
            />
          </div>

          {/* Display Name (only shown during sign up) */}
          {mode === "password" && isSignUp && (
            <div>
              <label className="label" htmlFor="displayName">
                Display name
              </label>
              <input
                id="displayName"
                type="text"
                placeholder="Your name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="input-field"
              />
            </div>
          )}

          {/* Password */}
          {mode === "password" && (
            <div>
              <label className="label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
              />
            </div>
          )}

          {/* Submit */}
          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting
              ? "Please wait..."
              : mode === "magic-link"
              ? "Send magic link"
              : isSignUp
              ? "Create account"
              : "Sign in"}
          </button>

          {error && (
            <div className="bg-red-100 border-2 border-red-800 text-red-800 text-sm p-3 shadow-box-sm">
              {error}
            </div>
          )}
        </form>

        {/* Toggle sign in / sign up (only for password mode) */}
        {mode === "password" && (
          <div className="mt-4 text-center text-sm text-gray-600">
            {isSignUp ? (
              <>
                Already have an account?{" "}
                <button onClick={() => { setIsSignUp(false); setError(null); }}
                  className="text-old-blue-500 font-bold hover:text-old-blue-700">
                  Sign in
                </button>
              </>
            ) : (
              <>
                Don&apos;t have an account?{" "}
                <button onClick={() => { setIsSignUp(true); setError(null); }}
                  className="text-old-blue-500 font-bold hover:text-old-blue-700">
                  Sign up
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}