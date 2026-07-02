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
    // Fetch fresh each time so profile changes are reflected immediately
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
    if (i === 0) return "#1";
    if (i === 1) return "#2";
    if (i === 2) return "#3";
    return `#${i + 1}`;
  }

  return (
    <div>
      <h2 className="text-lg font-bold text-old-navy mb-3">[ Leaderboard ]</h2>
      <div className="card divide-y-2 divide-old-navy overflow-hidden">
        {rows.map((r, i) => (
          <div
            key={r.user_id}
            className={`flex items-center gap-3 px-4 py-3.5 ${
              r.user_id === currentUserId
                ? "bg-old-blue-500 text-white"
                : i % 2 === 0
                ? "bg-white"
                : "bg-old-yellow-100"
            }`}
          >
            <span className="w-8 text-center text-sm font-bold text-inherit">
              {getMedal(i)}
            </span>
            <div className="flex-1 min-w-0">
              <span
                className={`font-bold text-sm truncate ${
                  r.user_id === currentUserId
                    ? "text-old-yellow-400"
                    : "text-old-navy"
                }`}
              >
                {r.user_id === currentUserId
                  ? `${getDisplayName(r.user_id)} (You)`
                  : getDisplayName(r.user_id)}
              </span>
            </div>
            <div className="text-right flex-shrink-0">
              <span className="font-bold text-sm text-inherit">
                {r.total_points} pts
              </span>
              <span className="text-xs opacity-75 ml-2">
                {r.total_checkins} check-in{r.total_checkins !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        ))}
        {!rows.length && (
          <div className="p-6 text-center">
            <p className="text-gray-500 text-sm">No check-ins yet.</p>
            <p className="text-xs text-gray-400 mt-1">
              Be the first to check in to a habit!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
