"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Habit = {
  id: string;
  title: string;
  points_per_checkin: number;
  currentStreak: number;
  checkedInToday: boolean;
};

export default function HabitList({
  teamId,
  userId,
  initialHabits,
}: {
  teamId: string;
  userId: string;
  initialHabits: Habit[];
}) {
  const [habits, setHabits] = useState(initialHabits);
  const supabase = createClient();

  async function checkIn(habit: Habit) {
    // Optimistic update: flip the UI instantly, then reconcile
    // with the server. Feels instant even on a slow connection —
    // the core feeling a habit-tracker check-in NEEDS to have.
    setHabits((prev) =>
      prev.map((h) =>
        h.id === habit.id
          ? { ...h, checkedInToday: true, currentStreak: h.currentStreak + 1 }
          : h
      )
    );

    const { error } = await supabase.from("checkins").insert({
      habit_id: habit.id,
      user_id: userId,
    });

    if (error) {
      // Roll back if it failed (e.g. the unique constraint caught
      // a double check-in from another tab).
      setHabits((prev) =>
        prev.map((h) =>
          h.id === habit.id
            ? { ...h, checkedInToday: false, currentStreak: habit.currentStreak }
            : h
        )
      );
    }
  }

  if (!habits.length) {
    return (
      <p className="text-slate-600">
        No habits yet — add one to start tracking.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {habits.map((h) => (
        <div
          key={h.id}
          className="border rounded-lg p-4 flex items-center justify-between"
        >
          <div>
            <p className="font-medium">{h.title}</p>
            <p className="text-sm text-slate-500">
              🔥 {h.currentStreak} day streak · {h.points_per_checkin} pts base
            </p>
          </div>
          <button
            disabled={h.checkedInToday}
            onClick={() => checkIn(h)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              h.checkedInToday
                ? "bg-green-100 text-green-700 cursor-default"
                : "bg-slate-900 text-white"
            }`}
          >
            {h.checkedInToday ? "✓ Checked in" : "Check in"}
          </button>
        </div>
      ))}
    </div>
  );
}
