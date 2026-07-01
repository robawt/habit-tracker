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

  const { data: habits } = await supabase
    .from("habits")
    .select("id, title, points_per_checkin")
    .eq("team_id", team.id);

  // For each habit, get today's checkin status + current streak for
  // THIS user, so the UI can show "already checked in" correctly.
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{team.name}</h1>
          <p className="text-slate-500 text-sm">
            Invite code: <b>{team.invite_code}</b>
          </p>
        </div>
        <Link
          href={`/teams/${team.id}/habits/new`}
          className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm"
        >
          + Habit
        </Link>
      </div>

      <HabitList
        teamId={team.id}
        userId={user.id}
        initialHabits={habitsWithStreaks}
      />

      <Leaderboard teamId={team.id} currentUserId={user.id} />
    </div>
  );
}
