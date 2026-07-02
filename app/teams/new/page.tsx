"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function NewTeamPage() {
  const [name, setName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function createTeam(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmed = name.trim();
    if (trimmed.length < 1 || trimmed.length > 50) {
      return setError("Team name must be 1–50 characters.");
    }

    setCreating(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setCreating(false);
      return;
    }

    // Two writes here: create the team, then add yourself as owner.
    // Both are covered by the RLS policies we wrote in the SQL file —
    // "with check (auth.uid() = created_by)" is what makes this safe.
    const { data: team, error: teamErr } = await supabase
      .from("teams")
      .insert({ name: trimmed, created_by: user.id })
      .select()
      .single();

    // Keep button disabled through BOTH inserts to prevent double-submit
    if (teamErr || !team) {
      setCreating(false);
      return setError(teamErr?.message ?? "Failed to create team.");
    }

    const { error: memberErr } = await supabase
      .from("team_members")
      .insert({ team_id: team.id, user_id: user.id, role: "owner" });

    if (memberErr) {
      setCreating(false);
      return setError(memberErr.message);
    }

    setCreating(false);
    router.push(`/teams/${team.id}`);
  }

  async function joinTeam(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmed = joinCode.trim();
    if (!trimmed) return setError("Please enter an invite code.");

    setJoining(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setJoining(false);
      return;
    }

    // Normalize to lowercase — invite codes are generated as lowercase hex
    const normalizedCode = trimmed.toLowerCase();

    const { data: team, error: findErr } = await supabase
      .from("teams")
      .select("id")
      .eq("invite_code", normalizedCode)
      .single();

    if (findErr || !team) {
      setJoining(false);
      return setError("Invite code not found.");
    }

    const { error: joinErr } = await supabase
      .from("team_members")
      .insert({ team_id: team.id, user_id: user.id });

    setJoining(false);
    if (joinErr) return setError(joinErr.message);

    router.push(`/teams/${team.id}`);
  }

  return (
    <div className="max-w-lg mx-auto space-y-8">
      {/* Create Team */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-old-yellow-400 text-old-navy flex items-center justify-center text-lg font-bold border-2 border-old-navy shadow-box-sm">
            +
          </div>
          <div>
            <h2 className="font-bold text-lg text-old-navy">
              Create a new team
            </h2>
            <p className="text-sm text-gray-500">
              Start a fresh team for you and your friends
            </p>
          </div>
        </div>
        <form onSubmit={createTeam} className="space-y-3">
          <input
            required
            maxLength={50}
            placeholder="Team name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-field"
          />
          <button
            type="submit"
            disabled={creating}
            className="btn-primary w-full"
          >
            {creating ? "Creating..." : "Create team"}
          </button>
        </form>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t-2 border-old-navy" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-old-yellow-50 px-3 text-sm font-bold text-old-navy">
            OR
          </span>
        </div>
      </div>

      {/* Join Team */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-old-blue-500 text-old-yellow-400 flex items-center justify-center text-lg font-bold border-2 border-old-navy shadow-box-sm">
            &amp;
          </div>
          <div>
            <h2 className="font-bold text-lg text-old-navy">
              Join an existing team
            </h2>
            <p className="text-sm text-gray-500">
              Enter an invite code from a teammate
            </p>
          </div>
        </div>
        <form onSubmit={joinTeam} className="space-y-3">
          <input
            required
            placeholder="Invite code"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            className="input-field font-mono tracking-widest"
          />
          <button
            type="submit"
            disabled={joining}
            className="btn-primary w-full"
          >
            {joining ? "Joining..." : "Join team"}
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-red-100 border-2 border-red-800 text-red-800 text-sm p-3 shadow-box-sm">
          {error}
        </div>
      )}
    </div>
  );
}
