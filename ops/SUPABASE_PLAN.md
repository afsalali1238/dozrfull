# Ops Supabase Plan (proposal — not yet scaffolded)

Written 2026-07-22 after afzl asked "should we setup a backend with supabase"
in response to the ops dashboard redesign notes (escalations removed from v1,
quote-request workflow with vendor price capture, kanban job view, add
vendor, add equipment/vehicles with images + availability). This is a
proposal per root `CLAUDE.md`'s rule that stack decisions need afzl's
sign-off before scaffolding — nothing below has been built yet.

## Why now

Every dead button in `ops/index.html` ("+ Onboard vendor", "+ New RFQ", "Add
vendor") exists because there's no real backend — mock data in
`ops/data/ops.js` can't be written to. The features just requested (mark a
quote as quoted + capture vendor price, add a vendor, add equipment with
images/availability, a kanban that reflects state) are the first ones that
need to actually persist and be edited by more than one person. That's the
line where a JS mock-data file stops being enough.

## Proposed schema

- **staff_users** — id, name, email, role. Gates `ops/` behind Supabase Auth
  (currently zero auth on `ops/` — anyone with the URL can open it).
- **vendors** — id, name, contact_name, phone, email, plan/tier, trade
  license + expiry, insurance expiry, active (bool), joined_at.
- **equipment** — id, vendor_id (fk), category (crane/flatbed/excavator/…),
  name/model, plate_or_asset_id, images (Supabase Storage refs, array),
  availability_status (available / on_job / maintenance), day_rate
  (**internal only — never sent to the client-facing Marketplace**), notes.
  Replaces `vendors[].fleet`'s single summary string with a real itemized
  list.
- **rfqs** — id, code (ref no, e.g. RFQ-2201), client name/contact/email,
  route, type, deadline, status (open / quoted / closed), created_at.
- **rfq_vendor_quotes** — rfq_id (fk), vendor_id (fk), quoted_price,
  quoted_at, notes. One row per vendor quote — supports the "mark quoted +
  enter vendor price" action and multiple vendors quoting the same RFQ.
- **jobs** — id, code, rfq_id (fk), client info, vendor_id (fk),
  equipment_id (fk), driver, route, stage (0–12, matches the 13-stage
  pipeline in the Ops Manual), price, flagged (bool), documents (quote/PO/
  invoice refs), timeline (stage-change log w/ timestamps). Kanban groups
  `stage` into ~6 columns (Enquiry → Quoting → Approved/Dispatch → In
  Transit → Delivered/ePOD → Invoiced/Paid) — confirm this grouping before
  building; the detailed 13-stage strip stays available in job-detail.
- **invoices** — id, ref, job_id (fk), client, amount, issued, due, status.
- **escalations** — id, level, job_id (fk), issue, owner, time, status. Data
  survives even though the tab is hidden from v1 nav.

## Auth scope

Staff auth only for this pass (email/password or magic link via Supabase
Auth), RLS scoped to the staff role. Client and vendor auth stay deferred —
matches the existing "clients don't self-register, staff onboard them" and
"Vendor OS is separate, not started" decisions already in `ROADMAP.md`.

## One conflict found while reviewing this

`marketplace/js/quote-approval.js` currently renders the real vendor name
("Quote from Gulf Heavy Rentals") on the client-facing approval screen. This
contradicts "we'll not be sharing vendor details to client" — needs to
change to something like "Quote from a Dozr-verified vendor" once that rule
is confirmed as firm. Flagged here, not yet fixed.

## Suggested build order (pending afzl's go-ahead)

1. Schema + RLS + staff auth — foundation, nothing else works without it.
2. Vendor CRUD (add vendor form) + equipment CRUD (add vehicle/equipment
   with image upload to Supabase Storage + availability toggle).
3. RFQ quote capture — "mark quoted" action writing to
   `rfq_vendor_quotes.quoted_price`.
4. Kanban job view reading `jobs.stage`, grouped per the column mapping
   above.
5. Escalations tab reintroduced (data already modeled, just re-add the nav
   tab + panel) + fix the quote-approval.js vendor-name leak.

Marketplace's public site can keep its current static/WhatsApp-deep-link
flow independent of this — this migration only needs to touch `ops/`.
