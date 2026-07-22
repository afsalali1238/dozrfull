-- Dozr Ops — jobs needed a few fields 0001_init.sql didn't include:
-- - type: equipment/freight description (e.g. "Crane, 60t") - every job
--   card/list shows this, the original schema missed it.
-- - vendor_name: denormalized display text. vendor_id (FK) stays for jobs
--   that do have a real matched vendor, but not every job's vendor exists
--   in the vendors table yet - same "keep a display string, don't block on
--   a perfect FK match" pattern jobs.price already uses.
-- - vertical: Logistics vs Equipment Rental. Previously guessed client-side
--   from keywords in `type` (see jobVertical() in ops/js/main.js) - now a
--   real column so it doesn't need to be re-inferred every render.

alter table jobs add column if not exists type text;
alter table jobs add column if not exists vendor_name text;
alter table jobs add column if not exists vertical text check (vertical in ('logistics', 'equipment'));
