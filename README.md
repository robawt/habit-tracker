# Habit Tracker — Team streaks + rewards

A weekend-scoped Next.js + Supabase app: teams, daily check-ins, SQL-computed
streaks, auto-awarded points/badges, and a realtime leaderboard.

## 1. Create a Supabase project
1. Go to https://supabase.com/dashboard → New project.
2. Wait for it to provision (~2 min).
3. Go to Project Settings → API. Copy the **Project URL** and **anon public key**.

## 2. Run the database migration
1. In the Supabase dashboard, open the **SQL Editor**.
2. Paste the entire contents of `supabase/migrations/0001_init.sql` and run it.
3. Check **Table Editor** — you should see `teams`, `habits`, `checkins`, etc.

This one file creates every table, the streak-calculation functions, the
points/badge triggers, the leaderboard view, and all RLS policies. Read
through it — it's genuinely the most important file in this project. The
comments explain *why*, not just *what*.

## 3. Configure environment variables
```bash
cp .env.local.example .env.local
```
Fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## 4. Enable email auth
In Supabase dashboard → Authentication → Providers, make sure **Email** is
enabled and "Confirm email" is off for local testing (or you'll need to click
a confirmation link before the magic link works). Under Authentication → URL
Configuration, add `http://localhost:3000/auth/callback` as a redirect URL.

## 5. Install and run
```bash
npm install
npm run dev
```
Open http://localhost:3000, enter your email, click the magic link Supabase
sends you — you're in.

## How the pieces fit together

- **`lib/supabase/client.ts`** vs **`lib/supabase/server.ts`** — Supabase
  needs a different client depending on whether code runs in the browser
  (uses browser storage/cookies directly) or on the server (reads cookies
  via Next's `cookies()`). Mixing these up is the #1 source of confusing
  Supabase + Next.js bugs.
- **RLS policies** (bottom of the SQL file) mean the browser can talk
  directly to Postgres through the Supabase client, safely — no custom
  API layer needed. Every `select`/`insert` is filtered by "is this user
  allowed to see/write this row?" at the database level.
- **Streak calculation** uses the classic "gaps and islands" SQL pattern:
  number each check-in row in date order, subtract the row number (as
  days) from the date. Consecutive days collapse to the same result,
  which becomes a group ID for an unbroken streak. Worth studying — this
  pattern shows up constantly in analytics SQL, not just habit trackers.
- **Triggers** (`trg_checkin_points`, `trg_checkin_badges`) award points
  and badges automatically, server-side, the instant a check-in row is
  inserted — so it's impossible for a client bug (or a malicious user)
  to insert a check-in without going through the reward logic.
- **Realtime** (`components/Leaderboard.tsx`) subscribes to Postgres
  inserts on `checkins` over a websocket. Any teammate checking in pushes
  a live update to everyone's leaderboard — no polling.

## Features intentionally left for you to build (good next steps)

1. **Show real names, not user IDs.** Create a `profiles` table
   (`id uuid references auth.users`, `display_name text`, `avatar_url text`),
   populate it via a trigger `on auth.users insert`, and join it into the
   leaderboard query. This is the natural "day 3" feature.
2. **Grace token spending UI.** The `grace_tokens` table already exists and
   gets a token added at a 30-day streak — you just need a button that, on
   a missed day, backfills a `checkins` row for yesterday and decrements
   the balance.
3. **Weekly "Team MVP" badge.** Use `pg_cron` to run a query every Monday
   that finds last week's top scorer per team and inserts a badge.
4. **Badge display component.** Query `user_badges` joined with `badges`
   and render icons next to each teammate's name.
5. **Cheer/react on teammates' check-ins** — a small `checkin_reactions`
   table + realtime, same pattern as the leaderboard.

Each of these follows the same shape you've already seen twice: add a
table (+ RLS policy), optionally a trigger, then a component that reads
and/or writes it. That loop *is* the Supabase development model — once
it clicks, adding features becomes fast.
