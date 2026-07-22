-- Dozr Ops — storage policies for the equipment-images bucket.
-- Run after creating the "equipment-images" bucket in Storage → New bucket.
-- Public bucket + these policies: anyone can view images (needed since
-- Marketplace may show equipment photos to clients later), but only signed-in
-- staff can upload/replace/delete them.

create policy "public can view equipment images"
on storage.objects for select
using (bucket_id = 'equipment-images');

create policy "staff can upload equipment images"
on storage.objects for insert
with check (bucket_id = 'equipment-images' and is_staff());

create policy "staff can update equipment images"
on storage.objects for update
using (bucket_id = 'equipment-images' and is_staff());

create policy "staff can delete equipment images"
on storage.objects for delete
using (bucket_id = 'equipment-images' and is_staff());
