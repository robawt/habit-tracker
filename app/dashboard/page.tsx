import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Dashboard() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/");

  // Fetch user's profile for display name
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .single();

  // RLS means this query automatically only returns teams the
  // logged-in user belongs to — no WHERE clause needed for that.
  const { data: teams } = await supabase
    .from("team_members")
    .select("teams(id, name, invite_code)")
    .eq("user_id", user.id);

  const displayName =
    profile?.display_name || user.email?.split("@")[0] || "User";

  function getInitial(name: string) {
    return name.charAt(0).toUpperCase();
  }

  return (
    <div className="space-y-6">
      {/* Welcome Window */}
      <div className="xp-window">
        <div className="xp-window-title">
          <span>Welcome</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] opacity-80">{user.email}</span>
            <div className="xp-window-controls">
              <span className="xp-window-minimize">_</span>
              <span className="xp-window-maximize">&#9633;</span>
              <span className="xp-window-close">X</span>
            </div>
          </div>
        </div>
        <div className="xp-window-body">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-xp-silver border border-black shadow-xp-sunken flex items-center justify-center shrink-0">
              <span className="text-lg font-bold text-xp-blue-500">
                {getInitial(displayName)}
              </span>
            </div>
            <div>
              <h1 className="text-base font-bold text-black font-heading">
                Welcome, {displayName}!
              </h1>
              <p className="text-xs text-gray-600 mt-0.5">
                {teams?.length || 0} team{teams?.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Teams Window */}
      <div className="xp-window">
        <div className="xp-window-title">
          <span>Your Teams</span>
          <div className="flex items-center gap-1.5">
            <Link href="/teams/new" className="btn-xp-green text-[10px] px-2 py-0.5">
              + New
            </Link>
            <div className="xp-window-controls">
              <span className="xp-window-minimize">_</span>
              <span className="xp-window-maximize">&#9633;</span>
              <span className="xp-window-close">X</span>
            </div>
          </div>
        </div>
        <div className="xp-window-body">
          {!teams?.length ? (
            <div className="text-center py-6">
              <div className="w-10 h-10 bg-xp-silver border border-black shadow-xp-sunken flex items-center justify-center mx-auto mb-2">
                <span className="font-bold text-xp-blue-500">!</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                You&apos;re not on any teams yet. Create one or join with an invite code!
              </p>
              <Link href="/teams/new" className="btn-xp-primary">
                Get started
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {teams?.map((row: any) => (
                <Link
                  key={row.teams.id}
                  href={`/teams/${row.teams.id}`}
                  className="flex items-center justify-between px-3 py-2 border border-black bg-xp-silver-100 hover:bg-xp-silver-200 shadow-xp-raised-sm active:shadow-xp-sunken active:translate-x-px active:translate-y-px"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-xp-silver border border-black shadow-xp-sunken flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-xp-blue-500">
                        {getInitial(row.teams.name)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-black">
                        {row.teams.name}
                      </p>
                      <p className="text-[10px] text-gray-500 font-mono">
                        Code: {row.teams.invite_code}
                      </p>
                    </div>
                  </div>
                  <span className="text-black font-bold text-sm">&gt;</span>
                </Link>
              ))}
            </div>
          )}
        </div>
        {/* Status bar */}
        <div className="border-t border-black bg-xp-silver-300 px-2 py-0.5 text-[10px] text-gray-600 flex items-center justify-between shadow-xp-sunken">
          <span>{teams?.length || 0} item(s)</span>
          <span>My Computer</span>
        </div>
      </div>

      {/* Quick Actions Window */}
      <div className="xp-window">
        <div className="xp-window-title">
          <span>Quick Actions</span>
          <div className="xp-window-controls">
            <span className="xp-window-minimize">_</span>
            <span className="xp-window-maximize">&#9633;</span>
            <span className="xp-window-close">X</span>
          </div>
        </div>
        <div className="xp-window-body">
          <div className="grid gap-3 sm:grid-cols-3">
            <Link
              href="/teams/new"
              className="flex flex-col items-center gap-2 px-4 py-4 border border-black bg-xp-silver hover:bg-xp-silver-100 shadow-xp-raised-sm active:shadow-xp-sunken active:translate-x-px active:translate-y-px"
            >
              <div className="w-10 h-10 bg-xp-gold border border-black shadow-xp-sunken flex items-center justify-center">
                <span className="text-base font-bold text-black">+</span>
              </div>
              <div className="text-center">
                <p className="text-xs font-bold text-black">Create Team</p>
                <p className="text-[10px] text-gray-600 mt-0.5">
                  Start a new team
                </p>
              </div>
            </Link>

            <Link
              href="/profile"
              className="flex flex-col items-center gap-2 px-4 py-4 border border-black bg-xp-silver hover:bg-xp-silver-100 shadow-xp-raised-sm active:shadow-xp-sunken active:translate-x-px active:translate-y-px"
            >
              <div className="w-10 h-10 bg-xp-blue-500 border border-black shadow-xp-sunken flex items-center justify-center">
                <span className="text-base font-bold text-white">@</span>
              </div>
              <div className="text-center">
                <p className="text-xs font-bold text-black">Your Profile</p>
                <p className="text-[10px] text-gray-600 mt-0.5">
                  Edit settings
                </p>
              </div>
            </Link>

            <div className="flex flex-col items-center gap-2 px-4 py-4 border border-black bg-xp-green-100 shadow-xp-sunken">
              <div className="w-10 h-10 bg-xp-green-500 border border-black shadow-xp-sunken flex items-center justify-center">
                <img src="/icons/habit-streak.png" alt="streak" className="w-7 h-7" />
              </div>
              <div className="text-center">
                <p className="text-xs font-bold text-black">Stay consistent</p>
                <p className="text-[10px] text-gray-600 mt-0.5">
                  Check in daily
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
