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
      <form onSubmit={handleSubmit}>
        <div className="xp-window">
          <div className="xp-window-title">
            <span>New Habit</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] opacity-80">define a new habit</span>
              <div className="xp-window-controls">
                <span className="xp-window-minimize">_</span>
                <span className="xp-window-maximize">&#9633;</span>
                <span className="xp-window-close">X</span>
              </div>
            </div>
          </div>
          <div className="xp-window-body space-y-4">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 border border-black shadow-xp-sunken overflow-hidden shrink-0">
                <img src="/icons/habit-add.png" alt="new habit" className="w-full h-full" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-black font-heading">New habit</h1>
                <p className="text-xs text-gray-600">
                  Define a new habit for your team to track
                </p>
              </div>
            </div>

            {/* Habit Title */}
            <div>
              <label className="label-xp" htmlFor="title">Habit title</label>
              <input
                id="title"
                required
                maxLength={100}
                placeholder="e.g. Ship a PR"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input-xp"
              />
            </div>

            {/* Points */}
            <div>
              <label className="label-xp" htmlFor="points">Base points per check-in</label>
              <input
                id="points"
                type="number"
                min={1}
                max={100}
                value={points}
                onChange={(e) => setPoints(Number(e.target.value))}
                className="input-xp"
              />
              <p className="text-[10px] text-gray-400 mt-0.5">
                Higher points = more motivation. Streaks multiply this over time.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-2 pt-1">
              <button type="submit" disabled={submitting} className="btn-xp-primary">
                {submitting ? "Creating..." : "Create habit"}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="btn-xp"
              >
                Cancel
              </button>
            </div>

            {error && (
              <div className="msg-xp-error">{error}</div>
            )}
          </div>
          {/* Status bar */}
          <div className="border-t border-black bg-xp-silver-300 px-2 py-0.5 text-[10px] text-gray-600 flex items-center justify-between shadow-xp-sunken">
            <span>New Habit Wizard</span>
            <span>{submitting ? "Creating..." : "Ready"}</span>
          </div>
        </div>
      </form>
    </div>
  );
}
