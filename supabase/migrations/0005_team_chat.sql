-- ============================================================
-- 7. TEAM CHAT
-- ============================================================
create table team_chat (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references teams(id) on delete cascade not null,
  user_id uuid references auth.users not null,
  message text not null,
  created_at timestamptz default now()
);

create index idx_team_chat_team_time on team_chat(team_id, created_at desc);

alter table team_chat enable row level security;

create policy "members can read team chat"
  on team_chat for select
  using (public.is_team_member(team_id));

create policy "members can post to team chat"
  on team_chat for insert
  with check (
    auth.uid() = user_id
    and public.is_team_member(team_id)
  );

-- Enable realtime for team chat (required for live updates)
alter publication supabase_realtime add table team_chat;

