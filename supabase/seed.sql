-- ==============================================================================
-- YCA PACE - Seed Data Script
-- Run this in your Supabase SQL Editor after running schema.sql
-- ==============================================================================

-- 1. Insert Academy Batches
insert into public.batches (id, name, session_time, time_slot)
values
  ('b1000000-0000-0000-0000-000000000000', 'U12', 'Morning', '6:30 – 8:30 AM'),
  ('b1000000-0000-0000-0000-000000000001', 'U14', 'Morning', '6:30 – 9:30 AM'),
  ('b1000000-0000-0000-0000-000000000002', 'U16', 'Morning', '6:30 – 9:30 AM'),
  ('b1000000-0000-0000-0000-000000000003', 'U19', 'Evening', '4:30 – 7:00 PM'),
  ('b1000000-0000-0000-0000-000000000004', 'Open', 'Under lights', '7:00 – 9:30 PM')
on conflict (id) do nothing;

-- 2. Insert Real Academy Players (from players.csv, 31 players)
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

