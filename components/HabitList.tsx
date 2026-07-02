"use client";

import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

type Habit = {
  id: string;
  title: string;
  points_per_checkin: number;
  currentStreak: number;
  checkedInToday: boolean;
};

export default function HabitList({
  userId,
  initialHabits,
}: {
  userId: string;
  initialHabits: Habit[];
}) {
  const [habits, setHabits] = useState(initialHabits);
  const [error, setError] = useState<string | null>(null);
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const supabase = createClient();

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    };
  }, []);

  async function checkIn(habit: Habit) {
    setError(null);
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);

    // Optimistic update
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
      // Roll back if it failed
      setHabits((prev) =>
        prev.map((h) =>
          h.id === habit.id
            ? { ...h, checkedInToday: false, currentStreak: habit.currentStreak }
            : h
        )
      );
      setError(error.message);
      // Clear error after 5 seconds
      errorTimerRef.current = setTimeout(() => setError(null), 5000);
    }
  }

  if (!habits.length) {
    return (
      <div className="card p-8 text-center">
        <div className="w-14 h-14 bg-old-blue-500 text-old-yellow-400 text-xl font-bold flex items-center justify-center mx-auto mb-3 border-2 border-old-navy shadow-box-sm">
          ~
        </div>
        <p className="text-gray-600 mb-4">
          No habits yet -- add one to start tracking.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="bg-red-100 border-2 border-red-800 text-red-800 text-sm p-3 shadow-box-sm">
          Failed to check in: {error}
        </div>
      )}
      {habits.map((h) => (
        <div
          key={h.id}
          className={`card p-5 flex items-center justify-between ${
            h.checkedInToday ? "bg-green-100" : ""
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 flex items-center justify-center text-lg font-bold border-2 border-old-navy shadow-box-sm ${
                h.checkedInToday
                  ? "bg-green-800 text-white"
                  : "bg-old-blue-500 text-old-yellow-400"
              }`}
            >
              {h.checkedInToday ? "OK" : "!?"}
            </div>
            <div>
              <p className="font-bold text-old-navy">{h.title}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-sm font-bold text-old-navy bg-old-yellow-200 px-1.5 border border-old-navy shadow-box-sm">
                  {h.currentStreak}
                </span>
                <span className="text-xs text-gray-400">|</span>
                <span className="text-sm font-bold text-old-navy">
                  {h.points_per_checkin} pts
                </span>
              </div>
            </div>
          </div>
          <button
            disabled={h.checkedInToday}
            onClick={() => checkIn(h)}
            className={`px-5 py-2.5 text-sm font-bold border-2 border-old-navy ${
              h.checkedInToday
                ? "bg-green-800 text-white shadow-box-sm cursor-default"
                : "btn-primary"
            }`}
          >
            {h.checkedInToday ? "✓ Checked in" : "Check in"}
          </button>
        </div>
      ))}
    </div>
  );
}
