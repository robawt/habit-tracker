import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import HabitList from "@/components/HabitList";
import Leaderboard from "@/components/Leaderboard";

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

  return (
    <div className="space-y-8">
      {/* Team Header */}
      <div className="card p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-old-blue-500 text-old-yellow-400 flex items-center justify-center text-2xl font-bold border-2 border-old-navy shadow-box-sm">
              {team.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-old-navy">
                {team.name}
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-sm text-gray-500">
                  {memberCount || 1} member{(memberCount || 1) !== 1 ? "s" : ""}
                </span>
                <span className="text-sm text-gray-400">|</span>
                <span className="text-sm text-gray-500">
                  Invite code:{" "}
                  <span className="font-mono font-bold text-old-navy bg-old-yellow-100 px-1.5 py-0.5 border border-old-navy">
                    {team.invite_code}
                  </span>
                </span>
              </div>
            </div>
          </div>
          <Link
            href={`/teams/${team.id}/habits/new`}
            className="btn-primary"
          >
            + New Habit
          </Link>
        </div>
      </div>

      {/* Habits */}
      <div>
        <h2 className="text-lg font-bold text-old-navy mb-3">
          Today&apos;s Habits
        </h2>
        <HabitList
          userId={user.id}
          initialHabits={habitsWithStreaks}
        />
      </div>

      {/* Leaderboard */}
      <Leaderboard teamId={team.id} currentUserId={user.id} />
    </div>
  );
}

