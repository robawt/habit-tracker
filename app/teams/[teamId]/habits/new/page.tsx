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
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmed = title.trim();
    if (trimmed.length < 1 || trimmed.length > 100) {
      return setError("Habit title must be 1–100 characters.");
    }
    if (points < 1) {
      return setError("Points must be at least 1.");
    }

    setSubmitting(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSubmitting(false);
      return;
    }

    await supabase.from("habits").insert({
      team_id: params.teamId,
      created_by: user.id,
      title: trimmed,
      points_per_checkin: points,
    });

    router.push(`/teams/${params.teamId}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 mt-10">
      <h1 className="text-xl font-bold">New habit</h1>
      <input
        required
        maxLength={100}
        placeholder="e.g. Ship a PR"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full border rounded-lg px-4 py-2"
      />
      <div>
        <label className="text-sm text-slate-600">Base points per check-in</label>
        <input
          type="number"
          min={1}
          value={points}
          onChange={(e) => setPoints(Number(e.target.value))}
          className="w-full border rounded-lg px-4 py-2"
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="bg-slate-900 text-white rounded-lg px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? "Creating..." : "Create habit"}
      </button>
      {error && <p className="text-red-600 text-sm">{error}</p>}
    </form>
  );
}
