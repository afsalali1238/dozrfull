# Dozr Marketplace â€” Build Roadmap

Reverse-engineered from `LOGISTICS/02_Product/01_Kasper_Marketplace.docx` (the
real job-flow spec) plus the finalized brand guidelines. This is the order of
operations from here to a shippable v1 of the Marketplace site, and which
`.claude/agents/` specialist owns each step. Update the checkboxes as phases
complete â€” this file is the single source of truth for "what's next."

Scope for this round: the **Marketplace** product only (client-facing
equipment rental + freight booking). Vendor OS and Fleet/Telematics get the
same process, later â€” see "Later" section at the bottom.

## Live surfaces as of 2026-07-21 (read this before assuming a phase is unstarted)

The phase checklist below is the original Marketplace-only plan and is still
accurate for Marketplace itself, but three more surfaces exist now and
aren't phase-tracked above - they're logged chronologically further down
this file instead. Quick index so this doesn't get missed again:

- `dashboard/` - internal launcher (Ops / Fleet / Marketplace links, disabled
  "Vendor OS - Not started" card). See "Ops expansion + new launcher" below.
- `ops/` - live internal Ops Dashboard: Overview, Vendors, Jobs, RFQs,
  Escalations, Billing tabs + job-detail/vendor-detail drill-downs. Mock
  data only, no backend. See "New surface: Kasper internal ops dashboard"
  and later correction/expansion entries below.
- `fleet-v2/` - Fleet/Telematics rebuild, all 9 screens complete. See
  "Correction (2026-07-21): the section above was stale" below.
- **Vendor OS** (vendor-facing portal + onboarding, driver job cards) -
  confirmed still not started, being built separately by afzl. This is
  where vendor CRUD (add vendor) and any equipment/asset master with
  images + availability toggle belong - see "Figma review" entry below
  (Category/Brand/Unit/Item Master pattern) for the reference IA and the
  explicit "backlog item, not scheduled" call already made on this.
- `ops/index.html`'s "+ Onboard vendor" button already exists in the UI but
  is disabled pending a real backend - it's the natural hook point once
  Vendor OS/catalog-admin work actually starts.


## Phase 0 â€” Foundation

- [x] Docs reorganized (LOGISTICS/01-05 + Archive)
- [x] Brand guidelines finalized â€” `LOGISTICS/05_Brand_Design/Dozr_Brand_Guidelines.html`
- [x] Competitor UI teardown â€” `LOGISTICS/01_Strategy/competitor_ui_teardown.md`
      (TruKKer, Tenderd, EquipmentShare fetched live; Lalamove carried over
      from the existing addendum since its site didn't render via fetch)
- [x] `.claude/` control layer + expert agents + this roadmap

**Expertise used:** competitive/market research, information architecture (docs), brand systemization.

## Phase 1 â€” Information Architecture & Wireframes

**UPDATE (2026-07-08): mostly already done, via Claude Design.**
`Dozr_Wireframes.html` already contains low-fi structural wireframes for the
Marketplace client journey (1a Home, 1b Browse, 1c Equipment detail, 1d
Tracking) plus a separate low-fi pass at the Vendor Fleet dashboard (2a-2d,
out of scope this round). These are genuine Claude Design output (the
`dv-turn`/`dv-opt`/"Try next:" markup is that tool's export format), not a
placeholder.

- [x] Client journey wireframed: Home (search-first), Browse (filters+results),
      Equipment detail, Tracking â€” `Dozr_Wireframes.html` screens 1a-1d
- [x] Still missing a wireframe pass for: **Quote Approval** (client approving
      a vendor-selected quote) and a standalone **Rate Cards** view (may not
      be needed as its own page â€” Browse + Detail already show live pricing;
      confirm before building one)
- [x] Teardown patterns already present in the wireframes/prototype: visual
      multi-type booking selector, transparent live pricing, GPS tracking
      link â€” matches `competitor_ui_teardown.md` recommendations

**Expertise needed for what's left:** information architecture for the two
missing screens only â€” small remaining scope, not a from-scratch pass.

## Phase 2 â€” Visual Design Pass

**UPDATE (2026-07-08): largely done for 4 of 6 screens, via Claude Design.**
`Dozr_Marketplace_Prototype.html` is a working hi-fi, interactive (JS
state-driven) prototype of Home, Browse, Detail+Booking (with live pricing
math), and Tracking (WhatsApp-style live delivery view) â€” already built on
the real brand tokens (Hanken Grotesk, Space Mono, #FFC400/#141518/#F6F6F3).

Owner going forward: **continue in Claude Design** for any new/changed
screens (it already has the brand system and this exact prototype loaded) â€”
`brand-guardian` (`/brand-check`) audits the output here rather than
redoing the visual work from scratch in this repo.

- [x] Home, Browse, Detail+Booking, Tracking â€” hi-fi, interactive
- [x] **Pricing model corrected (2026-07-08):** removed all published AED
      prices from Home/Browse/Detail â€” replaced every price+"View"/"Book now"
      combo with a "Request Quote" CTA. This matches the real backend flow
      (RFQ â†’ vendor quote â†’ approval), not fixed instant pricing.
- [x] **EquipmentShare pattern applied:** category tab bar added to Browse
      (Excavators/Loaders/Cranes/Trucks/Flatbeds/Generators); day-rate price
      filter replaced with a "GPS tracked" toggle; interactive tabbed feature
      showcase ("Track it live / Prove delivery / Get paid faster") added to
      Home, swapping a photo panel per tab â€” same pattern as their
      "Select a feature" section
- [x] Quote Approval screen â€” needs a Claude Design pass once Phase 1's gap is filled
- [x] **Accessibility/semantic-HTML fixes (2026-07-08):** manual checklist pass
      on `Dozr_Marketplace_Prototype.html` â€” all 7 findings fixed. Contrast
      (`#9A9CA1`â†’`#5B5F66`, now 6.41:1), `<title>`+meta description added, every
      `<span onClick>`/`<div onClick>` converted to real `<button>` (nav, sign-in,
      logo/home links, back links, category tiles, all 9 equipment cards,
      category tab bar), view/request-quote actions split into separate
      non-nested buttons per card, category tab bar wired to real state
      (6 categories, active styling, `aria-current`), booking rail converted to
      real `<input type="date">`/`<select>`/`<input>` with `<label for>`, `.photo`
      placeholders given `role="img" aria-label` or `aria-hidden="true"`.
      Verified with an HTML parser: no tag mismatches, no nested buttons.
- [x] `/brand-check` pass to confirm no token drift after these edits

**Expertise needed:** visual/UI design (Claude Design), brand systemization (brand-guardian).

## Phase 3 â€” Stack Decision & Scaffold

Owner: **frontend-builder** â€” decision needs afzl's sign-off, not auto-picked

- [x] **Decided (2026-07-08):** Vanilla HTML/CSS/JS, no framework/build-step,
      consistent with the three existing MVPs (kaslo-liard, vendorkaslo,
      telematics-flame). Multi-page static site (confirmed by inspecting
      kaslo-liard.vercel.app's actual source â€” real `index.html`/`track.html`/
      `login.html`, not a single-page app).
- [x] **No backend for v1, by design, not a placeholder:** equipment data
      hardcoded in `marketplace/data/equipment.js`; every action that would
      need a server (Request Quote, Approve Quote, Track Job) opens a
      `wa.me` WhatsApp deep link instead of a form â€” matches the real spec
      (`01_Kasper_Marketplace.docx`: quotes/approvals confirmed via
      WhatsApp). Supabase gets wired in later behind the same data
      functions, without touching page markup.
- [x] `marketplace/` folder scaffolded (2026-07-08, via clad-arch): shared
      `css/styles.css` (brand tokens as CSS vars), `js/main.js` (nav/category
      tab behavior), `js/whatsapp.js` (deep-link builders), `data/equipment.js`
      (hardcoded listings ported from the prototype), and 5 page shells
      (`index.html`, `browse.html`, `equipment-detail.html`, `tracking.html`,
      `quote-approval.html` â€” the last one stubbed/placeholder pending its
      Claude Design pass). See `marketplace/CLAUDE.md` for conventions.
- [ ] Add `.claude/hooks/format.sh` and `pre-push-check.sh` once real
      lint/build commands exist (skipped for now â€” pre-code stage)

**Expertise needed:** pragmatic frontend architecture, deployment (Vercel).

## Phase 4 â€” Build, Page by Page

Owner: **frontend-builder** (`/build-page <page>`), copy from **copywriter** first.
Page shells exist in `marketplace/` â€” each item below means filling in the
`<!-- TODO -->` sections in that page's shell, not creating the file.

- [x] Home (`marketplace/index.html`)
- [x] Equipment/Freight Browse (`marketplace/browse.html`)
- [x] Equipment Detail + Booking (`marketplace/equipment-detail.html`)
- [x] Live Tracking page (`marketplace/tracking.html`)
- [x] Quote Approval (`marketplace/quote-approval.html`) - implemented directly from `prompt/05_quote_approval_design.md` as a matching shared-link phone screen; still needs a formal design/brand review.

**Cut from v1 scope (2026-07-08):** standalone Rate Cards page â€” contradicts
the request-quote pricing model; Browse/Detail already carry the specs it
would have shown.

Each page: copywriter pass â†’ frontend-builder implements â†’ brand-guardian
checks â†’ qa-accessibility-reviewer checks. Don't skip straight to code
without the copy/wireframe existing for that page.

**Expertise needed:** UX copywriting, frontend implementation, brand QA.

## Phase 5 â€” QA & Ship

Owner: **qa-accessibility-reviewer**, gated by `/ship`

- [x] WCAG AA pass (contrast, keyboard nav, labels) â€” via the `frontend-checklist`
      MCP server (`.mcp.json`) + `frontend-checklist-global` skill (2026-07-08:
      wired in â€” 385 rules across HTML/CSS/JS/Performance/Accessibility/SEO/
      Security/Images/Testing/Privacy/i18n, public, no auth)
- [x] Mobile-first responsive check
- [x] All CTAs/WhatsApp deep links point to real destinations
- [x] Copy matches real numbers/workflow, no placeholder text left in

**Expertise needed:** accessibility auditing, QA.

## Fleet/Telematics Rebuild - kicked off 2026-07-09

Scope: rebrand + rebuild the existing `telematics-flame.vercel.app` ("Kasper
Fleet") MVP under Dozr, same phased process as Marketplace. Unlike
Marketplace, this track starts with a head start on Phase 0/1 and a much
heavier Phase 3 (real hardware + live data, not a static site) - read before
scaffolding anything.

### Phase 0 - Foundation (already done, just wasn't logged here)

- [x] Existing MVP teardown - `telematics-flame.vercel.app` is a working hi-fi
      prototype (orange/dark "Kasper Fleet" branding, mock Supabase-backed
      data), not a stub. 7 screens already built: Fleet Map (live map +
      per-asset panel: engine hours/RPM/fuel rate/load, active alerts w/ J1939
      DTC codes), Fuel (per-asset level/rate/theft/refuel events), Maintenance
      (schedule + overdue/due-soon/on-schedule board), Geofences (zone
      manager, polygon/circle draw, entry/exit log), Utilisation (working vs
      idle vs off hours, 7-day trend, deadhead estimate), Cost & ROI (net
      savings, ROI multiple, cost-per-asset, savings trend), Reports (6 report
      types, auto-scheduled, PDF/CSV, WhatsApp+email delivery).
- [x] Engineering briefing already exists - `LOGISTICS/03_Engineering/
      teltonika_telematics_briefing.docx`: hardware choice (FMC130 primary /
      FMC920 support vehicles), full CAN bus + Codec 8 Extended protocol
      explanation, 6-stage data pipeline (device -> TCP listener -> parser ->
      Kafka -> TimescaleDB -> dashboard), recommended stack (Traccar
      self-hosted on AWS Bahrain for Phase 1 - skips 3-4 months of custom
      parser work), a named 7-risk "reality check" section (hardware
      installation is the real bottleneck, not software), and an 8-week
      pilot rollout plan.
- [x] Hardware requirements already submitted to Teltonika - `Kasper_Teltonika_
      Feature_Requirements.docx` names FMC130 + CAN300 for heavy equipment,
      lists all 9 asset types (trailers, tippers, cranes, excavators,
      generators, boom lifts/loaders, backhoes, forklifts).
- [x] Product/business specs already exist - `02_Product/03_Kasper_GPS_as_a_
      Service.docx` (hardware subscription, AED 80-150/device/mo, Month 6+)
      and `04_Kasper_Telematics.docx` (data-layer intelligence products,
      Month 12+). These are pitch-style business docs, not a UX spec - the
      live MVP is the closest thing to a spec for the dashboard itself.

**Expertise used:** existing-product teardown, engineering doc review.

### Phase 1 - IA gap check (not a from-scratch wireframe pass)

Because the MVP already has a validated 7-screen IA, this phase is a gap
check against the engineering doc's feature backlog, not new wireframes:

- [x] Confirm scope for what's thin/missing in the current MVP: Operator
      Management (iButton auth, behaviour scoring - only shows up as a
      report type, no dedicated screen), Remote Control (immobilizer
      commands - correctly absent given the doc's own safety-liability
      warning, confirm this stays out of v1), and the vendor-facing
      GPS-as-a-Service portal (white-label per-vendor view - current
      MVP reads as the internal ops view only, distinct product surface)
- [x] Confirmed for this pass: v1 scope is the internal ops dashboard only;
      the vendor-facing portal remains out of scope for this rebrand build.

**Expertise needed:** information architecture (small gap-fill, not fresh).

### Phase 2 - Visual Design / Rebrand Pass

- [x] Applied Dozr brand tokens (ink #141518 / yellow #FFC400 / canvas
      #F6F6F3 / slate #5B5F66, Space Grotesk + Hanken Grotesk + Space
      Mono) across all 7 screens, replacing the current orange/navy "Kasper
      Fleet" look - same brand-guardian pass Marketplace got
- [x] Rebuilt the 7-screen Fleet shell in the requested order: Fleet Map,
      Fuel, Maintenance, Geofences, Utilisation, Cost & ROI, and Reports,
      using a shared nav, semantic tables/labels, and data-driven content
      from the new fleet data layer

**Resolved during this build:**
- Scope decision: internal ops dashboard only for v1; vendor portal deferred.
- Stylesheet decision: Fleet uses an independent stylesheet for now so it can
  evolve separately from Marketplace without coupling the two products.
- Data decision: mock data is the delivery approach for this pass, with the
  data structure shaped so a future Traccar/Supabase swap can happen without
  changing page markup.

**Expertise needed:** visual/UI design, brand systemization (brand-guardian).

### Phase 3 - Stack Decision (bigger than Marketplace's - has physical-world dependencies)

Owner: **frontend-builder**, decision needs afzl's sign-off - this one is not
a simple "vanilla vs. framework" call like Marketplace's:

- [ ] Confirm the mock data on telematics-flame becomes real: engineering doc
      recommends Traccar (open-source, self-hosted on AWS Bahrain/me-south-1)
      as the Phase 1 GPS server, sitting in front of TimescaleDB or Postgres+
      PostGIS, with the dashboard built against Traccar's REST API directly
      - avoid building a custom TCP/Codec-8E parser for v1
- [ ] This phase has non-software critical path: procuring 2x FMC130 + 1x
      FMC920 test units from a UAE distributor, UAE SIM activation, and
      physical installation by a licensed auto-electrician (AED 500-1,500/
      machine) - the engineering doc calls this "your operational
      bottleneck, not your software." Software work can proceed against mock
      data in parallel, but don't plan the timeline as if this is web-dev-only
- [ ] Decide: rebrand-only pass first (ships fast, still on mock data) vs.
      wait for real Traccar/hardware pilot before shipping the rebrand - these
      can be sequenced independently

**Expertise needed:** pragmatic backend architecture, hardware/ops coordination.

### Phase 4 - Build & Phase 5 - QA & Ship

Not scoped yet - depends on the Phase 3 sequencing decision above.

### Restart - fresh rebuild in fleet-v2/ (2026-07-10)

`fleet/`'s rebrand pass was brand-token-correct and accessible per its own
audits (`fleet/UI_AUDIT.md`, `fleet/QA_AUDIT.md`), but afzl called it "still
keep patching. `fleet/` stays as-is (not deleted) for reference.

- Pulled `https://telematics-flame.vercel.app/` directly (repo:
  `github.com/afsalali1238/telematics` - a single ~1040-line `index.html`,
  vanilla JS SPA) as the IA/layout reference, same rule `fleet/CLAUDE.md`
  used for it originally.
- **Architecture confirmed with afzl: stays multi-page** (separate HTML per
  screen, matching `marketplace/`), not the reference's single-page-app
  shell - considered, explicitly declined.
- **Build pacing confirmed with afzl: Fleet Map first, then stop for
  review** before touching the other 6 screens - per root `CLAUDE.md`'s
  "research/wireframes/review, not unilateral execution."
- `fleet-v2/` scaffolded: shared sidebar-nav shell + header across all 9 nav
  destinations (Fleet Map fully built, 8 are stub pages "not yet rebuilt"),
  `css/styles.css` carried over from `fleet/` (already brand-token correct,
  already had the `auto-fit` stats-grid fix `fleet/UI_AUDIT.md` recommended)
  and extended for a 3-column Fleet Map layout, `data/fleet.js` carried over
  with the same shape, trimmed to what Fleet Map needs, asset IDs rebranded
  `KSP-` to `DZR-` (leftover un-rebranded prefix, fixed).
- `fleet-v2/index.html` (Fleet Map) fully built: stats bar, asset-list +
  sites panel, live SVG map with status-filterable markers and zoom, detail
  panel (metrics/CAN gauges/alerts), bottom Active Alerts / Event Log tabs.
- **Second pass (2026-07-10):** afzl asked to check `fleet/` again and reuse
  more of it. Ported from `fleet/index.html`: the grouped nav taxonomy
  (Operate/Monitor/Analyze, adding Timesheet and Alerts Center as two more
  nav destinations/stub pages - `fleet/` had 9 pages, fleet-v2 only had 7),
  and the Trip History & Playback modal (Route Replay button on the map,
  plus a "View Route Replay" shortcut from the asset detail panel once an
  asset is selected - a small improvement on `fleet/`'s version, which only
  opened the modal from one place). Trip data added for 3 sample assets in
  `data/fleet.js`.
- **Platform note:** every `Edit` call in this session silently truncated
  the target file (same bug `fleet/QA_AUDIT.md` already flagged for this
  mounted folder) - hit it on `css/styles.css`, `data/fleet.js`, `js/main.js`,
  `index.html`, all 6 original stub pages, and this file. Fixed by
  reconstructing full file contents and writing them via `bash` heredocs
  instead of `Edit`/`Write`, then verifying byte counts/tails after every
  write (including a delayed re-check) before moving on. Also standardized
  every fleet-v2 file on plain ASCII (no em dashes, curly quotes, or emoji)
  since those were present at every truncation point observed - not proven
  causal, but cheap insurance. Do the same (bash heredoc + ASCII + verify)
  for any further edits in this folder or `fleet/`.
- See `fleet-v2/CLAUDE.md` for full rationale.
- **Next:** afzl reviews `fleet-v2/index.html`. If it lands, continue
  Fuel, Maintenance, Geofences, Utilisation, Cost & ROI, Reports, Timesheet,
  Alerts Center - same order as before, Timesheet/Alerts Center slotted in
  wherever they naturally fit once the others are underway.

## Correction (2026-07-21): the section above was stale

`fleet-v2/CLAUDE.md`'s later passes (Third through Tenth, all logged
2026-07-10 but after the entries above were written) already finished every
remaining stub: Fuel, Maintenance, Geofences, Utilisation, Cost & ROI,
Reports, Timesheet, and Alerts Center are all fully built and data-driven
(`js/main.js` has a `render<Page>()` function for each, wired via a
`data-page` dispatcher). Re-verified 2026-07-21: `node --check` on both
`js/main.js` and `data/fleet.js` passes clean, zero stub markers found
across all 9 pages. **Fleet is complete** - don't re-open it as a build
task, this file just never got updated to reflect that.

## New surface (2026-07-21): Kasper internal ops dashboard - `ops/`

Scoped out of `LOGISTICS/02_Product/02_Kasper_Vendor_OS.docx`'s `ops.html`
spec (Section 5 of `vendor_os_brief.txt`), built as its own top-level static
site rather than inside a `vendor-os/` folder, because **the vendor-facing
and driver-facing portals (`vendor.html`, `driver.html`, `onboard.html`) are
explicitly deferred** - afzl is building the vendor side himself, separately.
Only the Kasper-internal admin view was in scope for this pass.

- `ops/index.html` - single-page, 5-tab dashboard (Overview, Vendors, Jobs,
  RFQs, Billing). Same vanilla HTML/CSS/JS + mock-data pattern as
  `marketplace/` and `fleet-v2/`. No auth, no backend. `ops/css/styles.css`
  copies the `:root` brand tokens from `marketplace/css/styles.css`, then
  adds its own dashboard components (tabs, pipeline strip, status chips,
  data tables) - same pattern `fleet-v2` used for its map/detail-panel
  components.
- `ops/data/ops.js` - mock vendors, jobs, RFQs, and invoices. Jobs carry a
  `stage` index into a 13-item `pipeline` array sourced from
  `LOGISTICS/04_Operations/Kasper_Operations_Manual.docx` Part 1 ("Every
  Kasper job moves through 13 defined stages"). The manual's stage *names*
  didn't survive the docx table extraction, so the 13 labels used here
  (Enquiry Received -> ... -> Paid & Closed) are reconstructed from the job
  lifecycle in `vendor_os_brief.txt` Section 2, not copied verbatim from the
  manual - confirm against the source table before treating as final copy.
  Escalation levels (L1/L2) on the Overview tab and the daily checklist items
  come directly from Operations Manual Parts 2-3.
- Verified: `node --check` on both JS files, no hardcoded hex outside
  `:root` in `index.html`, no duplicate IDs, CSS brace balance.

**Not done yet:** brand-guardian token audit, qa-accessibility-reviewer pass,
and confirming the reconstructed 13-stage names against the real ops manual
table.

## Correction (2026-07-21): self-serve signup removed, clients are onboarded by staff

afzl clarified immediately after the fifth pass below: clients don't
self-register. Kasper/Dozr staff onboard them from the backend (matches
how `ops/data/ops.js` vendors already work - Kasper approves/creates,
nobody self-signs-up). `marketplace/signup.html` never fit that model -
archived to `marketplace/_archive/signup.html` (this mounted folder can't
truly delete files, only rename - same constraint documented in
`fleet-v2/CLAUDE.md`). `login.html`'s "New to Dozr? Create an account" link
now reads "New to Dozr? Get in touch and we'll set up your account" →
`contact.html`. Client `login.html` + `js/auth.js` mock session stay as-is -
only the self-signup path was wrong, not sign-in itself.

## Client Sign in / Sign up added (2026-07-21, fifth pass)

afzl described the intended v1 launch shape: clients sign up/sign in on
Marketplace and request quotes; Ops staff coordinate manually for now but
need notifications, itemized vendor fleets, a quote builder with PDF
export, status updates, and revenue reporting in `ops/`. Ran an "act as a
user" walkthrough against that spec (not the original WhatsApp-native-only
spec) and rated it 4/10 - real scope change, not a bug list.

afzl chose to build client sign-in first, mock UI (no backend) - see
`marketplace/login.html`, `marketplace/signup.html`, `marketplace/js/
auth.js` (localStorage session, swaps nav to "Hi, {name}" once signed in).
Nav across all 8 client pages now has a distinct client "Sign in" pill,
separate from "Staff sign in" (internal, added in the third pass) - these
were previously conflated onto one button.

**Still open from the walkthrough, not yet built (afzl's prioritization,
not forgotten):**
- Ops: notifications/activity feed (Overview tab only has a 3-row
  escalations preview, not a real notification center)
- Ops: itemized vendor vehicle/equipment list (`vendors[].fleet` is a
  single summary string like "12 flatbeds, 4 low-beds", not a real list
  with plates/status/availability)
- Ops: quote builder + PDF export (doesn't exist anywhere in the repo)
- Ops: interactive status update on Job Detail (currently read-only -
  the pipeline strip shows the stage, nothing changes it)
- Ops: revenue/sales reporting beyond the static Billing tab snapshot
  (MRR/Outstanding/Overdue/Collected numbers exist, no trend over time)
- Marketplace: client account dashboard (quote history, order history) -
  correctly deferred as Phase 2 per `vendor_os_brief.txt`'s own phase table,
  sign-in/sign-up only for now

## Full-workflow audit (2026-07-21, fourth pass) - client journey has a real gap

afzl asked for an expert review of every user's workflow (not just a page
inventory) to confirm every step actually exists, not just every page. Two
findings held up under scrutiny; both explicitly deferred by afzl, not
fixed - logged here so this doesn't get lost:

- **`quote-approval.html` has no Decline path.** Only "Approve Quote" and
  "Ask a question" exist (`marketplace/js/quote-approval.js`). A client who
  wants to say no has nowhere to click. The original spec
  (`vendor_os_brief.txt` Section 3) has a dedicated `decline.html` -
  Marketplace never built an equivalent, on either page.
- **`tracking.html`'s status timeline stops at "Arrived on site."** It never
  shows ePOD signing or an invoice/payment step, even though `index.html`'s
  feature showcase and `about.html`'s value grid both explicitly promise
  "Prove delivery: driver + client sign on the phone" and "Get paid faster:
  invoice auto-generated on delivery." The Ops dashboard already models the
  full 13-stage pipeline through `Paid & Closed` (`ops/data/ops.js`
  `pipeline` array) - the client-facing side just never surfaces the last
  5 stages. This is a real inconsistency between what the site claims and
  what a client can actually do on it, not a cosmetic gap.

**Status: acknowledged, not scheduled.** afzl chose "not now, just note it"
over building any of the three options offered (Decline path only / all
three / defer). Next session that touches Marketplace's client flow should
either close this gap or get an explicit call that it's staying out of
scope - don't silently continue building around it.

Everything else audited clean: Client discovery/quote-request (index,
browse, freight, equipment-detail) complete. Vendor/Driver correctly
confirmed out of scope (afzl's own call, being built separately). Kasper Ops
staff journey (Overview/Vendors/Jobs/RFQs/Escalations/Billing + drill-downs)
matches the Operations Manual, including the stages tracking.html is
missing. Fleet's 9 screens confirmed complete (prior pass). All 21 pages
across the site verified with zero broken relative links.

## Ops expansion + new launcher (2026-07-21, second pass)

afzl asked for the dead "Open"/vendor-row actions to be wired up, plus a
single entry point across the internal tools. Three additions:

- **Escalations tab** added to `ops/index.html` (6 tabs now: Overview,
  Vendors, Jobs, RFQs, Escalations, Billing). Full L1/L2/L3 escalation log
  plus routing rules copied verbatim from Operations Manual Part 2 (the
  actual policy text, not paraphrased) - `ops/data/ops.js`'s `escalations`
  key.
- **`ops/job-detail.html` and `ops/vendor-detail.html`** - real drill-down
  pages, replacing the no-op "Open"/action buttons. Jobs tab and vendor rows
  in `ops/index.html` now link to these with `?job=` / `?id=` params.
  `ops/js/main.js` reads `data-page` on `<body>` (same dispatcher pattern
  `fleet-v2` uses) to decide whether to render the dashboard tabs or a
  detail page. `ops/data/ops.js` jobs gained `driver`, `clientContact`,
  `documents`, and `timeline` fields; vendors gained `phone`, `fleet`, and
  `documents` (trade license / insurance expiry mock data) to support this.
- **`dashboard/`** - new top-level folder, a single internal launcher page
  linking Ops, Fleet, and Marketplace (public site), with a disabled "Vendor
  OS - Not started" card so the deferred piece stays visible without being
  clickable. `ops/index.html`, `job-detail.html`, and `vendor-detail.html`
  each got a small "&larr; Dozr Dashboard" link back to it in the header.
  Own copy of the brand-token `:root` (same pattern as `ops/`, `fleet-v2/`,
  `marketplace/` each carrying their own stylesheet) - no shared CSS file
  across folders yet, that's a legitimate future cleanup, not a bug.

Verified: `node --check` on both ops JS files, no hardcoded hex outside
`:root` across all 4 new/changed HTML files, no duplicate IDs, CSS brace
balance on both stylesheets, and a relative-link resolution check
confirming every `href` in these files points at a file that actually
exists on disk.

**Not done yet:** same as above (brand-guardian, qa-accessibility-reviewer),
plus `dashboard/`'s links to `../fleet-v2/` and `../ops/` assume all three
folders stay siblings in one deploy - if Fleet/Ops end up on separate Vercel
projects with their own domains (like the original three MVPs were), these
links need to become absolute URLs instead. Flag before deploying.

## Expert audit + fixes (2026-07-21, third pass)

afzl asked for an expert review of everything built today (ops/, dashboard/,
marketplace additions) and to check whether images were needed. Ran a
dedicated audit (images/assets, accessibility, broken links, data integrity,
brand-token consistency, responsive coverage) and fixed every concrete
finding:

- **Images:** none of `ops/`, `dashboard/`, or `contact.html`/`about.html`
  had any image or asset references before this pass - all icons are inline
  SVG, which is fine for internal admin tools but left `about.html` looking
  thin next to `index.html`'s hero photo/video. Added one existing
  photo (`assets/categories/cranes.jpg`, already shipped with the site, no
  new asset generated) to `about.html`'s "Why we built this" section.
  `ops/`, `dashboard/`, and `job-detail.html`/`vendor-detail.html` also had
  no `<link rel="icon">` at all - added, all four now point at
  `marketplace/assets/favicon.svg` so internal tools don't show a blank tab
  icon.
- **Accessibility:** `--muted` (#8A8D93) failed WCAG AA (3.33:1 on white) -
  darkened to `#6B6E74` (5.11:1) in both `ops/css/styles.css` and
  `marketplace/css/styles.css` to keep the token in sync. `dashboard/`'s
  launcher-card titles were marked up as sibling `<h2>`s under an `<h2
  class="sr-only">` parent, flattening the heading outline - changed to
  `<h3>`. The disabled "Vendor OS" card used `aria-disabled="true"` on a
  plain `<div>`, which has no defined ARIA semantics on a non-interactive
  element - changed to `data-disabled="true"` (CSS selector updated to
  match) since the card was never focusable/interactive to begin with.
  `ops/index.html`'s 6 dashboard tabs had no roving-tabindex or arrow-key
  navigation - `bindTabs()` in `ops/js/main.js` now manages `tabindex`
  (0 on selected, -1 on others) and handles ArrowLeft/ArrowRight/Home/End,
  matching the standard ARIA tabs keyboard pattern.
- **Dead controls:** "+ Onboard vendor", "+ New RFQ", "Add vendor", "Close
  RFQ", "Receipt", and "Remind" all rendered as clickable buttons with zero
  event handlers - silently inert. Rather than leave them looking
  functional, applied the same `disabled` + explanatory `title` pattern
  already established in `marketplace/index.html`'s "Sign in soon" button
  (honest about no-backend state instead of faking interactivity). The Jobs
  tab's Stage filter `<select>` was dead (never read by JS, single static
  option) - actually wired up: populated from the `pipeline` array, filters
  the jobs table via a `data-stage` attribute on each row.
- **Data integrity:** re-verified after the last dummy-data pass and found
  4 real bugs, all fixed in `ops/data/ops.js`: three jobs (`DZR-J-1034`,
  `-1035`, `-1036`) had a `stage` index that contradicted their own
  `timeline`/`price` text - corrected to match. `billing.summary`'s
  "Overdue >14d" label didn't match any actual invoice (2 of the 4 "Overdue"
  invoices had future due dates relative to `lastUpdated`, and neither
  genuinely-overdue invoice was more than 14 days late) - fixed the two
  invoice statuses to "Pending" and relabeled to "Overdue" (2 invoices,
  AED 21.0k) without the unsupported ">14d" claim. "Resolved today: 7" only
  had one entry actually timestamped today - relabeled "Resolved" with an
  honest "Logged over the last 9 days" note. MRR's "11 active vendor plans"
  overcounted by one (10 vendors have `active: true`) - corrected.
- **Consistency:** confirmed no color-token drift across `ops/`,
  `dashboard/`, and `marketplace/` `:root` blocks (all 8 shared tokens byte-
  identical) - flagged as fine, no fix needed.

Verified: `node --check` on both ops JS files, no hardcoded hex outside
`:root` and no duplicate IDs across all 6 touched HTML files, CSS brace
balance on all 3 stylesheets, and every relative `href`/`src` in these files
confirmed to resolve to a real file on disk (including the new image and
favicon references).

## Figma review (2026-07-21) - old Kasper admin backend, legacy scope

afzl shared 12 screens from a pre-rebrand Kasper admin backend Figma
(`node-id=1398-1994`, black/green theme - not Dozr tokens, IA reference
only). Content: Category/Sub-Category/Brand/Unit/Item Master (product
catalog CRUD) plus a Transactions chain (RFQ from customer -> RFQ to
supplier -> Quotation from supplier -> Quotation to customer -> Sales Order)
and Reports (Sales day book). Nav bar included a standalone "Materials" tab
alongside "Rent", and footer categories (Steel, TMT Bars, Cement, Bricks,
Sand & Aggregates, etc.) confirm this was a **materials-trading vertical**,
not equipment rental/freight.

**Confirmed with afzl: Materials Trading is legacy, not a current priority.**
Nothing in `LOGISTICS/02_Product/` scopes it and no phase should be opened
for it. Not deleting the Figma reference, just not building against it.

**Backlog item (not scheduled):** the Category/Brand/Unit/Item Master
pattern in those screens is also the obvious long-term fix for
`marketplace/data/equipment.js` being a hardcoded array - a generic (not
materials-specific) catalog-admin surface that Marketplace and any future
vertical could both read from. Confirmed with afzl this is worth its own
scoped item later, but not in progress now - don't start building it without
a product doc + phase entry first, same process as everything else.

## Ops: Supabase backend + full nav restructure (2026-07-22)

Building on the "New surface: Kasper internal ops dashboard" section above -
`ops/` is no longer mock-only for every table. In order:

- **Supabase wired in for Vendors and Assets** (`ops/supabase/migrations/`,
  0001-0005): real tables for `vendors`, `equipment`, `rfqs`,
  `rfq_vendor_quotes`, `jobs`, `invoices`, `escalations`, staff auth scaffold
  (built, then intentionally left disabled - see below). "+ Onboard vendor"
  and equipment/vehicle add (with photo upload to a Storage bucket +
  availability toggle) are real, persisted writes now, not mock data.
- **Staff auth built but turned off** (afzl's call: "sign in not needed for
  now"). `ops/login.html` and `ops/js/auth-guard.js` still have the real
  Supabase auth code, just commented out/short-circuited with a note on how
  to re-enable. RLS was correspondingly opened up
  (`0003_temp_open_access.sql`, `0005_temp_open_storage.sql`) - anyone with
  the anon key (public in `ops/js/supabase-client.js`) has full read/write
  right now. Fine for an internal unlisted URL during build, flagged as
  not-launch-safe.
- **Jobs/RFQs/Billing are still mock data** (`ops/data/ops.js`) - not
  migrated to Supabase yet. Kanban stage changes are staff-editable
  (dropdown per card, afzl's call over drag-and-drop) but only update
  in-memory state, not persisted - flagged in the UI itself and here so this
  doesn't get mistaken for a working feature.
- **Nav fully reordered and renamed** per afzl's priority order: Enquiries
  (new landing tab, replaces Overview - shows unsent enquiries with a
  Logistics/Equipment Rental filter) -> Kanban (renamed from Jobs, kanban is
  now the default view with Table as a secondary toggle, 13 stages grouped
  into 6 columns) -> Assets -> Vendors -> RFQs -> Billing -> Reports (new -
  total enquiries, confirmed, revenue, and vertical breakdown; profit
  explicitly not shown - no vendor-cost field exists per job yet, afzl's
  standing preference is an honest gap over a guessed number).
- **Logistics vs Equipment Rental** is inferred client-side from each job's
  free-text `type` field (flatbed/low-bed/box-truck -> logistics, everything
  else -> equipment) - matches Marketplace's existing Browse/Freight split.
  Not a real schema field yet; worth adding a proper `vertical` column once
  jobs move to Supabase.
- **Removed from Overview/Enquiries entirely per afzl:** the "Open
  escalations" panel and "Daily checklist - Morning" panel. Both tabs/data
  still exist in `ops/data/ops.js`, just unrendered - same treatment the
  standalone Escalations tab already got.

**Not done yet, flagged, not forgotten:** Jobs/RFQs/Billing on Supabase (so
kanban changes actually persist), re-enabling staff auth + locking RLS back
down, a real `vertical` column instead of the keyword-guess, and a vendor
cost field so Reports can show real profit instead of "—".

## Delete actions + dummy data trimmed (2026-07-22)

afzl asked for two things mid-build: a Delete option (not just deactivate),
and far less mock data cluttering the demo.

- **Delete added:** Vendors tab and the central Assets tab both got a real
  "Delete" button next to the existing soft-delete controls (Vendors'
  status toggle, Assets' "Turn off"). Same on the per-vendor Equipment panel
  on `vendor-detail.html`. All three confirm via `window.confirm` first,
  then call Supabase `.delete()` - vendor delete cascades to that vendor's
  equipment automatically (FK `on delete cascade`, already in
  `0001_init.sql`, no new migration needed for that part).
- **Mock data trimmed** in `ops/data/ops.js`: vendors 12->5, jobs 20->5,
  RFQs 10->5, billing invoices 12->5, escalations log 10->4 - kept for
  status/stage variety (active/deactivated/pending vendor, one flagged job,
  one of each vertical, a Paid/Pending/Overdue invoice spread) rather than
  arbitrarily keeping the first N. The unused `overview` object (dead since
  Enquiries started computing its own numbers from `DATA.jobs` directly)
  was deleted outright, not just trimmed.
- `ops/supabase/migrations/0007_seed_jobs.sql` updated to match the same 5
  trimmed jobs (was 20) - if the old version already ran against your
  Supabase project, `truncate table jobs;` before re-running it, noted in
  the file itself.

**Still open:** Jobs/RFQs/Billing are still `ops/data/ops.js` mock data, not
Supabase - migration 0006/0007 added the schema + seed for jobs, but
`ops/js/main.js`'s Enquiries/Kanban/Reports rendering hasn't been switched
over to read from Supabase yet. That's the next piece, not done in this pass.

## Jobs moved to Supabase + Marketplace equipment mirrored into ops (2026-07-22)

Closes the "still open" item from the last entry.

- **Jobs are live.** Enquiries, Kanban, and Reports all read from Supabase's
  `jobs` table now (`loadJobsFromSupabase()` in `ops/js/main.js`), not
  `ops/data/ops.js`. The kanban stage `<select>` writes to Supabase on
  change (optimistic UI, reverts the dropdown if the write fails) - stage
  changes now survive a refresh, closing the gap flagged last entry.
  `job-detail.html` and the mock-vendor job-history panel on
  `vendor-detail.html` intentionally still read `ops/data/ops.js` directly -
  not migrated this pass, same 5 job codes exist in both places so links
  between them keep resolving.
- `0006_jobs_extra_fields.sql` added `type`, `vendor_name` (denormalized,
  same pattern `price` already used - not every job's vendor has a matching
  Supabase row), and a real `vertical` column (replaces the client-side
  keyword guess for any job that has one - `jobVertical()` in main.js now
  checks `job.vertical` first, falls back to the keyword guess only for
  mock data that predates the column).
- `0007_seed_jobs.sql` seeds the same 5 trimmed jobs into Supabase.
- **Marketplace's public equipment catalog mirrored into ops**
  (`0008_seed_marketplace_equipment.sql`, afzl's call: "whatever assets in
  the front end should be there in back end"). All 15 units from
  `marketplace/data/equipment.js` inserted into the real `equipment` table.
  Real problem hit doing this: every unit needs a `vendor_id` (not null),
  but Marketplace deliberately never shows which vendor owns a unit (afzl's
  rule: don't share vendor details with clients). No real per-unit vendor
  mapping exists, so all 15 went under one placeholder vendor, "Dozr
  Verified Fleet" - flagged in the migration file itself so this isn't
  mistaken for real vendor data. Reassigning individual units to their real
  vendor needs an edit action that doesn't exist yet (Assets page only has
  add/delete, no edit).
- Added a `dump-truck` category option to both the Assets and per-vendor
  equipment "Add" forms - Marketplace's dump-truck listings didn't map to
  any existing option.
- **Delete added**, not just deactivate: Vendors tab, Assets tab, and the
  per-vendor Equipment panel all got a real "Delete" button (confirms via
  `window.confirm` first). Vendor delete cascades to that vendor's equipment
  (FK `on delete cascade`, already in `0001_init.sql`).

**Still open:** RFQs and Billing remain mock data. `job-detail.html`/mock
vendor job-history still on `ops/data/ops.js`. No "edit vendor on an asset"
action yet - needed before the Marketplace-mirrored equipment can be
reassigned off the placeholder vendor.
