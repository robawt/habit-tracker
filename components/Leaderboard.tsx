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
  const supabase = createClient();

  async function loadLeaderboard() {
    const { data } = await supabase
      .from("team_leaderboard")
      .select("*")
      .eq("team_id", teamId)
      .order("total_points", { ascending: false });

    setRows(data ?? []);
  }

  useEffect(() => {
    loadLeaderboard();

    // Supabase Realtime: subscribe to Postgres changes on the
    // `checkins` table. Whenever ANYONE on this team checks in,
    // every connected browser gets a websocket push and we just
    // re-run the leaderboard query. No polling, no manual refresh.
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

    // Always clean up subscriptions when the component unmounts,
    // or you'll leak websocket connections as users navigate around.
    return () => {
      supabase.removeChannel(channel);
    };
  }, [teamId]);

  return (
    <div>
      <h2 className="font-semibold text-lg mb-3">🏆 Leaderboard</h2>
      <div className="border rounded-lg divide-y">
        {rows.map((r, i) => (
          <div
            key={r.user_id}
            className={`flex justify-between items-center px-4 py-3 ${
              r.user_id === currentUserId ? "bg-slate-100" : ""
            }`}
          >
            <span>
              #{i + 1} {r.user_id === currentUserId ? "You" : r.user_id.slice(0, 8)}
            </span>
            <span className="font-medium">
              {r.total_points} pts · {r.total_checkins} check-ins
            </span>
          </div>
        ))}
        {!rows.length && (
          <p className="text-slate-500 text-sm p-4">No check-ins yet.</p>
        )}
      </div>
    </div>
  );
}
