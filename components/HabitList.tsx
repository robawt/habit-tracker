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

const CELEBRATIONS = [
  "Nice streak!",
  "Streak +1!",
  "Day {n}!",
  "On fire!",
  "Keep it going!",
  "You checked in!",
  "Solid!",
  "Another one!",
];

export default function HabitList({
  userId,
  initialHabits,
}: {
  userId: string;
  initialHabits: Habit[];
}) {
  const [habits, setHabits] = useState(initialHabits);
  const [error, setError] = useState<string | null>(null);
  const [celebration, setCelebration] = useState<{ habitId: string; message: string } | null>(null);
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const celebrationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const supabase = createClient();

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
      if (celebrationTimerRef.current) clearTimeout(celebrationTimerRef.current);
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
      errorTimerRef.current = setTimeout(() => setError(null), 5000);
    } else {
      // Show celebration message
      const newStreak = habit.currentStreak + 1;
      const randomMsg = CELEBRATIONS[Math.floor(Math.random() * CELEBRATIONS.length)]
        .replace("{n}", String(newStreak));
      setCelebration({ habitId: habit.id, message: randomMsg });
      celebrationTimerRef.current = setTimeout(() => setCelebration(null), 2500);
    }
  }

  if (!habits.length) {
    return (
      <div className="text-center py-6">
        <div className="w-10 h-10 bg-xp-silver border border-black shadow-xp-sunken flex items-center justify-center mx-auto mb-2">
          <span className="font-bold text-xp-blue-500">~</span>
        </div>
        <p className="text-sm text-gray-600">
          No habits yet — add one to start tracking.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {error && (
        <div className="msg-xp-error">
          Couldn't check in: {error}
        </div>
      )}
      {habits.map((h) => (
        <div key={h.id}>
          {/* Celebration toast */}
          {celebration?.habitId === h.id && (
            <div className="msg-xp-success mb-2 text-center text-[11px] font-bold animate-pulse">
              {celebration.message}
            </div>
          )}
          <div
            className={`flex items-center justify-between px-3 py-2.5 border border-black ${
              h.checkedInToday
                ? "bg-xp-green-100 shadow-xp-sunken"
                : "bg-xp-silver-100 shadow-xp-raised-sm"
            }`}
          >
            <div className="flex items-center gap-3">
              {/* Status indicator */}
              <div
                className={`w-9 h-9 flex items-center justify-center text-sm font-bold border border-black shadow-xp-sunken ${
                  h.checkedInToday
                    ? "bg-xp-green-500 text-white"
                    : "bg-xp-blue-500 text-white"
                }`}
              >
                {h.checkedInToday ? "OK" : "?"}
              </div>
              <div>
                <p className="text-sm font-bold text-black">{h.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {/* Streak badge */}
                  <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-black bg-xp-gold px-1.5 border border-black shadow-xp-raised-sm">
                    STREAK {h.currentStreak}
                  </span>
                  <span className="text-[10px] text-gray-400">|</span>
                  <span className="text-xs font-bold text-gray-700">
                    {h.points_per_checkin} pts
                  </span>
                </div>
              </div>
            </div>
            <button
              disabled={h.checkedInToday}
              onClick={() => checkIn(h)}
              className={`px-4 py-1.5 text-xs font-bold border border-black ${
                h.checkedInToday
                  ? "bg-xp-green-500 text-white shadow-xp-sunken cursor-default"
                  : "btn-xp-green text-xs"
              }`}
            >
              {h.checkedInToday ? "[X] Checked in" : "Check in"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
