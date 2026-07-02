"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Row = { user_id: string; total_points: number; total_checkins: number };

export default function Leaderboard({
  teamId,
  currentUserId,
}: {
  teamId: string;
  currentUserId: string;
}) {
  const [rows, setRows] = useState<Row[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const supabase = createClient();

  async function loadLeaderboard() {
    const { data } = await supabase
      .from("team_leaderboard")
      .select("*")
      .eq("team_id", teamId)
      .order("total_points", { ascending: false });

    const leaderboardRows = data ?? [];
    setRows(leaderboardRows);

    // Fetch display names for all users in the leaderboard
    const userIds = leaderboardRows.map((r) => r.user_id);

    const nameMap: Record<string, string> = {};
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, display_name")
        .in("id", userIds);

      for (const id of userIds) {
        const profile = (profiles ?? []).find((p) => p.id === id);
        nameMap[id] = profile?.display_name || id.slice(0, 8);
      }
    }
    setNames(nameMap);
  }

  useEffect(() => {
    loadLeaderboard();

    const channel = supabase
      .channel(`team-${teamId}-checkins`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "checkins" },
        () => {
          loadLeaderboard();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [teamId]);

  function getDisplayName(userId: string): string {
    return names[userId] || userId.slice(0, 8);
  }

  function getMedal(i: number): string {
    if (i === 0) return "1st";
    if (i === 1) return "2nd";
    if (i === 2) return "3rd";
    return `${i + 1}th`;
  }

  return (
    <div className="xp-window">
      <div className="xp-window-title">
        <div className="flex items-center gap-1.5">
          <img src="/icons/icon-trophy.png" alt="" className="w-4 h-4" />
          <span>Team Leaderboard</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] opacity-80">rankings</span>
          <div className="xp-window-controls">
            <span className="xp-window-minimize">_</span>
            <span className="xp-window-maximize">&#9633;</span>
            <span className="xp-window-close">X</span>
          </div>
        </div>
      </div>
      <div>
        {/* Column headers */}
        <div className="flex items-center gap-0 px-2 py-1 text-[10px] font-bold text-gray-700 bg-gradient-to-b from-xp-silver-100 to-xp-silver-300 border-b border-black shadow-xp-sunken">
          <span className="w-8 text-center">Rank</span>
          <span className="flex-1">Member</span>
          <span className="w-16 text-right">Points</span>
          <span className="w-20 text-right hidden sm:block">Check-ins</span>
        </div>

        {/* Rows */}
        <div className="divide-y divide-gray-400">
          {rows.map((r, i) => {
            const isCurrentUser = r.user_id === currentUserId;
            return (
              <div
                key={r.user_id}
                className={`flex items-center gap-0 px-2 py-2 text-xs ${
                  isCurrentUser
                    ? "bg-xp-blue-500 text-white"
                    : i % 2 === 0
                    ? "bg-white"
                    : "bg-xp-silver-50"
                }`}
              >
                <span className="w-8 text-center font-bold text-inherit">
                  {getMedal(i)}
                </span>
                <span className="flex-1 truncate text-inherit">
                  <span className={isCurrentUser ? "text-xp-gold font-bold" : "font-bold text-black"}>
                    {isCurrentUser
                      ? `${getDisplayName(r.user_id)} (You)`
                      : getDisplayName(r.user_id)}
                  </span>
                </span>
                <span className="w-16 text-right font-bold text-inherit">
                  {r.total_points} pts
                </span>
                <span className="w-20 text-right text-inherit hidden sm:block">
                  {r.total_checkins} check-in{r.total_checkins !== 1 ? "s" : ""}
                </span>
              </div>
            );
          })}
          {!rows.length && (
            <div className="p-6 text-center text-sm text-gray-500">
              <p>No check-ins yet.</p>
              <p className="text-xs text-gray-400 mt-1">
                Be the first to check in to a habit!
              </p>
            </div>
          )}
        </div>
      </div>
      {/* Status bar */}
      <div className="border-t border-black bg-xp-silver-300 px-2 py-0.5 text-[10px] text-gray-600 flex items-center justify-between shadow-xp-sunken">
        <span>{rows.length} member{rows.length !== 1 ? "s" : ""}</span>
        <span>Leaderboard</span>
      </div>
    </div>
  );
}
