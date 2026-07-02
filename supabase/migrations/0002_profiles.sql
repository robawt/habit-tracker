-- ============================================================
-- PROFILES TABLE
-- Syncs with auth.users so every user gets a profile row
-- automatically on signup via a Supabase trigger.
-- ============================================================

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  updated_at timestamptz default now()
);

alter table profiles enable row level security;

-- Users can view any profile (needed for leaderboard display)
create policy "profiles are publicly viewable"
  on profiles for select
  using (true);

-- Users can only update their own profile
create policy "users can update own profile"
  on profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Users can insert their own profile row
create policy "users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

-- Auto-create a profile row when a new user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
