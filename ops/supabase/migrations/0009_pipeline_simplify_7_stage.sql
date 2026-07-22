-- Simplify the job pipeline from 13 stages to 7 (afzl's call, 2026-07-22 -
-- the 13-stage version was "too much" and most of it wasn't backed by real
-- tracking anyway, see ROADMAP.md). New stages (0-indexed), matching the
-- `pipeline` array in ops/data/ops.js:
--   0 Quote Requested   3 Work Completed   6 Vendor Paid (if applicable)
--   1 Quote Sent        4 Invoiced
--   2 Approved          5 Payment Received
--
-- Old -> new mapping used below:
--   0,1,2   (Enquiry Received / RFQ Sent / Quote Received)      -> 0 Quote Requested
--   3       (Quote Approved)                                    -> 2 Approved
--   4,5,6,7 (PO Issued / Driver Assigned / Dispatched / Transit) -> 2 Approved
--   8,9     (Delivered / ePOD Signed)                            -> 3 Work Completed
--   10,11   (Invoice Generated / Payment Pending)                -> 4 Invoiced
--   12      (Paid & Closed)                                      -> 5 Payment Received
-- Nothing maps to 1 (Quote Sent) or 6 (Vendor Paid) automatically - those
-- didn't have clean old-stage equivalents; existing jobs land on the
-- nearest safe stage and staff can move them forward manually if needed.
--
-- Run once, after 0007_seed_jobs.sql. Safe to re-run (idempotent: values
-- already in 0-6 pass through the CASE unchanged).

-- 1. Drop the old check constraint so rows can be remapped first (they'd
--    otherwise violate a tighter 0-6 constraint mid-update).
alter table jobs drop constraint if exists jobs_stage_check;

-- 2. Remap every existing row from the old 13-stage numbering.
update jobs set stage = case
  when stage in (0, 1, 2) then 0
  when stage in (3, 4, 5, 6, 7) then 2
  when stage in (8, 9) then 3
  when stage in (10, 11) then 4
  when stage = 12 then 5
  else stage
end
where stage > 6;

-- 3. Re-add the constraint for the new 7-stage range.
alter table jobs add constraint jobs_stage_check check (stage between 0 and 6);
