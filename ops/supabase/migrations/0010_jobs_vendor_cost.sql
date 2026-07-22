-- Adds a vendor-cost field so Reports can compute real Payables and Profit
-- figures instead of just job counts (afzl's call, 2026-07-22 - Reports
-- needed Receivables/Payables, and Payables/Profit were both blocked by
-- not knowing what Dozr owes the vendor per job).
--
-- Nullable and staff-entered (via job-detail.html) once a vendor's price is
-- known - not every job will have this filled in immediately, Reports
-- treats missing values as "not yet known" rather than zero.

alter table jobs add column if not exists vendor_cost numeric;

comment on column jobs.vendor_cost is
  'What Dozr owes the vendor for this job (AED). Staff-entered on job-detail.html once the vendor''s price is confirmed. Null = not yet known, not zero.';
