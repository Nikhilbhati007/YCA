-- ==============================================================================
-- YCA PACE - Complete Setup Script (Schema + Storage + Seed)
-- Run this ONCE in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/xhvyhxkufctsmzxssmqa/sql/new
-- ==============================================================================

-- PART 1: CORE TABLES
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
  name text not null,
  session_time text not null,
  time_slot text not null,
  head_coach_id uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Players
create table if not exists public.players (
  id uuid default gen_random_uuid() primary key,
  player_code text unique not null,
  full_name text not null,
  dob date not null,
  gender text not null check (gender in ('Boy', 'Girl')),
  batch_id uuid references public.batches(id) on delete set null,
  parent_id uuid references public.profiles(id) on delete set null,
  primary_role text not null default 'All-rounder',
  bowling_style text,
  batting_style text,
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
  month_year text not null,
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
  match_level text not null default 'Academy',
  batting_score text,
  bowling_figures text,
  coach_notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Pace Foundation Video Skill Analyses
create table if not exists public.video_analyses (
  id uuid default gen_random_uuid() primary key,
  player_id uuid references public.players(id) on delete cascade not null,
  coach_id uuid references public.profiles(id),
  video_url text not null,
  thumbnail_url text,
  skill_category text not null,
  measured_speed_kmph numeric(5, 1),
  coach_feedback text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. Announcements & Notices
create table if not exists public.announcements (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  body text not null,
  category text not null default 'General',
  batch_id uuid references public.batches(id),
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

-- PART 2: ROW-LEVEL SECURITY (RLS) POLICIES
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

-- Policies for Batches & Announcements
drop policy if exists "Allow public read of batches" on public.batches;
create policy "Allow public read of batches" on public.batches for select using (true);

drop policy if exists "Allow public read of announcements" on public.announcements;
create policy "Allow public read of announcements" on public.announcements for select using (true);

drop policy if exists "Allow public insert of announcements" on public.announcements;
create policy "Allow public insert of announcements" on public.announcements for insert with check (true);

-- Policies for Enquiries
drop policy if exists "Allow public insert of enquiries" on public.enquiries;
create policy "Allow public insert of enquiries" on public.enquiries for insert with check (true);

drop policy if exists "Allow read of enquiries" on public.enquiries;
create policy "Allow read of enquiries" on public.enquiries for select using (true);

drop policy if exists "Allow update of enquiries" on public.enquiries;
create policy "Allow update of enquiries" on public.enquiries for update using (true);

-- Policies for Players
drop policy if exists "Allow read of players" on public.players;
create policy "Allow read of players" on public.players for select using (true);

drop policy if exists "Allow insert of players" on public.players;
create policy "Allow insert of players" on public.players for insert with check (true);

drop policy if exists "Allow update of players" on public.players;
create policy "Allow update of players" on public.players for update using (true);

-- Policies for Attendance
drop policy if exists "Allow read of attendance" on public.attendance;
create policy "Allow read of attendance" on public.attendance for select using (true);

drop policy if exists "Allow insert of attendance" on public.attendance;
create policy "Allow insert of attendance" on public.attendance for insert with check (true);

drop policy if exists "Allow update of attendance" on public.attendance;
create policy "Allow update of attendance" on public.attendance for update using (true);

-- Policies for Fees
drop policy if exists "Allow read of fees" on public.fees;
create policy "Allow read of fees" on public.fees for select using (true);

drop policy if exists "Allow insert of fees" on public.fees;
create policy "Allow insert of fees" on public.fees for insert with check (true);

drop policy if exists "Allow update of fees" on public.fees;
create policy "Allow update of fees" on public.fees for update using (true);

drop policy if exists "Allow delete of fees" on public.fees;
create policy "Allow delete of fees" on public.fees for delete using (true);

-- Policies for Match Performances & Video Analyses
drop policy if exists "Allow read of match_performances" on public.match_performances;
create policy "Allow read of match_performances" on public.match_performances for select using (true);

drop policy if exists "Allow insert of match_performances" on public.match_performances;
create policy "Allow insert of match_performances" on public.match_performances for insert with check (true);

drop policy if exists "Allow read of video_analyses" on public.video_analyses;
create policy "Allow read of video_analyses" on public.video_analyses for select using (true);

drop policy if exists "Allow insert of video_analyses" on public.video_analyses;
create policy "Allow insert of video_analyses" on public.video_analyses for insert with check (true);

-- Policies for Profiles
drop policy if exists "Allow read of profiles" on public.profiles;
create policy "Allow read of profiles" on public.profiles for select using (true);

drop policy if exists "Allow update own profile" on public.profiles;
create policy "Allow update own profile" on public.profiles for update using (auth.uid() = id);

-- Profile Sync Trigger
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

-- PART 3: STORAGE BUCKET FOR PACE FOUNDATION BOWLING VIDEOS
-- ==============================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'bowling-videos',
  'bowling-videos',
  true,
  104857600,
  array['video/mp4', 'video/webm', 'video/quicktime', 'video/x-m4v', 'video/ogg']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 104857600,
  allowed_mime_types = array['video/mp4', 'video/webm', 'video/quicktime', 'video/x-m4v', 'video/ogg'];

drop policy if exists "Allow public read of bowling videos" on storage.objects;
create policy "Allow public read of bowling videos" on storage.objects
  for select using (bucket_id = 'bowling-videos');

drop policy if exists "Allow upload of bowling videos" on storage.objects;
create policy "Allow upload of bowling videos" on storage.objects
  for insert with check (bucket_id = 'bowling-videos');

drop policy if exists "Allow update of bowling videos" on storage.objects;
create policy "Allow update of bowling videos" on storage.objects
  for update using (bucket_id = 'bowling-videos');

drop policy if exists "Allow delete of bowling videos" on storage.objects;
create policy "Allow delete of bowling videos" on storage.objects
  for delete using (bucket_id = 'bowling-videos');

-- PART 4: REAL ACADEMY SEED DATA (BATCHES, 31 PLAYERS & NOVEMBER FEES)
-- ==============================================================================

-- 1. Batches
insert into public.batches (id, name, session_time, time_slot)
values
  ('b1000000-0000-0000-0000-000000000000', 'U12', 'Morning', '6:30 – 8:30 AM'),
  ('b1000000-0000-0000-0000-000000000001', 'U14', 'Morning', '6:30 – 9:30 AM'),
  ('b1000000-0000-0000-0000-000000000002', 'U16', 'Morning', '6:30 – 9:30 AM'),
  ('b1000000-0000-0000-0000-000000000003', 'U19', 'Evening', '4:30 – 7:00 PM'),
  ('b1000000-0000-0000-0000-000000000004', 'Open', 'Under lights', '7:00 – 9:30 PM')
on conflict (id) do nothing;

-- 2. 31 Enrolled Academy Players
insert into public.players (id, player_code, full_name, dob, gender, batch_id, primary_role, bowling_style, batting_style, status)
values
  ('a1000000-0000-0000-0000-000000000001', 'YCA-0041', 'Aman Alam', '2013-11-29', 'Boy', 'b1000000-0000-0000-0000-000000000001', 'Fast Bowler', 'Right-arm Fast Medium', 'Right-hand bat', 'active'),
  ('a1000000-0000-0000-0000-000000000002', 'YCA-0042', 'Nayan Chaudhari', '2013-05-25', 'Boy', 'b1000000-0000-0000-0000-000000000002', 'Batsman', 'Right-arm Medium', 'Right-hand bat', 'active'),
  ('a1000000-0000-0000-0000-000000000003', 'YCA-0043', 'Arpit K. Kamble', '2016-08-22', 'Boy', 'b1000000-0000-0000-0000-000000000001', 'All-rounder', 'Right-arm Off-break', 'Right-hand bat', 'active'),
  ('a1000000-0000-0000-0000-000000000004', 'YCA-0044', 'Pushkar Gadge', '2009-05-05', 'Boy', 'b1000000-0000-0000-0000-000000000003', 'Fast Bowler', 'Left-arm Fast', 'Left-hand bat', 'active'),
  ('a1000000-0000-0000-0000-000000000005', 'YCA-0045', 'Harshit Watkar', '2013-12-20', 'Boy', 'b1000000-0000-0000-0000-000000000001', 'Fast Bowler', 'Right-arm Fast', 'Right-hand bat', 'active'),
  ('a1000000-0000-0000-0000-000000000006', 'YCA-0046', 'Virat Gulabe', '2015-07-27', 'Boy', 'b1000000-0000-0000-0000-000000000001', 'Batsman', 'Right-arm Medium', 'Right-hand bat', 'active'),
  ('a1000000-0000-0000-0000-000000000007', 'YCA-0047', 'Jaitra Shrikant Tiwari', '2014-08-09', 'Boy', 'b1000000-0000-0000-0000-000000000001', 'Spinner', 'Slow Left-arm Orthodox', 'Right-hand bat', 'active'),
  ('a1000000-0000-0000-0000-000000000008', 'YCA-0048', 'Shiv Irpate', '2013-11-13', 'Boy', 'b1000000-0000-0000-0000-000000000001', 'Fast Bowler', 'Right-arm Fast', 'Right-hand bat', 'active'),
  ('a1000000-0000-0000-0000-000000000009', 'YCA-0049', 'Mithilesh Anil Hajare', '2013-02-25', 'Boy', 'b1000000-0000-0000-0000-000000000001', 'All-rounder', 'Right-arm Off-break', 'Right-hand bat', 'active'),
  ('a1000000-0000-0000-0000-000000000010', 'YCA-0050', 'Nirmal Sontakke', '2008-10-09', 'Boy', 'b1000000-0000-0000-0000-000000000003', 'Fast Bowler', 'Right-arm Fast', 'Right-hand bat', 'active'),
  ('a1000000-0000-0000-0000-000000000011', 'YCA-0051', 'Atharv Falke', '2010-11-13', 'Boy', 'b1000000-0000-0000-0000-000000000003', 'Batsman', 'Right-arm Medium', 'Right-hand bat', 'active'),
  ('a1000000-0000-0000-0000-000000000012', 'YCA-0052', 'Adnan Mahajan', '2012-10-05', 'Boy', 'b1000000-0000-0000-0000-000000000002', 'Wicketkeeper', null, 'Right-hand bat', 'active'),
  ('a1000000-0000-0000-0000-000000000013', 'YCA-0053', 'Sanskar Londhe', '2013-07-20', 'Boy', 'b1000000-0000-0000-0000-000000000001', 'Fast Bowler', 'Right-arm Fast Medium', 'Right-hand bat', 'active'),
  ('a1000000-0000-0000-0000-000000000014', 'YCA-0054', 'Swanand Khawale', '2015-08-07', 'Boy', 'b1000000-0000-0000-0000-000000000001', 'All-rounder', 'Right-arm Medium', 'Right-hand bat', 'active'),
  ('a1000000-0000-0000-0000-000000000015', 'YCA-0055', 'Gaarvi Bhaisar', '2018-02-14', 'Girl', 'b1000000-0000-0000-0000-000000000000', 'All-rounder', 'Right-arm Leg-break', 'Right-hand bat', 'active'),
  ('a1000000-0000-0000-0000-000000000016', 'YCA-0056', 'Dev Tiwari', '2014-08-09', 'Boy', 'b1000000-0000-0000-0000-000000000002', 'All-rounder', 'Right-arm Medium', 'Right-hand bat', 'active'),
  ('a1000000-0000-0000-0000-000000000017', 'YCA-0057', 'Ojasya Chouriwar', '2014-03-07', 'Boy', 'b1000000-0000-0000-0000-000000000001', 'Batsman', 'Right-arm Off-break', 'Right-hand bat', 'active'),
  ('a1000000-0000-0000-0000-000000000018', 'YCA-0058', 'Gaurang Thawali', '2017-04-21', 'Boy', 'b1000000-0000-0000-0000-000000000000', 'All-rounder', 'Right-arm Medium', 'Right-hand bat', 'active'),
  ('a1000000-0000-0000-0000-000000000019', 'YCA-0059', 'Naksh Atkar', '2013-06-20', 'Boy', 'b1000000-0000-0000-0000-000000000002', 'Fast Bowler', 'Right-arm Fast', 'Right-hand bat', 'active'),
  ('a1000000-0000-0000-0000-000000000020', 'YCA-0060', 'Ajinkya Funde', '2014-02-27', 'Boy', 'b1000000-0000-0000-0000-000000000002', 'Batsman', 'Right-arm Medium', 'Right-hand bat', 'active'),
  ('a1000000-0000-0000-0000-000000000021', 'YCA-0061', 'Nachiket Dangare', '2010-07-21', 'Boy', 'b1000000-0000-0000-0000-000000000003', 'Fast Bowler', 'Right-arm Fast Medium', 'Right-hand bat', 'active'),
  ('a1000000-0000-0000-0000-000000000022', 'YCA-0062', 'Shourya Thakre', '2010-01-07', 'Boy', 'b1000000-0000-0000-0000-000000000003', 'All-rounder', 'Slow Left-arm Orthodox', 'Left-hand bat', 'active'),
  ('a1000000-0000-0000-0000-000000000023', 'YCA-0063', 'Harshit Singh', '2012-04-24', 'Boy', 'b1000000-0000-0000-0000-000000000002', 'Fast Bowler', 'Right-arm Fast', 'Right-hand bat', 'active'),
  ('a1000000-0000-0000-0000-000000000024', 'YCA-0064', 'Tejas Singh', '2015-11-12', 'Boy', 'b1000000-0000-0000-0000-000000000001', 'Batsman', 'Right-arm Medium', 'Right-hand bat', 'active'),
  ('a1000000-0000-0000-0000-000000000025', 'YCA-0065', 'Aarav Tandekar', '2012-08-31', 'Boy', 'b1000000-0000-0000-0000-000000000002', 'Wicketkeeper', null, 'Right-hand bat', 'active'),
  ('a1000000-0000-0000-0000-000000000026', 'YCA-0066', 'Anav Ghaiwat', '2015-10-06', 'Boy', 'b1000000-0000-0000-0000-000000000000', 'All-rounder', 'Right-arm Off-break', 'Right-hand bat', 'active'),
  ('a1000000-0000-0000-0000-000000000027', 'YCA-0067', 'Kamesh Mahalle', '2010-08-06', 'Boy', 'b1000000-0000-0000-0000-000000000003', 'Fast Bowler', 'Right-arm Fast', 'Right-hand bat', 'active'),
  ('a1000000-0000-0000-0000-000000000028', 'YCA-0068', 'Aditya Jaiswal', '2013-04-23', 'Boy', 'b1000000-0000-0000-0000-000000000002', 'All-rounder', 'Right-arm Medium', 'Right-hand bat', 'active'),
  ('a1000000-0000-0000-0000-000000000029', 'YCA-0069', 'Akshay Musare', '2012-11-25', 'Boy', 'b1000000-0000-0000-0000-000000000002', 'Spinner', 'Slow Left-arm Orthodox', 'Right-hand bat', 'active'),
  ('a1000000-0000-0000-0000-000000000030', 'YCA-0070', 'Divesh Borkar', '2014-03-03', 'Boy', 'b1000000-0000-0000-0000-000000000001', 'Fast Bowler', 'Right-arm Fast Medium', 'Right-hand bat', 'active'),
  ('a1000000-0000-0000-0000-000000000031', 'YCA-0071', 'Arnav Tiwari', '2011-08-14', 'Boy', 'b1000000-0000-0000-0000-000000000003', 'Batsman', 'Right-arm Medium', 'Right-hand bat', 'active')
on conflict (id) do nothing;

-- 3. Initial November 2026 Fee Dues for Enrolled Players (Rs. 2,500 due 5th Nov)
insert into public.fees (player_id, month_year, amount, due_date, status)
select id, 'November 2026', 2500.00, '2026-11-05', 'pending'
from public.players
on conflict do nothing;
