# Dozr Marketplace â€” Build Roadmap

Reverse-engineered from `LOGISTICS/02_Product/01_Kasper_Marketplace.docx` (the
real job-flow spec) plus the finalized brand guidelines. This is the order of
operations from here to a shippable v1 of the Marketplace site, and which
`.claude/agents/` specialist owns each step. Update the checkboxes as phases
complete â€” this file is the single source of truth for "what's next."

Scope for this round: the **Marketplace** product only (client-facing
equipment rental + freight booking). Vendor OS and Fleet/Telematics get the
same process, later â€” see "Later" section at the bottom.

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

## Later (explicitly out of scope this round)

- Vendor OS site rebuild - same process, after Marketplace ships
- WhatsApp API (360dialog) upgrade from deep links
- Lead-magnet content asset (a la TruKKer's "Gulf Freight Playbook") for SEO/trust
- Ops dashboard and vendor portal UIs (internal tools, not part of the public Marketplace site)
