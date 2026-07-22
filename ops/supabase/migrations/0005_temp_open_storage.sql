-- Dozr Ops — open up Storage too, to match 0003_temp_open_access.sql.
-- 0002_storage_policies.sql's upload/update/delete policies on the
-- equipment-images bucket still require is_staff(), which nobody satisfies
-- with auth off - image uploads on Add Vendor/Add Equipment/Add Asset will
-- fail with the same RLS error until this runs.
--
-- Same caveat as 0003_temp_open_access.sql: fine for an internal, unlisted
-- URL during build; revisit before anything semi-public.

create policy "temp anon upload - equipment images"
on storage.objects for insert
with check (bucket_id = 'equipment-images');

create policy "temp anon update - equipment images"
on storage.objects for update
using (bucket_id = 'equipment-images');

create policy "temp anon delete - equipment images"
on storage.objects for delete
using (bucket_id = 'equipment-images');
