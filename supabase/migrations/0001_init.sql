-- ============================================================
-- HABIT TRACKER — INITIAL SCHEMA
-- Run this in the Supabase SQL editor, or via `supabase db push`
-- ============================================================

-- ------------------------------------------------------------
-- 1. TEAMS
-- ------------------------------------------------------------
create table teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  invite_code text unique not null default substr(md5(random()::text), 1, 8),
  created_by uuid references auth.users not null,
  created_at timestamptz default now()
);

create table team_members (
  team_id uuid references teams(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  joined_at timestamptz default now(),
  primary key (team_id, user_id)
);

-- ------------------------------------------------------------
-- 2. HABITS
-- ------------------------------------------------------------
create table habits (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references teams(id) on delete cascade not null,
  created_by uuid references auth.users not null,
  title text not null,
  points_per_checkin int not null default 10,
  created_at timestamptz default now()
);

-- ------------------------------------------------------------
-- 3. CHECK-INS
-- The `unique` constraint is doing a lot of work: it makes a
-- "double check-in same day" impossible at the DATABASE level,
-- not just in your UI. Never trust the client alone.
-- ------------------------------------------------------------
create table checkins (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid references habits(id) on delete cascade not null,
  user_id uuid references auth.users not null,
  checkin_date date not null default current_date,
  points_awarded int not null default 0,
  created_at timestamptz default now(),
  unique (habit_id, user_id, checkin_date)
);

-- ------------------------------------------------------------
-- 4. GRACE TOKENS (streak freezes)
-- ------------------------------------------------------------
create table grace_tokens (
  user_id uuid references auth.users not null,
  habit_id uuid references habits(id) on delete cascade not null,
  balance int not null default 1,
  last_refilled date default current_date,
  primary key (user_id, habit_id)
);

-- ------------------------------------------------------------
-- 5. BADGES
-- ------------------------------------------------------------
create table badges (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  label text not null,
  icon text
);

insert into badges (code, label, icon) values
  ('streak_7',  '7-Day Streak',  '🔥'),
  ('streak_30', '30-Day Streak', '🏆'),
  ('streak_100','100-Day Streak','💎'),
  ('comeback',  'Comeback Kid',  '🔁');

create table user_badges (
  user_id uuid references auth.users not null,
  habit_id uuid references habits(id) on delete cascade not null,
  badge_id uuid references badges(id) not null,
  awarded_at timestamptz default now(),
  primary key (user_id, habit_id, badge_id)
);

-- ============================================================
-- STREAK CALCULATION
-- The "gaps and islands" trick: number each checkin row in
-- date order, subtract that row number (in days) from the
-- actual date. Consecutive dates all land on the SAME result,
-- because the date and the counter increase in lockstep.
-- That constant value becomes a "group id" for each unbroken run.
-- ============================================================
create or replace function get_current_streak(p_user_id uuid, p_habit_id uuid)
returns int
language sql
stable
as $$
  with dated as (
    select
      checkin_date,
      checkin_date - (row_number() over (order by checkin_date))::int as grp
    from checkins
    where user_id = p_user_id and habit_id = p_habit_id
  ),
  streaks as (
    select grp, count(*) as streak_len, max(checkin_date) as last_day
    from dated
    group by grp
  )
  select coalesce(
    (select streak_len from streaks
     where last_day >= current_date - 1   -- streak is "alive" if last checkin was today or yesterday
     order by last_day desc
     limit 1),
    0
  );
$$;

create or replace function get_longest_streak(p_user_id uuid, p_habit_id uuid)
returns int
language sql
stable
as $$
  with dated as (
    select
      checkin_date,
      checkin_date - (row_number() over (order by checkin_date))::int as grp
    from checkins
    where user_id = p_user_id and habit_id = p_habit_id
  )
  select coalesce(max(cnt), 0)
  from (select count(*) as cnt from dated group by grp) s;
$$;

-- ============================================================
-- POINTS + BADGES — awarded automatically on check-in
-- A trigger means this happens no matter HOW the row gets
-- inserted (your app, a script, the SQL editor) — you can't
-- forget to award points because you called the wrong function.
-- ============================================================
create or replace function handle_new_checkin()
returns trigger
language plpgsql
security definer
as $$
declare
  v_streak int;
  v_base_points int;
  v_multiplier numeric;
begin
  select points_per_checkin into v_base_points from habits where id = new.habit_id;

  v_streak := get_current_streak(new.user_id, new.habit_id);

  -- multiplier grows with streak length, capped at 3x
  v_multiplier := 1 + least(v_streak / 10.0, 2);

  new.points_awarded := round(v_base_points * v_multiplier);

  return new;
end;
$$;

create trigger trg_checkin_points
before insert on checkins
for each row execute function handle_new_checkin();

-- Badge awarding runs AFTER insert, since it needs the streak
-- to already reflect the row that was just added.
create or replace function handle_checkin_badges()
returns trigger
language plpgsql
security definer
as $$
declare
  v_streak int;
begin
  v_streak := get_current_streak(new.user_id, new.habit_id);

  if v_streak = 7 then
    insert into user_badges (user_id, habit_id, badge_id)
    select new.user_id, new.habit_id, id from badges where code = 'streak_7'
    on conflict do nothing;
  elsif v_streak = 30 then
    insert into user_badges (user_id, habit_id, badge_id)
    select new.user_id, new.habit_id, id from badges where code = 'streak_30'
    on conflict do nothing;
    -- bonus: 30-day streak also earns a grace token
    insert into grace_tokens (user_id, habit_id, balance)
    values (new.user_id, new.habit_id, 1)
    on conflict (user_id, habit_id) do update set balance = grace_tokens.balance + 1;
  elsif v_streak = 100 then
    insert into user_badges (user_id, habit_id, badge_id)
    select new.user_id, new.habit_id, id from badges where code = 'streak_100'
    on conflict do nothing;
  end if;

  return new;
end;
$$;

create trigger trg_checkin_badges
after insert on checkins
for each row execute function handle_checkin_badges();

-- ============================================================
-- LEADERBOARD VIEW
-- A view is just a saved query — it doesn't store data itself,
-- it re-runs live every time you select from it. That's exactly
-- what we want for a leaderboard: always current, no syncing.
-- ============================================================
create or replace view team_leaderboard as
select
  h.team_id,
  c.user_id,
  sum(c.points_awarded) as total_points,
  count(c.id) as total_checkins,
  max(c.checkin_date) as last_checkin
from checkins c
join habits h on h.id = c.habit_id
group by h.team_id, c.user_id;

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- This is the single most important Supabase concept: with RLS
-- ON, Postgres itself enforces "who can see/touch which rows,"
-- so your frontend can talk directly to the database without a
-- custom backend API, and still be safe.
-- ============================================================
alter table teams enable row level security;
alter table team_members enable row level security;
alter table habits enable row level security;
alter table checkins enable row level security;
alter table grace_tokens enable row level security;
alter table user_badges enable row level security;

-- Teams: only visible to members
create policy "members can view their team"
  on teams for select
  using (id in (select team_id from team_members where user_id = auth.uid()));

create policy "any authenticated user can create a team"
  on teams for insert
  with check (auth.uid() = created_by);

-- Team members: visible to other members of the same team
create policy "members can view teammates"
  on team_members for select
  using (team_id in (select team_id from team_members where user_id = auth.uid()));

create policy "users can join a team (insert their own row)"
  on team_members for insert
  with check (auth.uid() = user_id);

-- Habits: visible/editable only within your team
create policy "members can view team habits"
  on habits for select
  using (team_id in (select team_id from team_members where user_id = auth.uid()));

create policy "members can create habits for their team"
  on habits for insert
  with check (team_id in (select team_id from team_members where user_id = auth.uid()));

-- Checkins: you can see checkins for anyone on your team (needed
-- for the leaderboard), but you can only INSERT your own.
create policy "members can view team checkins"
  on checkins for select
  using (
    habit_id in (
      select h.id from habits h
      join team_members tm on tm.team_id = h.team_id
      where tm.user_id = auth.uid()
    )
  );

create policy "users can only check themselves in"
  on checkins for insert
  with check (auth.uid() = user_id);

-- Grace tokens / badges: users manage their own
create policy "users view own grace tokens"
  on grace_tokens for select using (auth.uid() = user_id);

create policy "users view own badges"
  on user_badges for select using (auth.uid() = user_id);

create policy "teammates view each other's badges"
  on user_badges for select
  using (
    habit_id in (
      select h.id from habits h
      join team_members tm on tm.team_id = h.team_id
      where tm.user_id = auth.uid()
    )
  );
