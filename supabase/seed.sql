-- ==============================================================================
-- YCA PACE - Seed Data Script
-- Run this in your Supabase SQL Editor after running schema.sql
-- ==============================================================================

-- 1. Insert Academy Batches
insert into public.batches (id, name, session_time, time_slot)
values
  ('b1000000-0000-0000-0000-000000000001', 'U14', 'Morning', '6:30 – 9:30 AM'),
  ('b1000000-0000-0000-0000-000000000002', 'U16', 'Morning', '6:30 – 9:30 AM'),
  ('b1000000-0000-0000-0000-000000000003', 'U19', 'Evening', '4:30 – 7:00 PM'),
  ('b1000000-0000-0000-0000-000000000004', 'Open', 'Under lights', '7:00 – 9:30 PM')
on conflict (id) do nothing;

-- 2. Insert Sample Players
insert into public.players (id, player_code, full_name, dob, gender, batch_id, primary_role, bowling_style, batting_style, status)
values
  ('a1000000-0000-0000-0000-000000000001', 'YCA-0042', 'Aarav Sharma', '2013-05-14', 'Boy', 'b1000000-0000-0000-0000-000000000001', 'Fast Bowler', 'Right-arm Fast Medium', 'Right-hand bat', 'active'),
  ('a1000000-0000-0000-0000-000000000002', 'YCA-0043', 'Riya Patil', '2013-08-22', 'Girl', 'b1000000-0000-0000-0000-000000000001', 'All-rounder', 'Right-arm Off-break', 'Right-hand bat', 'active'),
  ('a1000000-0000-0000-0000-000000000003', 'YCA-0044', 'Kabir Deshmukh', '2011-02-18', 'Boy', 'b1000000-0000-0000-0000-000000000002', 'Batsman', null, 'Left-hand bat', 'active'),
  ('a1000000-0000-0000-0000-000000000004', 'YCA-0045', 'Ishaan Meshram', '2008-11-09', 'Boy', 'b1000000-0000-0000-0000-000000000003', 'Fast Bowler', 'Left-arm Fast', 'Left-hand bat', 'active'),
  ('a1000000-0000-0000-0000-000000000005', 'YCA-0046', 'Sara Khan', '2012-04-30', 'Girl', 'b1000000-0000-0000-0000-000000000001', 'Wicketkeeper', null, 'Right-hand bat', 'active'),
  ('a1000000-0000-0000-0000-000000000006', 'YCA-0047', 'Vihaan Rathod', '2013-09-04', 'Boy', 'b1000000-0000-0000-0000-000000000001', 'Fast Bowler', 'Right-arm Fast', 'Right-hand bat', 'active')
on conflict (id) do nothing;

-- 3. Insert Initial Announcements
insert into public.announcements (title, body, category)
values
  ('Diwali Practice Break & Special Camp', 'Regular net sessions will remain closed from 20 to 23 October. Special morning fast-bowling camp opens on 24 October.', 'Holiday'),
  ('U14 Match vs Vidarbha Colts', 'U14 squad to report at Hingna ground in white uniforms by 6:15 AM sharp this Sunday for the 40-over fixture.', 'Match Day'),
  ('Turf Pitch Rolling Schedule', 'Center turf pitches 1 & 2 under light rolling on Thursday. Net sessions will use cemented nets and side turf 3.', 'Schedule')
on conflict do nothing;

-- 4. Insert Initial Website Enquiries
insert into public.enquiries (player_name, age, contact_phone, preferred_batch, status, notes)
values
  ('Dhruv Ingle', 12, '+91 98223 99881', 'U14', 'trial_booked', 'Trial booked for Saturday 6:30 AM with coach Jay Singh.'),
  ('Tanmay Bawankar', 15, '+91 97650 11223', 'U16', 'new', 'Inquired about night floodlight sessions.'),
  ('Ananya Joshi', 11, '+91 94228 33445', 'U14', 'contacted', 'Spoke to father. Interested in girls summer batch.')
on conflict do nothing;
