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
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="xp-window max-w-md w-full">
          <div className="xp-window-title">
            <span>Habit Tracker</span>
            <span className="text-[10px] opacity-80">— email sent</span>
          </div>
          <div className="xp-window-body text-center space-y-3">
            <div className="w-12 h-12 bg-xp-silver border border-black shadow-xp-sunken flex items-center justify-center mx-auto">
              <img src="/icons/icon-mail.png" alt="mail" className="w-8 h-8" />
            </div>
            <h2 className="text-base font-bold text-black font-heading">Check your email</h2>
            {mode === "password" && isSignUp ? (
              <p className="text-sm text-gray-600">
                We sent a confirmation link to{" "}
                <b className="text-black">{email}</b>. Click it to activate
                your account, then sign in.
              </p>
            ) : (
              <p className="text-sm text-gray-600">
                We sent a login link to{" "}
                <b className="text-black">{email}</b>.
              </p>
            )}
            <button onClick={() => setSent(false)} className="btn-xp mt-2">
              OK
            </button>
          </div>
          {/* 88x31 badge footer */}
          <div className="flex justify-center gap-2 pb-3">
            <span className="badge-88x31 bg-xp-green-500 text-white text-[8px]">HABITS</span>
            <span className="badge-88x31 bg-retro-magenta text-white">STREAKS</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="xp-window max-w-md w-full">
        {/* Window Title Bar */}
        <div className="xp-window-title">
          <span>Habit Tracker</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] opacity-80">sign in</span>
            <div className="xp-window-controls">
              <span className="xp-window-minimize">_</span>
              <span className="xp-window-maximize">&#9633;</span>
              <span className="xp-window-close" onClick={() => {}}>X</span>
            </div>
          </div>
        </div>

        <div className="xp-window-body">
          {/* Logo / Header */}
          <div className="text-center mb-5">
            <img
              src="/icons/habit-star.png"
              alt="Habit Tracker"
              className="w-16 h-16 border-2 border-black shadow-xp-sunken mx-auto mb-2"
            />
            <h1 className="text-lg font-bold text-black font-heading">Habit Tracker</h1>
            <p className="text-xs text-gray-600 mt-0.5">Build streaks with your team</p>
          </div>

          {/* Auth Mode Tabs */}
          <div className="flex mb-4">
            <button
              onClick={() => { setMode("password"); setError(null); }}
              className={`tab-xp rounded-r-none border-r-0 flex-1 text-center ${
                mode === "password" ? "tab-xp-active" : ""
              }`}
            >
              Password
            </button>
            <button
              onClick={() => { setMode("magic-link"); setError(null); }}
              className={`tab-xp rounded-l-none flex-1 text-center ${
                mode === "magic-link" ? "tab-xp-active" : ""
              }`}
            >
              Magic Link
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-3">
            {/* Email */}
            <div>
              <label className="label-xp" htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-xp"
              />
            </div>

            {/* Display Name (only shown during sign up) */}
            {mode === "password" && isSignUp && (
              <div>
                <label className="label-xp" htmlFor="displayName">
                  Display name
                </label>
                <input
                  id="displayName"
                  type="text"
                  placeholder="Your name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="input-xp"
                />
              </div>
            )}

            {/* Password */}
            {mode === "password" && (
              <div>
                <label className="label-xp" htmlFor="password">
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
                  className="input-xp"
                />
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={submitting} className="btn-xp-primary w-full text-center">
              {submitting
                ? "Please wait..."
                : mode === "magic-link"
                ? "Send magic link"
                : isSignUp
                ? "Create account"
                : "Sign in"}
            </button>

            {error && (
              <div className="msg-xp-error">
                {error}
              </div>
            )}
          </form>

          {/* Toggle sign in / sign up */}
          {mode === "password" && (
            <div className="mt-3 text-center text-xs text-gray-600">
              {isSignUp ? (
                <>
                  Already have an account?{" "}
                  <button onClick={() => { setIsSignUp(false); setError(null); }}
                    className="text-xp-blue-500 font-bold hover:text-xp-blue-700 underline">
                    Sign in
                  </button>
                </>
              ) : (
                <>
                  Don&apos;t have an account?{" "}
                  <button onClick={() => { setIsSignUp(true); setError(null); }}
                    className="text-xp-blue-500 font-bold hover:text-xp-blue-700 underline">
                    Sign up
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Status bar */}
        <div className="border-t border-black bg-xp-silver-300 px-2 py-0.5 text-[10px] text-gray-600 flex items-center justify-between shadow-xp-sunken">
          <span>Ready</span>
          <span>
            {mode === "password"
              ? isSignUp ? "Sign up mode" : "Sign in mode"
              : "Magic link mode"}
          </span>
        </div>
      </div>

      {/* 88x31 decorative badges */}
      <div className="hidden sm:flex flex-col gap-1 ml-4">
        <span className="badge-88x31 bg-xp-blue-500 text-white">HABIT TRACKER</span>
        <span className="badge-88x31 bg-retro-cyan text-black">STREAKS</span>
        <span className="badge-88x31 bg-xp-green-500 text-white">CHECK IN!</span>
        <span className="badge-88x31 bg-xp-gold text-black">Y2K 2000</span>
      </div>
    </div>
  );
}
