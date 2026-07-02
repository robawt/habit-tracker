-- ============================================================
-- FIX: TEAMS SELECT POLICY BLOCKING INSERT ... SELECT FLOW
-- The original SELECT policy required team membership (via
-- is_team_member), which broke two flows:
--
--   1. CREATE: After INSERT, .select() fails because the
--      creator isn't in team_members yet.
--   2. JOIN: Looking up a team by invite_code fails because
--      the user isn't a member yet.
--
-- Fix: Allow any authenticated user to view team rows. The
-- teams table only contains id, name, and invite_code — none
-- of which are sensitive (invite codes are shared publicly).
-- Security for team-scoped data (habits, checkins) is enforced
-- by the individual table policies.
-- ============================================================

drop policy if exists "members can view their team" on teams;

create policy "teams are viewable by authenticated users"
  on teams for select
  using (auth.role() = 'authenticated');
