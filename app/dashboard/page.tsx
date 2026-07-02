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
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="card p-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-old-blue-500 text-old-yellow-400 flex items-center justify-center text-xl font-bold border-2 border-old-navy shadow-box-sm">
            {getInitial(displayName)}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-old-navy">
              Welcome, {displayName}!
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {teams?.length || 0} team{teams?.length !== 1 ? "s" : ""} |{" "}
              {user.email}
            </p>
          </div>
        </div>
      </div>

      {/* Teams Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-old-navy">Your Teams</h2>
          <Link href="/teams/new" className="btn-primary">
            + New team
          </Link>
        </div>

        {!teams?.length ? (
          <div className="card p-8 text-center">
            <div className="w-14 h-14 bg-old-blue-500 text-old-yellow-400 text-xl font-bold flex items-center justify-center mx-auto mb-3 border-2 border-old-navy shadow-box-sm">
              !
            </div>
            <p className="text-gray-600 mb-4">
              You&apos;re not on any teams yet. Create one or join with an
              invite code to get started!
            </p>
            <Link href="/teams/new" className="btn-primary">
              Get started
            </Link>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {teams?.map((row: any) => (
              <Link
                key={row.teams.id}
                href={`/teams/${row.teams.id}`}
                className="card p-5 hover:shadow-box-lg transition-none group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-old-blue-500 text-old-yellow-400 flex items-center justify-center text-sm font-bold border-2 border-old-navy shadow-box-sm">
                      {getInitial(row.teams.name)}
                    </div>
                    <div>
                      <p className="font-bold text-old-navy">
                        {row.teams.name}
                      </p>
                      <p className="text-xs text-gray-400 font-mono">
                        Code: {row.teams.invite_code}
                      </p>
                    </div>
                  </div>
                  <span className="text-old-navy font-bold text-lg">&gt;</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-bold text-old-navy mb-4">
          Quick Actions
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <Link
            href="/teams/new"
            className="card p-5 text-center hover:shadow-box-lg"
          >
            <div className="w-12 h-12 bg-old-yellow-400 text-old-navy text-lg font-bold flex items-center justify-center mx-auto mb-2 border-2 border-old-navy shadow-box-sm">
              +
            </div>
            <p className="font-bold text-old-navy">
              Create Team
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Start a new team for your habits
            </p>
          </Link>

          <Link
            href="/profile"
            className="card p-5 text-center hover:shadow-box-lg"
          >
            <div className="w-12 h-12 bg-old-blue-500 text-old-yellow-400 text-lg font-bold flex items-center justify-center mx-auto mb-2 border-2 border-old-navy shadow-box-sm">
              @
            </div>
            <p className="font-bold text-old-navy">
              Your Profile
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Edit display name and settings
            </p>
          </Link>

          <div className="card p-5 text-center bg-old-yellow-100">
            <div className="w-12 h-12 bg-old-yellow-400 text-old-navy text-lg font-bold flex items-center justify-center mx-auto mb-2 border-2 border-old-navy shadow-box-sm">
              &#9733;
            </div>
            <p className="font-bold text-old-navy">Stay consistent</p>
            <p className="text-xs text-gray-500 mt-1">
              Check in daily to build streaks
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

