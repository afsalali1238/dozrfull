-- Vendor invoice/payment tracking
-- Run this in the Supabase SQL Editor (Project → SQL Editor → New query).
--
-- Until now, jobs.vendor_cost (0010_jobs_vendor_cost.sql) was a single
-- number with no reference or payment status - Payables/Profit worked, but
-- there was no way to reconcile "what we invoiced the client" against "what
-- we paid the vendor" per job. This adds the vendor side of that pair,
-- mirroring how client invoices already carry a ref + status
-- (afzl's ask, 2026-07-23: "match every invoice I make with every invoice
-- I paid").

alter table jobs add column if not exists vendor_invoice_ref text;
alter table jobs add column if not exists vendor_payment_status text not null default 'unpaid'
  check (vendor_payment_status in ('unpaid', 'paid'));
alter table jobs add column if not exists vendor_paid_at date;

comment on column jobs.vendor_invoice_ref is 'Vendor''s own invoice number for this job''s vendor_cost - staff-entered, not generated.';
comment on column jobs.vendor_payment_status is 'Whether Dozr has paid the vendor for this job yet - independent of whether the client has paid Dozr (see Reports > Reconciliation).';
comment on column jobs.vendor_paid_at is 'Date Dozr paid the vendor, only meaningful when vendor_payment_status = paid.';
