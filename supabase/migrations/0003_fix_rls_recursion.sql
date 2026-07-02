-- ============================================================
-- FIX: INFINITE RECURSION IN RLS POLICIES
-- The original "members can view teammates" policy on
-- team_members queried team_members itself, creating a
-- self-referential loop that PostgreSQL detected and refused.
--
-- Fix: Create a security definer function that checks team
-- membership WITHOUT triggering RLS (it runs as the owner),
-- then rewrite all policies to use this function instead of
-- raw subqueries on team_members.
-- ============================================================

-- -----------------------------------------------------------
-- 1. SECURITY DEFINER HELPER
--    Bypasses RLS so the subquery on team_members doesn't
--    trigger the very policy we're trying to enforce.
-- -----------------------------------------------------------
create or replace function public.is_team_member(team_id uuid)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1 from public.team_members
    where team_id = $1 and user_id = auth.uid()
  );
$$;

-- -----------------------------------------------------------
-- 2. REWRITE AFFECTED POLICIES
-- -----------------------------------------------------------

-- TEAMS
drop policy if exists "members can view their team" on teams;
create policy "members can view their team"
  on teams for select
  using (public.is_team_member(id));

-- TEAM MEMBERS (the main culprit)
drop policy if exists "members can view teammates" on team_members;
create policy "members can view teammates"
  on team_members for select
  using (public.is_team_member(team_id));

-- HABITS
drop policy if exists "members can view team habits" on habits;
create policy "members can view team habits"
  on habits for select
  using (public.is_team_member(team_id));

drop policy if exists "members can create habits for their team" on habits;
create policy "members can create habits for their team"
  on habits for insert
  with check (public.is_team_member(team_id));

-- CHECKINS (was joining team_members directly)
drop policy if exists "members can view team checkins" on checkins;
create policy "members can view team checkins"
  on checkins for select
  using (
    habit_id in (
      select h.id from habits h
      where public.is_team_member(h.team_id)
    )
  );

-- USER_BADGES (was joining team_members directly)
drop policy if exists "teammates view each other's badges" on user_badges;
create policy "teammates view each other's badges"
  on user_badges for select
  using (
    habit_id in (
      select h.id from habits h
      where public.is_team_member(h.team_id)
    )
  );
