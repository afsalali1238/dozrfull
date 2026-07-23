# Dozr Ops Dashboard — Operational & UX Review

*Reviewer perspective: Operations Director (B2B logistics + equipment rental marketplace) & UI/UX evaluator.*
*Scope reviewed: `ops/index.html` (Dashboard, Pipeline, Assets, Vendors, Billing, Reports), `job-detail.html`, `vendor-detail.html`, `login.html`, `js/main.js` render logic, `data/ops.js`, and the Supabase schema in `supabase/migrations/`.*
*Date: 23 Jul 2026*

---

## 1. Executive Summary & Ratings

Dozr Ops is a clean, brand-consistent, genuinely accessible v1 back-office console. It handles the **money-and-paperwork spine** of the business well — enquiry → quote → job → invoice → reconciliation — and the Reports module (ledger, reconciliation, VAT, CSV export) is more mature than most seed-stage internal tools. Real Supabase wiring, staff-only RLS, and an auth guard are already in place.

Where it falls short is on the parts that make this a *logistics + equipment rental* operation rather than a generic order tracker: **there is no map/tracking, no dispatch or driver management, no RFQ comparison UI, no asset-utilisation or rental-calendar view, no working invoicing flow, and the KYC-approval and dispute workflows exist in the data model but not in the interface.** Several capabilities are half-built — the schema and seed data include `rfqs`, `rfq_vendor_quotes`, and `escalations`, but none of them have a tab.

| Dimension | Rating | One-line justification |
|---|---|---|
| **Operational Feature Completeness** | **4.5 / 10** | Covers the billing/reconciliation spine solidly, but misses tracking, dispatch, RFQ UI, utilisation, real invoicing, KYC approval, and disputes — all table-stakes for this vertical. |
| **UI/UX Usability** | **6 / 10** | Clean, accessible, brand-compliant, dual kanban/table, strong reports. Held back by header-tab nav that won't scale, the absence of map/calendar views where they're essential, and a confusing dual-source Billing page. |

---

## 2. Operational Feature Audit

### 2.1 What exists today (current capabilities)

- **Dashboard** — top-line metric cards (new enquiries split Logistics/Equipment) plus a *"Needs your attention"* aggregator covering six task types: new enquiries at stage 0, RFQ/quote stalled >48h, missing vendor cost at "Payment Received", vendor documents expiring, and overdue invoices. Good instinct — this is the right shape for an ops home.
- **Pipeline** — 7-stage board (Quote Requested → Quote Sent → Approved → Work Completed → Invoiced → Payment Received → Vendor Paid), with **both kanban and table views**, a vertical filter (All / Logistics / Equipment), and a "log new enquiry" modal for WhatsApp/phone intake. Stage moves are a manual dropdown ("source of truth is staff action").
- **Assets** — table of equipment/vehicles (photo, category, vendor, plate/ID, availability, status) with an availability toggle (Available / On job / Maintenance) and an add-asset modal.
- **Vendors** — roster table (plan/trust badge, jobs-30d, on-time %, joined, status) with an onboarding modal that captures trade-license and insurance expiry; vendor detail page lists that vendor's equipment.
- **Billing** — outstanding / overdue / collected cards and an invoice table with UAE VAT (5%) shown correctly as a separate line. *Explicitly sample data — not wired; "Receipt"/"Remind" are disabled.*
- **Reports** — the strongest module: weekly revenue & volume bar charts, per-vendor activity, a filterable/sortable **job ledger** with profit (client price − vendor cost) and CSV export, by-stage and by-vertical breakdowns, an invoice statement, and a **client-vs-vendor reconciliation** table with mismatch flags.
- **Job detail** — pipeline strip, financials (staff-entered vendor cost, vendor-invoice ref, vendor-payment status), a documents panel (Quote / PO / Invoice / ePOD as labels), and an activity timeline.
- **Cross-cutting** — global ⌘K search across jobs/vendors/invoices; Supabase-backed jobs/vendors/equipment/invoices; role column (`ops_agent` / `ops_manager` / `admin`) in the schema; solid ARIA/skip-link/`sr-only` accessibility work.

### 2.2 Missing essentials (ranked by operational impact)

1. **Real-time fleet / asset tracking & map view — absent.** For a logistics marketplace this is the single biggest gap, and doubly odd given Dozr already ships a Fleet/Telematics product. There is no live map, no driver location, no ETA/geofence, no "where are my active jobs right now" view. **ePOD is only a document label** — there's no capture flow (signature/photo/timestamp/geotag).
2. **Dispatch & driver management — absent.** `driver` is a free-text string on the job. There's no driver roster, no availability, no assignment UI, and no dispatch board. Assigning the right driver/asset to a confirmed job is a core daily loop with no home.
3. **RFQ workflow UI — half-built.** `rfqs` and `rfq_vendor_quotes` exist in the schema and seed data (multi-vendor quotes, deadlines, quotes-in counts) but **there is no RFQ tab**. The highest-leverage screen — side-by-side quote comparison to pick a vendor — doesn't exist in the UI.
4. **Asset utilisation & rental calendar — absent.** Equipment rental lives or dies on utilisation. `day_rate` is stored but never surfaced; there's no utilisation %, idle-days, revenue-per-asset, or — critically — an **availability calendar/timeline** showing which asset is booked when. A status chip ("On job") can't prevent a double-booking.
5. **Working invoicing/billing flow — absent.** Billing is sample data with actions disabled. No invoice generation, no PDF/VAT invoice, no payment recording, no credit notes, no aging buckets beyond a single "overdue". Reports (live) and Billing (mock) are two sources of truth — the page even carries a note apologising for the mismatch.
6. **KYC / compliance approval — data only, no workflow.** Expiry capture and expiry alerts are good, but there's **no document upload/verification, no approve/reject queue** (the `pendingApproval` flag has no action behind it), and no audit trail of who verified what.
7. **Dispute / escalation management — hidden.** A full L1/L2/L3 escalation model with rules and a log exists in `data/ops.js` and the `escalations` table, but the tab is unrendered. No dispute queue, no SLA timer, no resolution workflow — and "do not release vendor payment on dispute" (an actual rule in the data) isn't enforced anywhere in the UI.
8. **Client / CRM layer — absent.** Clients are free-text strings, not entities. No client directory, contact/credit terms, repeat-client analytics, or job history per client.
9. **SLA timers & real notifications.** "Needs attention" is a static recompute on load; the 48h threshold is hard-coded. No countdown timers, no push/WhatsApp notifications surfaced despite "WhatsApp-native" being a stated pillar.
10. **Role-based UI, maintenance scheduling, and a cross-entity audit log** — the role enum exists but the UI doesn't gate anything; `maintenance` is a status with no log/schedule/cost; there's no activity/audit history outside a single job's timeline.

---

## 3. UI/UX Critique & Redesign Suggestions (component-level)

**Primary navigation — move header tabs to a left sidebar.** Six tabs plus a search button plus a "live" pill are already competing for the header bar. The moment RFQs, Dispatch, Disputes, and Clients arrive (they should), this breaks. A persistent left sidebar is the ops-tool convention for a reason: it scales, supports grouping (e.g. *Operations → Pipeline / RFQs / Dispatch*), and frees the header for context (current user, role, global search, notifications bell).

**Add a Map view — the highest-value missing screen.** A live map of active jobs and driver locations (even a static/polling version first) is what an ops manager stares at all day in logistics. Put it on the Dashboard as a split with "Needs attention", and as the default view of a new Dispatch tab.

**Assets: replace the flat table with a booking calendar + utilisation cards.** For rental, the mental model is *time*, not *rows*. A **timeline/Gantt** ("this excavator is booked Jul 24–28, free after") prevents double-booking and shows idle gaps at a glance. Pair it with per-asset cards showing a utilisation gauge and revenue-vs-day-rate. Keep the table as a secondary "list" view.

**Pipeline: keep kanban, but make it drag-and-drop and add stage SLA.** The dual kanban/table split is a genuine strength — keep it. The per-card stage *dropdown* is slower than the drag users expect from a board; add drag-to-move (keep the dropdown as the accessible fallback). Show a small "time in stage" badge so ageing jobs are visible without opening each one.

**Dashboard "Needs your attention": group by urgency and make rows actionable.** Right now it's a flat list. Group into "Overdue / Due today / Upcoming", show a count per group, and let a row resolve inline (assign, snooze, open) rather than only linking out. Add SLA countdowns so the 48h logic is visible, not implicit.

**Billing: collapse the dual source of truth.** Two invoice datasets (live Reports vs mock Billing) with a note explaining they won't match is a real cognitive-load and trust problem. Until real invoicing lands, either drive Billing from the same live job records Reports uses, or clearly badge the page "Preview — not live" and hide the disabled buttons entirely rather than showing dead controls.

**Reports: it's one very long scroll of six stacked panels.** Add an anchor/sub-tab strip (Trends · Ledger · By stage · By vertical · Invoices · Reconciliation) or a sticky in-page nav so an operator can jump straight to Reconciliation without scrolling past three charts.

**Job detail: make the timeline writable and turn ePOD into a real artifact.** The activity timeline is read-only; an "add note" box turns it into the running job log ops teams actually keep. The ePOD "document" should become a capture block (photo + signature + timestamp/geo) — that's the proof-of-delivery the whole downstream invoice depends on.

**Vendor detail: surface the compliance state at the top.** Expiry data is captured but buried in a details list. A traffic-light compliance banner ("Insurance expires in 9 days") at the top of the vendor page, plus the approve/reject action for pending vendors, turns a static record into the KYC workspace it needs to be.

**What's already good — keep it.** Brand tokens are applied consistently and the yellow is used sparingly and correctly; the accessibility work (tablist semantics, `sr-only` captions, skip link, focus trapping in modals) is above the bar for a prototype; ⌘K search is the right primitive; and the reconciliation/profit logic shows real domain thinking.

---

## 4. Prioritised Action Plan (next iteration)

**P0 — build the logistics core the vertical requires**
1. **Dispatch tab + driver roster.** Promote `driver` to an entity; add assignment UI on confirmed jobs and a dispatch board (unassigned → assigned → en route → delivered).
2. **Map view** of active jobs/drivers (start with polling, not full telematics) on Dashboard and Dispatch.
3. **RFQ tab with side-by-side quote comparison** — the data already exists; this is mostly UI.
4. **Real ePOD capture** on job detail (photo + signature + timestamp).

**P1 — close the half-built loops**
5. **Wire Billing to live data** and add invoice generation + payment recording; kill the mock/live split.
6. **KYC approval queue** — approve/reject pending vendors, document upload/verify, expiry traffic-lights.
7. **Surface the Escalations/Dispute tab** that already exists in data, with SLA timers and the "hold vendor payment on dispute" rule enforced.

**P2 — utilisation, structure, and scale**
8. **Asset availability calendar + utilisation metrics** (surface `day_rate`, revenue-per-asset, idle days).
9. **Left-sidebar navigation** to make room for the tabs above.
10. **Client/CRM layer** (clients as entities), role-based UI gating, cross-entity audit log, and drag-and-drop + stage-age badges on the kanban.

**Quick wins (low effort, high clarity):** anchor nav on Reports; group + inline-resolve the Dashboard attention list; writable job timeline; hide disabled Billing buttons until wired.
