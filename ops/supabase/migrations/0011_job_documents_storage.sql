-- Job documents storage bucket
-- Run this in the Supabase SQL Editor (Project → SQL Editor → New query).
--
-- Replaces the old label+ref-only text list on job-detail.html with real
-- file upload/view for the 4 standard doc types (Quote, PO, Invoice, ePOD)
-- (afzl's ask, 2026-07-23: "act as a expert... document management").
--
-- Public bucket, open read/write policies - matches the existing
-- temp-open-access posture already in place for every table
-- (0003_temp_open_access.sql). Not real security yet - same documented
-- risk, revisit together before any semi-public exposure.
--
-- No table changes needed: jobs.documents (jsonb, default '[]') already
-- exists from 0001_init.sql - this migration only adds where the files
-- referenced by that column's {label, ref, path, url, uploadedAt} entries
-- actually live.

insert into storage.buckets (id, name, public)
values ('job-documents', 'job-documents', true)
on conflict (id) do nothing;

drop policy if exists "public read job-documents" on storage.objects;
create policy "public read job-documents"
  on storage.objects for select
  using (bucket_id = 'job-documents');

drop policy if exists "public write job-documents" on storage.objects;
create policy "public write job-documents"
  on storage.objects for insert
  with check (bucket_id = 'job-documents');

drop policy if exists "public update job-documents" on storage.objects;
create policy "public update job-documents"
  on storage.objects for update
  using (bucket_id = 'job-documents');

drop policy if exists "public delete job-documents" on storage.objects;
create policy "public delete job-documents"
  on storage.objects for delete
  using (bucket_id = 'job-documents');
