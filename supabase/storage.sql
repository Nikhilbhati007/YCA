-- ==============================================================================
-- YCA PACE - Supabase Storage Setup for Pace Foundation Bowling Videos
-- Run this in your Supabase SQL Editor (SQL Editor -> New Query)
-- ==============================================================================

-- 1. Create or update the 'bowling-videos' public storage bucket
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'bowling-videos',
  'bowling-videos',
  true,
  104857600, -- 100 MB max video file size
  array['video/mp4', 'video/webm', 'video/quicktime', 'video/x-m4v', 'video/ogg']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 104857600,
  allowed_mime_types = array['video/mp4', 'video/webm', 'video/quicktime', 'video/x-m4v', 'video/ogg'];

-- 2. Storage RLS Policies for 'bowling-videos'

-- Allow public viewing/streaming of bowling analysis videos
drop policy if exists "Allow public read of bowling videos" on storage.objects;
create policy "Allow public read of bowling videos" on storage.objects
  for select using (bucket_id = 'bowling-videos');

-- Allow coaches & academy staff to upload bowling videos
drop policy if exists "Allow upload of bowling videos" on storage.objects;
create policy "Allow upload of bowling videos" on storage.objects
  for insert with check (bucket_id = 'bowling-videos');

-- Allow update of bowling videos
drop policy if exists "Allow update of bowling videos" on storage.objects;
create policy "Allow update of bowling videos" on storage.objects
  for update using (bucket_id = 'bowling-videos');

-- Allow deletion of bowling videos
drop policy if exists "Allow delete of bowling videos" on storage.objects;
create policy "Allow delete of bowling videos" on storage.objects
  for delete using (bucket_id = 'bowling-videos');
