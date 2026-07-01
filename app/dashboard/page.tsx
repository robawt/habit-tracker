import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

// This is a SERVER COMPONENT (no "use client" at the top). It runs
// on the server, fetches data before sending HTML to the browser —
// good for the initial page load. We only reach for client
// components when we need interactivity (state, event handlers,
// realtime subscriptions), like in CheckInButton later.
export default async function Dashboard() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/");

  // RLS means this query automatically only returns teams the
  // logged-in user belongs to — no WHERE clause needed for that.
  const { data: teams } = await supabase
    .from("team_members")
    .select("teams(id, name, invite_code)")
    .eq("user_id", user.id);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Teams</h1>
        <div className="space-x-2">
          <Link
            href="/teams/new"
            className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm"
          >
            + New team
          </Link>
        </div>
      </div>

      {!teams?.length && (
        <p className="text-slate-600">
          You're not on any teams yet. Create one to get started.
        </p>
      )}

      <ul className="space-y-2">
        {teams?.map((row: any) => (
          <li key={row.teams.id}>
            <Link
              href={`/teams/${row.teams.id}`}
              className="block border rounded-lg p-4 hover:bg-slate-100"
            >
              <span className="font-medium">{row.teams.name}</span>
              <span className="text-slate-500 text-sm ml-2">
                invite code: {row.teams.invite_code}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
