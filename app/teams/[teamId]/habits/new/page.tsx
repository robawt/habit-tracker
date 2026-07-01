"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function NewHabitPage({
  params,
}: {
  params: { teamId: string };
}) {
  const [title, setTitle] = useState("");
  const [points, setPoints] = useState(10);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("habits").insert({
      team_id: params.teamId,
      created_by: user.id,
      title,
      points_per_checkin: points,
    });

    router.push(`/teams/${params.teamId}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 mt-10">
      <h1 className="text-xl font-bold">New habit</h1>
      <input
        required
        placeholder="e.g. Ship a PR"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full border rounded-lg px-4 py-2"
      />
      <div>
        <label className="text-sm text-slate-600">Base points per check-in</label>
        <input
          type="number"
          value={points}
          onChange={(e) => setPoints(Number(e.target.value))}
          className="w-full border rounded-lg px-4 py-2"
        />
      </div>
      <button className="bg-slate-900 text-white rounded-lg px-4 py-2 text-sm">
        Create habit
      </button>
    </form>
  );
}
