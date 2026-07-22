-- Dozr Ops — TEMPORARY open access, no staff auth for now.
-- afzl's call (2026-07-22): skip sign-in for this pass, come back to it
-- later. Without this, RLS from 0001_init.sql blocks everything because
-- is_staff() requires auth.uid() to match a row in staff_profiles, and
-- nobody is signed in. These policies let the anon key read/write directly
-- so Add Vendor / Add Equipment / mark-quoted work without a login screen.
--
-- ⚠ Remove these policies (or add real sign-in back) before this app is
-- exposed anywhere semi-public — right now anyone with the anon key (which
-- is public in ops/js/supabase-client.js) has full read/write on every
-- table. Fine for an internal, unlisted URL during build; not fine for a
-- real launch.

create policy "temp anon full access - vendors" on vendors
  for all using (true) with check (true);

create policy "temp anon full access - equipment" on equipment
  for all using (true) with check (true);

create policy "temp anon full access - rfqs" on rfqs
  for all using (true) with check (true);

create policy "temp anon full access - rfq_vendor_quotes" on rfq_vendor_quotes
  for all using (true) with check (true);

create policy "temp anon full access - jobs" on jobs
  for all using (true) with check (true);

create policy "temp anon full access - invoices" on invoices
  for all using (true) with check (true);

create policy "temp anon full access - escalations" on escalations
  for all using (true) with check (true);
