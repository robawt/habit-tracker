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
  const [tab, setTab] = useState<"create" | "join">("create");
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

    const { data: team, error: teamErr } = await supabase
      .from("teams")
      .insert({ name: trimmed, created_by: user.id })
      .select()
      .single();

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
    <div className="max-w-lg mx-auto">
      <div className="xp-window">
        <div className="xp-window-title">
          <span>Team Manager</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] opacity-80">create or join</span>
            <div className="xp-window-controls">
              <span className="xp-window-minimize">_</span>
              <span className="xp-window-maximize">&#9633;</span>
              <span className="xp-window-close">X</span>
            </div>
          </div>
        </div>
        <div className="xp-window-body">
          {/* Tab bar */}
          <div className="flex mb-4">
            <button
              onClick={() => { setTab("create"); setError(null); }}
              className={`tab-xp rounded-r-none border-r-0 flex-1 text-center ${
                tab === "create" ? "tab-xp-active" : ""
              }`}
            >
              Create
            </button>
            <button
              onClick={() => { setTab("join"); setError(null); }}
              className={`tab-xp rounded-l-none flex-1 text-center ${
                tab === "join" ? "tab-xp-active" : ""
              }`}
            >
              Join
            </button>
          </div>

          {tab === "create" ? (
            /* Create Team */
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-xp-gold border border-black shadow-xp-sunken flex items-center justify-center shrink-0">
                  <span className="text-base font-bold text-black">+</span>
                </div>
                <div>
                  <h2 className="text-sm font-bold text-black font-heading">
                    Create a new team
                  </h2>
                  <p className="text-xs text-gray-600">
                    Start a fresh team for you and your friends
                  </p>
                </div>
              </div>
              <form onSubmit={createTeam} className="space-y-3">
                <div>
                  <label className="label-xp" htmlFor="teamName">Team name</label>
                  <input id="teamName" required maxLength={50}
                    placeholder="Team name" value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-xp" />
                </div>
                <button type="submit" disabled={creating} className="btn-xp-primary w-full">
                  {creating ? "Creating..." : "Create team"}
                </button>
              </form>
            </div>
          ) : (
            /* Join Team */
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-xp-blue-500 border border-black shadow-xp-sunken flex items-center justify-center shrink-0">
                  <span className="text-base font-bold text-white">&amp;</span>
                </div>
                <div>
                  <h2 className="text-sm font-bold text-black font-heading">
                    Join an existing team
                  </h2>
                  <p className="text-xs text-gray-600">
                    Enter an invite code from a teammate
                  </p>
                </div>
              </div>
              <form onSubmit={joinTeam} className="space-y-3">
                <div>
                  <label className="label-xp" htmlFor="inviteCode">Invite code</label>
                  <input id="inviteCode" required
                    placeholder="e.g. a1b2c3" value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    className="input-xp font-mono tracking-widest" />
                </div>
                <button type="submit" disabled={joining} className="btn-xp-primary w-full">
                  {joining ? "Joining..." : "Join team"}
                </button>
              </form>
            </div>
          )}

          {error && (
            <div className="msg-xp-error mt-3">{error}</div>
          )}
        </div>
        {/* Status bar */}
        <div className="border-t border-black bg-xp-silver-300 px-2 py-0.5 text-[10px] text-gray-600 flex items-center justify-between shadow-xp-sunken">
          <span>{tab === "create" ? "Create a new team" : "Join with invite code"}</span>
          <span>Team Manager</span>
        </div>
      </div>

      {/* 88x31 badges */}
      <div className="flex justify-center gap-2 mt-4">
        <span className="badge-88x31 bg-xp-green-500 text-white">TEAMWORK</span>
        <span className="badge-88x31 bg-retro-cyan text-black">HABITS</span>
        <span className="badge-88x31 bg-xp-gold text-black">Y2K 2000</span>
      </div>
    </div>
  );
}
