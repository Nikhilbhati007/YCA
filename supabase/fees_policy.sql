-- ==============================================================================
-- YCA PACE - Fees Table RLS Policy Migration
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/tbrcfjagvtnsnzooevop/sql/new
-- ==============================================================================

-- 1. Ensure RLS is enabled on fees table
alter table public.fees enable row level security;

-- 2. Allow read of fees
drop policy if exists "Allow read of fees" on public.fees;
create policy "Allow read of fees" on public.fees for select using (true);

-- 3. Allow insert of fees (needed for recording payments and receipts)
drop policy if exists "Allow insert of fees" on public.fees;
create policy "Allow insert of fees" on public.fees for insert with check (true);

-- 4. Allow update of fees (needed for updating payment status to 'paid')
drop policy if exists "Allow update of fees" on public.fees;
create policy "Allow update of fees" on public.fees for update using (true);

-- 5. Allow delete of fees
drop policy if exists "Allow delete of fees" on public.fees;
create policy "Allow delete of fees" on public.fees for delete using (true);
