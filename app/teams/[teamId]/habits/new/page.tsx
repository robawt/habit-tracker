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
    <div className="max-w-lg mx-auto">
      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-old-yellow-400 text-old-navy flex items-center justify-center text-lg font-bold border-2 border-old-navy shadow-box-sm">
            +
          </div>
          <div>
            <h1 className="text-xl font-bold text-old-navy">New habit</h1>
            <p className="text-sm text-gray-500">
              Define a new habit for your team to track
            </p>
          </div>
        </div>

        <div>
          <label className="label" htmlFor="title">Habit title</label>
          <input
            id="title"
            required
            maxLength={100}
            placeholder="e.g. Ship a PR"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-field"
          />
        </div>

        <div>
          <label className="label" htmlFor="points">Base points per check-in</label>
          <input
            id="points"
            type="number"
            min={1}
            max={100}
            value={points}
            onChange={(e) => setPoints(Number(e.target.value))}
            className="input-field"
          />
          <p className="text-xs text-gray-400 mt-1">
            Higher points = more motivation. Streaks multiply this over time.
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary"
          >
            {submitting ? "Creating..." : "Create habit"}
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border-2 border-red-800 text-red-800 text-sm p-3 shadow-box-sm">
            {error}
          </div>
        )}
      </form>
    </div>
  );
}
