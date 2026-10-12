-- ==============================================================================
-- YCA PACE - Database Schema & Row-Level Security (PostgreSQL / Supabase)
-- ==============================================================================

-- 1. Profiles (linked to auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique,
  phone text,
  full_name text not null,
  role text not null check (role in ('admin', 'coach', 'parent')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Batches
create table if not exists public.batches (
  id uuid default gen_random_uuid() primary key,
  name text not null, -- e.g. 'U14', 'U16', 'U19', 'U23', 'Open'
  session_time text not null, -- e.g. 'Morning', 'Evening', 'Under lights'
  time_slot text not null, -- e.g. '6:30 – 9:30 AM'
  head_coach_id uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Players
create table if not exists public.players (
  id uuid default gen_random_uuid() primary key,
  player_code text unique not null, -- e.g. 'YCA-0042'
  full_name text not null,
  dob date not null,
  gender text not null check (gender in ('Boy', 'Girl')),
  batch_id uuid references public.batches(id) on delete set null,
  parent_id uuid references public.profiles(id) on delete set null,
  primary_role text not null default 'All-rounder', -- 'Fast Bowler', 'Batsman', 'Spinner', 'Wicketkeeper'
  bowling_style text, -- 'Right-arm Fast', 'Left-arm Seam'
  batting_style text, -- 'Right-hand bat', 'Left-hand bat'
  status text not null default 'active' check (status in ('active', 'inactive', 'injured')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Attendance
create table if not exists public.attendance (
  id uuid default gen_random_uuid() primary key,
  player_id uuid references public.players(id) on delete cascade not null,
  batch_id uuid references public.batches(id) on delete cascade not null,
  date date not null,
  status text not null check (status in ('present', 'absent', 'late', 'excused')),
  marked_by uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(player_id, date)
);

-- 5. Fees
create table if not exists public.fees (
  id uuid default gen_random_uuid() primary key,
  player_id uuid references public.players(id) on delete cascade not null,
  month_year text not null, -- 'October 2026'
  amount numeric(10, 2) not null default 2500.00,
  due_date date not null,
  status text not null default 'pending' check (status in ('paid', 'pending', 'overdue')),
  payment_mode text check (payment_mode in ('UPI', 'Cash', 'Card', 'Bank Transfer')),
  transaction_ref text,
  paid_at timestamp with time zone,
  receipt_no text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Match Performances
create table if not exists public.match_performances (
  id uuid default gen_random_uuid() primary key,
  player_id uuid references public.players(id) on delete cascade not null,
  match_date date not null,
  opponent text not null,
  match_level text not null default 'Academy', -- 'Academy', 'Inter-Academy', 'District', 'State'
  batting_score text, -- '34 (28)'
  bowling_figures text, -- '2/21 (4.0)'
  coach_notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Pace Foundation Video Skill Analyses
create table if not exists public.video_analyses (
  id uuid default gen_random_uuid() primary key,
  player_id uuid references public.players(id) on delete cascade not null,
  coach_id uuid references public.profiles(id) not null,
  video_url text not null,
  thumbnail_url text,
  skill_category text not null, -- 'Run-up', 'Release Point', 'Seam & Wrist', 'Follow-through'
  measured_speed_kmph numeric(5, 1),
  coach_feedback text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. Announcements & Notices
create table if not exists public.announcements (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  body text not null,
  category text not null default 'General', -- 'Match', 'Holiday', 'Schedule', 'Camp'
  batch_id uuid references public.batches(id), -- null means academy-wide
  posted_by uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. Trial Enquiries (Public Lead Capture)
create table if not exists public.enquiries (
  id uuid default gen_random_uuid() primary key,
  player_name text not null,
  age integer not null,
  contact_phone text not null,
  preferred_batch text not null,
  status text not null default 'new' check (status in ('new', 'contacted', 'trial_booked', 'enrolled', 'archived')),
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- ROW-LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
alter table public.profiles enable row level security;
alter table public.batches enable row level security;
alter table public.players enable row level security;
alter table public.attendance enable row level security;
alter table public.fees enable row level security;
alter table public.match_performances enable row level security;
alter table public.video_analyses enable row level security;
alter table public.announcements enable row level security;
alter table public.enquiries enable row level security;

-- 1. Batches & Announcements (Public Read)
drop policy if exists "Allow public read of batches" on public.batches;
create policy "Allow public read of batches" on public.batches for select using (true);

drop policy if exists "Allow public read of announcements" on public.announcements;
create policy "Allow public read of announcements" on public.announcements for select using (true);

drop policy if exists "Allow public insert of announcements" on public.announcements;
create policy "Allow public insert of announcements" on public.announcements for insert with check (true);

-- 2. Enquiries (Lead Capture & Admin CRM)
drop policy if exists "Allow public insert of enquiries" on public.enquiries;
create policy "Allow public insert of enquiries" on public.enquiries for insert with check (true);

drop policy if exists "Allow read of enquiries" on public.enquiries;
create policy "Allow read of enquiries" on public.enquiries for select using (true);

drop policy if exists "Allow update of enquiries" on public.enquiries;
create policy "Allow update of enquiries" on public.enquiries for update using (true);

-- 3. Players
drop policy if exists "Allow read of players" on public.players;
create policy "Allow read of players" on public.players for select using (true);

drop policy if exists "Allow insert of players" on public.players;
create policy "Allow insert of players" on public.players for insert with check (true);

drop policy if exists "Allow update of players" on public.players;
create policy "Allow update of players" on public.players for update using (true);

-- 4. Attendance
drop policy if exists "Allow read of attendance" on public.attendance;
create policy "Allow read of attendance" on public.attendance for select using (true);

drop policy if exists "Allow insert of attendance" on public.attendance;
create policy "Allow insert of attendance" on public.attendance for insert with check (true);

drop policy if exists "Allow update of attendance" on public.attendance;
create policy "Allow update of attendance" on public.attendance for update using (true);

-- 5. Fees
drop policy if exists "Allow read of fees" on public.fees;
create policy "Allow read of fees" on public.fees for select using (true);

drop policy if exists "Allow insert of fees" on public.fees;
create policy "Allow insert of fees" on public.fees for insert with check (true);

drop policy if exists "Allow update of fees" on public.fees;
create policy "Allow update of fees" on public.fees for update using (true);

drop policy if exists "Allow delete of fees" on public.fees;
create policy "Allow delete of fees" on public.fees for delete using (true);

-- 6. Match Performances & Video Analyses
drop policy if exists "Allow read of match_performances" on public.match_performances;
create policy "Allow read of match_performances" on public.match_performances for select using (true);

drop policy if exists "Allow insert of match_performances" on public.match_performances;
create policy "Allow insert of match_performances" on public.match_performances for insert with check (true);

drop policy if exists "Allow read of video_analyses" on public.video_analyses;
create policy "Allow read of video_analyses" on public.video_analyses for select using (true);

drop policy if exists "Allow insert of video_analyses" on public.video_analyses;
create policy "Allow insert of video_analyses" on public.video_analyses for insert with check (true);

-- 7. Profiles (Self & Public Read)
drop policy if exists "Allow read of profiles" on public.profiles;
create policy "Allow read of profiles" on public.profiles for select using (true);

drop policy if exists "Allow update own profile" on public.profiles;
create policy "Allow update own profile" on public.profiles for update using (auth.uid() = id);

-- 8. Automated Profile Sync on Supabase Auth Signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'parent')
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, public.profiles.full_name);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

