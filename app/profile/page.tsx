"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [createdAt, setCreatedAt] = useState<string>("");
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
    };
  }, []);

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/");
        return;
      }
      setUser(user);
      setCreatedAt(user.created_at);

      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .single();

      if (profile?.display_name) {
        setDisplayName(profile.display_name);
      } else {
        setDisplayName(user.email?.split("@")[0] || "");
      }
      setLoading(false);
    }
    loadProfile();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (successTimerRef.current) clearTimeout(successTimerRef.current);

    const trimmed = displayName.trim();
    if (!trimmed) return setError("Display name cannot be empty.");
    if (trimmed.length > 50) return setError("Display name must be 50 characters or less.");

    setSaving(true);
    const { error: updateErr } = await supabase
      .from("profiles")
      .update({ display_name: trimmed, updated_at: new Date().toISOString() })
      .eq("id", user!.id);

    setSaving(false);

    if (updateErr) {
      setError(updateErr.message);
    } else {
      setSuccess(true);
      successTimerRef.current = setTimeout(() => setSuccess(false), 3000);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="xp-window">
          <div className="xp-window-body">
            <p className="text-sm text-gray-500">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Profile Window */}
      <div className="xp-window">
        <div className="xp-window-title">
          <span>Profile Properties</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] opacity-80">{displayName || "User"}</span>
            <div className="xp-window-controls">
              <span className="xp-window-minimize">_</span>
              <span className="xp-window-maximize">&#9633;</span>
              <span className="xp-window-close">X</span>
            </div>
          </div>
        </div>
        <div className="xp-window-body">
          {/* Avatar */}
          <div className="flex items-center gap-4 mb-5 pb-4 border-b border-black">
            <div className="w-16 h-16 border-2 border-black shadow-xp-sunken shrink-0 overflow-hidden">
              <img src="/icons/icon-user.png" alt="user avatar" className="w-full h-full" />
            </div>
            <div>
              <h1 className="text-base font-bold text-black font-heading">
                {displayName || "Your Profile"}
              </h1>
              <p className="text-xs text-gray-600 mt-0.5">{user?.email}</p>
              {createdAt && (
                <p className="text-[10px] text-gray-400 mt-1">
                  Member since{" "}
                  {new Date(createdAt).toLocaleDateString("en-US", {
                    year: "numeric", month: "long", day: "numeric",
                  })}
                </p>
              )}
            </div>
          </div>

          {/* Edit Form */}
          <h2 className="text-sm font-bold text-black mb-3 font-heading">Edit Profile</h2>
          <form onSubmit={handleSave} className="space-y-3">
            <div>
              <label className="label-xp" htmlFor="displayName">Display Name</label>
              <input id="displayName" type="text" required maxLength={50}
                placeholder="Your display name" value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="input-xp" />
            </div>
            <div>
              <label className="label-xp">Email</label>
              <input type="email" value={user?.email || ""} disabled
                className="input-xp" />
              <p className="text-[10px] text-gray-400 mt-0.5">Email cannot be changed.</p>
            </div>
            {error && (
              <div className="msg-xp-error">{error}</div>
            )}
            {success && (
              <div className="msg-xp-success">Profile saved!</div>
            )}
            <div className="flex gap-2 pt-1">
              <button type="submit" disabled={saving} className="btn-xp-primary">
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </form>

          {/* Account Info */}
          <h2 className="text-sm font-bold text-black mt-5 mb-3 font-heading">Account</h2>
          <div className="border border-black shadow-xp-sunken bg-white divide-y divide-gray-300">
            <div className="flex justify-between px-2 py-1.5 text-xs">
              <span className="text-gray-500">User ID</span>
              <span className="text-black font-mono text-[10px]">{user?.id}</span>
            </div>
            <div className="flex justify-between px-2 py-1.5 text-xs">
              <span className="text-gray-500">Email confirmed</span>
              <span className={`font-bold ${user?.email_confirmed_at ? "text-xp-green-600" : "text-red-600"}`}>
                {user?.email_confirmed_at ? "YES" : "NO"}
              </span>
            </div>
            <div className="flex justify-between px-2 py-1.5 text-xs">
              <span className="text-gray-500">Last sign in</span>
              <span className="text-black">
                {user?.last_sign_in_at
                  ? new Date(user.last_sign_in_at).toLocaleDateString("en-US", {
                      year: "numeric", month: "short", day: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    })
                  : "N/A"}
              </span>
            </div>
          </div>
        </div>
        {/* Status bar */}
        <div className="border-t border-black bg-xp-silver-300 px-2 py-0.5 text-[10px] text-gray-600 flex items-center justify-between shadow-xp-sunken">
          <span>Profile settings</span>
          <span>My Computer</span>
        </div>
      </div>
    </div>
  );
}
