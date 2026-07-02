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

    setCreating(false);
    if (teamErr || !team) return setError(teamErr?.message ?? "Failed to create team.");

    await supabase
      .from("team_members")
      .insert({ team_id: team.id, user_id: user.id, role: "owner" });

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

    const { data: team, error: findErr } = await supabase
      .from("teams")
      .select("id")
      .eq("invite_code", trimmed)
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
    <div className="space-y-10 mt-10">
      <form onSubmit={createTeam} className="space-y-3">
        <h2 className="font-semibold text-lg">Create a new team</h2>
        <input
          required
          maxLength={50}
          placeholder="Team name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded-lg px-4 py-2"
        />
        <button
          type="submit"
          disabled={creating}
          className="bg-slate-900 text-white rounded-lg px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {creating ? "Creating..." : "Create team"}
        </button>
      </form>

      <form onSubmit={joinTeam} className="space-y-3">
        <h2 className="font-semibold text-lg">Join an existing team</h2>
        <input
          required
          placeholder="Invite code"
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value)}
          className="w-full border rounded-lg px-4 py-2"
        />
        <button
          type="submit"
          disabled={joining}
          className="bg-slate-700 text-white rounded-lg px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {joining ? "Joining..." : "Join team"}
        </button>
      </form>

      {error && <p className="text-red-600 text-sm">{error}</p>}
    </div>
  );
}
