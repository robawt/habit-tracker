import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import HabitList from "@/components/HabitList";
import Leaderboard from "@/components/Leaderboard";
import TeamChat from "@/components/TeamChat";

export default async function TeamPage({
  params,
}: {
  params: { teamId: string };
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: team } = await supabase
    .from("teams")
    .select("id, name, invite_code")
    .eq("id", params.teamId)
    .single();

  if (!team) redirect("/dashboard");

  // Count members
  const { count: memberCount } = await supabase
    .from("team_members")
    .select("*", { count: "exact", head: true })
    .eq("team_id", team.id);

  const { data: habits } = await supabase
    .from("habits")
    .select("id, title, points_per_checkin")
    .eq("team_id", team.id);

  // For each habit, get today's checkin status + current streak
  const { data: todaysCheckins } = await supabase
    .from("checkins")
    .select("habit_id")
    .eq("user_id", user.id)
    .eq("checkin_date", new Date().toISOString().slice(0, 10));

  const checkedInHabitIds = new Set(todaysCheckins?.map((c) => c.habit_id));

  const habitsWithStreaks = await Promise.all(
    (habits ?? []).map(async (h) => {
      const { data: streak } = await supabase.rpc("get_current_streak", {
        p_user_id: user.id,
        p_habit_id: h.id,
      });
      return {
        ...h,
        currentStreak: streak ?? 0,
        checkedInToday: checkedInHabitIds.has(h.id),
      };
    })
  );

  // Pick a team icon color based on team name hash
  const iconColors = ["blue", "red", "green", "gold", "purple", "teal", "orange", "magenta"];
  const colorIndex = team.name.length % iconColors.length;
  const teamIcon = `team-${iconColors[colorIndex]}`;

  return (
    <div className="space-y-6">
      {/* Team Header Window */}
      <div className="xp-window">
        <div className="xp-window-title">
          <span>{team.name}</span>
          <div className="flex items-center gap-1.5">
            <Link
              href={`/teams/${team.id}/habits/new`}
              className="btn-xp-green text-[10px] px-2 py-0.5"
            >
              + New Habit
            </Link>
            <div className="xp-window-controls">
              <span className="xp-window-minimize">_</span>
              <span className="xp-window-maximize">&#9633;</span>
              <span className="xp-window-close">X</span>
            </div>
          </div>
        </div>
        <div className="xp-window-body">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 border-2 border-black shadow-xp-sunken shrink-0 overflow-hidden">
                <img src={`/icons/${teamIcon}.png`} alt={team.name} className="w-full h-full" />
              </div>
              <div>
                <h1 className="text-base font-bold text-black font-heading">
                  {team.name}
                </h1>
                <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-600">
                  <span>
                    {memberCount || 1} member{(memberCount || 1) !== 1 ? "s" : ""}
                  </span>
                  <span className="text-gray-400">|</span>
                  <span>
                    Invite code:{" "}
                    <span className="font-mono font-bold text-black bg-xp-silver-100 px-1 border border-black shadow-xp-sunken">
                      {team.invite_code}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Status bar */}
        <div className="border-t border-black bg-xp-silver-300 px-2 py-0.5 text-[10px] text-gray-600 flex items-center justify-between shadow-xp-sunken">
          <span>{habits?.length || 0} habit(s)</span>
          <span>Team folder</span>
        </div>
      </div>

      {/* Two-column layout: Habits + Chat */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left column: Habits */}
        <div className="space-y-6">
          {/* Today's Habits Window */}
          <div className="xp-window">
            <div className="xp-window-title">
              <div className="flex items-center gap-1.5">
                <img src="/icons/habit-check.png" alt="" className="w-4 h-4" />
                <span>Today&apos;s Habits</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] opacity-80">check in daily</span>
                <div className="xp-window-controls">
                  <span className="xp-window-minimize">_</span>
                  <span className="xp-window-maximize">&#9633;</span>
                  <span className="xp-window-close">X</span>
                </div>
              </div>
            </div>
            <div className="xp-window-body">
              <HabitList
                userId={user.id}
                initialHabits={habitsWithStreaks}
              />
            </div>
          </div>

          {/* Leaderboard */}
          <Leaderboard teamId={team.id} currentUserId={user.id} />
        </div>

        {/* Right column: Chat */}
        <div>
          <TeamChat teamId={team.id} currentUserId={user.id} />
        </div>
      </div>
    </div>
  );
}
