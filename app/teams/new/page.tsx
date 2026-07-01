"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function NewTeamPage() {
  const [name, setName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  async function createTeam(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // Two writes here: create the team, then add yourself as owner.
    // Both are covered by the RLS policies we wrote in the SQL file —
    // "with check (auth.uid() = created_by)" is what makes this safe.
    const { data: team, error: teamErr } = await supabase
      .from("teams")
      .insert({ name, created_by: user.id })
      .select()
      .single();

    if (teamErr || !team) return setError(teamErr?.message ?? "Failed");

    await supabase
      .from("team_members")
      .insert({ team_id: team.id, user_id: user.id, role: "owner" });

    router.push(`/teams/${team.id}`);
  }

  async function joinTeam(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: team, error: findErr } = await supabase
      .from("teams")
      .select("id")
      .eq("invite_code", joinCode.trim())
      .single();

    if (findErr || !team) return setError("Invite code not found");

    const { error: joinErr } = await supabase
      .from("team_members")
      .insert({ team_id: team.id, user_id: user.id });

    if (joinErr) return setError(joinErr.message);

    router.push(`/teams/${team.id}`);
  }

  return (
    <div className="space-y-10 mt-10">
      <form onSubmit={createTeam} className="space-y-3">
        <h2 className="font-semibold text-lg">Create a new team</h2>
        <input
          required
          placeholder="Team name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded-lg px-4 py-2"
        />
        <button className="bg-slate-900 text-white rounded-lg px-4 py-2 text-sm">
          Create team
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
        <button className="bg-slate-700 text-white rounded-lg px-4 py-2 text-sm">
          Join team
        </button>
      </form>

      {error && <p className="text-red-600 text-sm">{error}</p>}
    </div>
  );
}
