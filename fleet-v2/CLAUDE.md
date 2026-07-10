# Dozr Fleet v2 — fresh rebuild

Started 2026-07-10. Supersedes `../fleet/` (afzl's call: the multi-page
rebrand in that folder was brand-token-correct and accessible per its own
audits, but wasn't landing visually — "still not looking great"). This
folder is a from-scratch rebuild, not a copy/patch of `../fleet/`.

## Decisions made before this folder was scaffolded

- **Reference:** `https://telematics-flame.vercel.app/` (repo:
  `github.com/afsalali1238/telematics`) — pulled directly, it's a single
  `index.html` (~1040 lines, vanilla JS SPA, IBM Plex Mono/Sans, orange
  accent, dark ops-console density). Treated purely as an IA/layout/copy
  reference, same rule `../fleet/CLAUDE.md` used — nothing copied verbatim,
  no orange, no IBM Plex.
- **Architecture — multi-page, confirmed with afzl.** The reference is a
  single-page app (JS tab-switching, one persistent shell). Considered
  matching that, but afzl chose to **keep multi-page** (separate HTML per
  screen), consistent with `marketplace/` and the rest of this repo. Don't
  revisit this without asking again.
- **Build pacing — Fleet Map first, then stop for review.** Per root
  `CLAUDE.md` ("Claude's role is research/wireframes/review, not unilateral
  execution"), this pass builds the shared shell + all 7 nav destinations
  as real files, but only **Fleet Map (`index.html`) is fully built**. The
  other 6 are stub pages (shared header/sidebar, "not yet rebuilt" body) so
  navigation works end-to-end without implying finished screens. Don't build
  Fuel/Maintenance/Geofences/Utilisation/Cost & ROI/Reports without asking
  first — that's the next checkpoint.

## What was carried over from `../fleet/` (the good parts, per audits)

- `css/styles.css` — base tokens, `.app-layout`/`.app-sidebar` nav shell,
  `.stats-grid`/`.summary-grid` (already using `auto-fit`, the exact fix
  `../fleet/UI_AUDIT.md` recommended for the old fixed-5-column grid), CAN
  gauge component, status-chip color semantics. Extended (not rewritten)
  with `.fleetmap-grid`, `.asset-panel`, `.map-legend`, `.map-marker` for
  this page. `--green`/`--error` already the contrast-corrected values
  (`#146447`/`#A22424`), not the lighter guideline-doc originals.
- `data/fleet.js` shape (assets/sites/geofences/events/alertsFeed) — same
  field structure as `../fleet/data/fleet.js`, sized down to only what
  Fleet Map + the Alerts/Event Log tabs need (no trips/maintenance/reports/
  drivers yet — add those back when their pages get built, not before).
- Real Dozr crane/pin logo mark (`assets/favicon.svg`), not a placeholder.

## What changed from `../fleet/`

- **Asset IDs rebranded `KSP-` → `DZR-`.** The old data still carried Kasper
  asset-ID prefixes post-rebrand — fixed here, don't reintroduce `KSP-`.
- **One "all assets" pattern, not three.** `../fleet/UI_AUDIT.md` flagged
  Fleet Map/Cost-ROI/Utilisation each rendering "list of 8 assets + a
  metric" differently. This folder's asset-list panel (`.asset-panel` /
  `.asset-item`) is meant to be the one pattern reused everywhere a future
  page needs it — don't invent a second one on Fuel/Utilisation/Cost-ROI.
- **IA pulled from the reference, not from `../fleet/index.html`:** a
  dedicated asset-list column, a live map with status-colored markers +
  geofence zones, a right-hand detail panel that fills on click, and a
  bottom tabbed panel (Active Alerts / Event Log). The old `../fleet/`
  Fleet Map was closer to a stats-and-list page; this is closer to an
  actual ops console, which is what afzl said was missing.

## Conventions (same non-negotiables as `../fleet/` and `../marketplace/`)

- Brand tokens only — no hex outside `:root`, no font outside Space
  Grotesk/Hanken Grotesk/Space Mono.
- Real semantic HTML: `<button>` not `<div onclick>`, `<label for>` on every
  input, `<th scope>` on tables, `aria-live` on the alerts feed, single
  `<h1>` per page (screen-reader-only), `aria-current="page"` on the active
  nav link.
- One shared sidebar/header markup, byte-for-byte identical across all 7
  pages including the stubs.

## Next checkpoint

Show afzl `index.html`. If the direction lands, continue in this order
(same as `../fleet/`'s original build order): Fuel → Maintenance →
Geofences → Utilisation → Cost & ROI → Reports — each one gets its data
added to `data/fleet.js` immediately before that page is built, not ahead
of time.

## Second pass (2026-07-10) — ported more from fleet/

afzl asked to check `../fleet/` again and reuse more of it before building
further. Two things ported from `../fleet/index.html` into this pass:

- **Grouped nav taxonomy.** `../fleet/` organizes its 9 destinations into
  Operate / Monitor / Analyze, not a flat list — and it has 9 pages, not 7
  (this folder was missing Timesheet and Alerts Center). Matched both: nav
  is now grouped on all 9 pages, and `timesheet.html` / `alerts.html` exist
  as stubs alongside the other 6. Correction to the "Conventions" section
  above: it's 9 pages now, not 7, still byte-for-byte identical shared
  nav/header markup across all of them.
- **Trip History & Playback modal.** `../fleet/index.html` has a real
  `<dialog>` with vehicle/date select, route map, and a play/pause scrubber
  (its own audit trail shows the Play button was found dead and fixed with
  a proper `setScrubberPercent()`-driven animation — a validated pattern,
  worth reusing as-is rather than re-deriving). Ported the same shape into
  `index.html` here, opened via a "Route Replay" button on the map and,
  as a small improvement, also via a "View Route Replay" button that
  appears in the asset detail panel once an asset with trip data is
  selected — `../fleet/`'s version only opened from one place. Trip data
  (`route`, `distance`, `startTime`/`endTime`) added to 3 sample assets in
  `data/fleet.js` (DZR-001, DZR-002, DZR-004).

### Platform note — silent truncation in this mounted folder

Every `Edit` tool call in this session silently truncated its target file
(css/styles.css, data/fleet.js, js/main.js, index.html, all 6 original stub
pages, and the root `ROADMAP.md`), the same failure mode `../fleet/
QA_AUDIT.md` already documented for this mounted folder. Every truncation
point sat near a multi-byte UTF-8 character (emoji, em dash, middle dot) —
not proven causal, but consistent enough to treat as a real signal.

Fix used, and the standard to keep using in this folder going forward:
- Reconstruct the full intended file content (don't try to patch just the
  missing tail — you can't be sure how much was lost).
- Write it via a `bash` heredoc (`cat > file << 'EOF' ... EOF`), not `Edit`
  or `Write`.
- Verify with `wc -c` / `tail -c` immediately after, then again after a few
  seconds' delay, before trusting the write.
- Keep new content plain ASCII where practical (search icon is now an
  inline SVG instead of an emoji, dashes are plain hyphens, `km²` became
  `sq km` in the data file) — cheap insurance even if not the root cause.

## Next checkpoint

Unchanged: show afzl `index.html`. If the direction lands, continue in this
order: Fuel, Maintenance, Geofences, Utilisation, Cost & ROI, Reports,
Timesheet, Alerts Center — each page gets its data added to `data/fleet.js`
immediately before it's built, not ahead of time.

## Third pass (2026-07-10) - Fuel page built

Fuel is now fully built (`fuel.html`): summary strip + per-asset fuel cards,
data added to `data/fleet.js` under a `fuel` key (summary + assets array),
rendering wired into `js/main.js` via a `data-page` attribute on `<body>` and
a `renderPageContent()` dispatcher called from `DOMContentLoaded`. This
`data-page` pattern is the one to extend for every future page (add a
`render<Page>Page()` function, add one `if (page === "x")` line) rather than
inventing a new wiring approach per page.

### Platform note update - Edit tool desync, not just truncation

A second, related failure mode showed up this pass, worth distinguishing
from the original truncation note above: an `Edit` tool call on `js/main.js`
reported success and the `Read` tool showed the fully-correct file content
afterward - but `bash`/`node --check` on the same path saw a file truncated
mid-statement at the old byte length. The tool's own view of the file and
what is actually on disk in this mounted folder can disagree. Don't trust
`Edit` success alone as confirmation - always verify with `node --check` (or
an equivalent parser) via `bash` after any edit in this folder, not just
after `Write`/heredoc writes. If bash disagrees with what Edit/Read reported,
treat bash as ground truth and rewrite the full file via heredoc.

## Next checkpoint

Fuel is done and verified (`node --check` on both JS files, HTML structure +
duplicate-id + broken-link check across all 9 pages, CSS brace balance).
Remaining stubs, same order as before: Maintenance, Geofences, Utilisation,
Cost & ROI, Reports, Timesheet, Alerts Center - each page gets its data added
to `data/fleet.js` immediately before it's built, not ahead of time. Ask
afzl before starting Maintenance, per the checkpoint process.

## Fourth pass (2026-07-10) - Maintenance built, out-of-scope corruption fixed

Maintenance is now fully built (`maintenance.html`): one summary-grid (not
two - the specific bug flagged in `fleet/UI_AUDIT.md` for the old build),
one panel with a schedule table. `data/fleet.js` got a `maintenance` key
(summary + items) right after `fuel`, `js/main.js` got `renderMaintenancePage()`
and one added line in `renderPageContent()` - same pattern as Fuel.

### Platform note - worse than truncation this time

The build attempt this pass touched all 6 remaining stub pages (alerts,
cost-roi, geofences, reports, timesheet, utilisation), not just Maintenance,
despite the build prompt explicitly saying "don't touch any other page."
`data/fleet.js`, `js/main.js`, and `maintenance.html` were also cut mid-write
(same failure mode as before). Four of the untouched-on-purpose pages came
back with **null-byte padding** (`\x00` filling the remainder of the file up
to its old byte length) rather than a clean cut - worse than the plain
truncation documented earlier, and only caught by reading the raw bytes
(`open(f, 'rb').read().count(b'\x00')`), not just `wc -c` or a text read.

Fix applied: reverted all 6 out-of-scope pages to the clean stub template
(don't build pages that weren't asked for, even to "fix" them - revert to
last-known-good instead), reconstructed `maintenance.html` +
`data/fleet.js` + `js/main.js` from the last known-good state plus the
intended Maintenance addition, verified with `node --check` and a raw
null-byte scan across every file in the folder, not just the ones that were
supposed to change.

**Standing instruction going forward:** after any external build pass in
this folder, scan every file for null bytes and re-run `node --check` /
structure checks on the whole folder, not just the files that were
supposedly touched - a build tool here has now corrupted files it wasn't
even asked to touch, twice.

## Next checkpoint

Maintenance is done and verified. Remaining stubs: Geofences, Utilisation,
Cost & ROI, Reports, Timesheet, Alerts Center - each page gets its data
added to `data/fleet.js` immediately before it's built, one page per pass,
per the Working mode section above. Ask afzl before starting Geofences.

## Fifth pass (2026-07-10) - Geofences built by Claude directly

afzl asked Claude to build this one directly rather than route it through
an external tool - same verification bar applies regardless of who writes
the file. `geofences.html`: Geofence Manager panel containing a `map-card`
(static SVG map + a nested Zones panel - two levels), Recent Events as a
separate sibling panel below, not nested inside Zones (the fix
`fleet/UI_AUDIT.md` called for). `data/fleet.js` got a `geofences` key
(summary/zones/events) after `maintenance`. `js/main.js` got
`renderGeofencesPage()` plus one line in `renderPageContent()`. `css/
styles.css` got one additive rule, `.metric-line`, appended at the end (it
didn't exist yet and multiple pages now need it).

Verified: `node --check` both JS files, null-byte scan across every file in
the folder (not just the touched ones), structure/dup-id/broken-link check
on all 9 pages, CSS brace balance, and confirmed every untouched file's
byte size matched its pre-build size exactly.

## Next checkpoint

Geofences is done and verified. Remaining stubs: Utilisation, Cost & ROI,
Reports, Timesheet, Alerts Center - one page per pass, per Working mode.
Ask afzl before starting Utilisation.

## Sixth pass (2026-07-10) - Utilisation built, fuel-card-grid bug fixed

Caught during review, not something afzl flagged: `.fuel-card-grid` /
`.fuel-card` were used in `fuel.html` and `renderFuelPage()` but had **no
CSS rules at all** - the Fuel cards were never actually laid out as a grid,
just default block flow. Generalized into `.metric-card-grid` /
`.metric-card` (added to `css/styles.css`), retrofit `fuel.html` and
`renderFuelPage()` to use the new names, and reused the same pattern for
Utilisation's per-asset breakdown - this also satisfies the
`fleet/UI_AUDIT.md` "pick one asset+metric pattern" fix instead of adding a
third layout. `.metric-card-grid`/`.metric-card` is now the one pattern for
"list of all assets with a metric" - reuse it for Cost & ROI's per-asset
costs too when that page's turn comes, don't invent a fourth.

`data/fleet.js` got a `utilisation` key (summary/assets/trend) after
`geofences`. `js/main.js` got `renderUtilisationPage()` plus one line in
`renderPageContent()`. The trend chart is a hand-drawn static SVG path, not
plotted from the `trend` array - flagged directly in the page copy
("Illustrative trend line, not plotted from live data") per the audit note
that this is fine for the mock-data stage as long as nobody mistakes it for
real.

Verified: `node --check` both JS files, null-byte scan across every file,
structure/dup-id/broken-link check on all 9 pages, CSS brace balance,
confirmed every file outside this pass's scope (alerts, cost-roi, index,
maintenance, geofences, reports, timesheet) matched its pre-build size.

## Next checkpoint

Utilisation is done and verified. Remaining stubs: Cost & ROI, Reports,
Timesheet, Alerts Center - one page per pass, per Working mode. Cost & ROI
should reuse `.metric-card-grid`/`.metric-card` for its per-asset costs
(see note above). Ask afzl before starting Cost & ROI.

## Seventh pass (2026-07-10) - nav moved from left sidebar to header

afzl asked to move navigation into the header instead of a left sidebar,
matching the original `telematics-flame.vercel.app` reference (confirmed by
fetching the live site - it uses a flat horizontal nav row in the header,
no left sidebar, no Operate/Monitor/Analyze grouping). This is a real
architecture change from every prior pass in this file, applied across all
9 pages at once (not one-page-per-pass, since it's a shared-shell change,
not a page-content change).

What changed:
- `css/styles.css`: removed `.app-layout`/`.app-sidebar` (200px grid +
  fixed drawer), replaced with `.app-shell` (single column) and `.top-nav`
  (flex-wrap horizontal link row inside `.app-header`). Removed
  `.nav-group-label` (no longer used - nav is flat, not grouped).
  Mobile: `.top-nav` collapses to `display:none` under 1150px and toggles
  open via the existing `#nav-toggle` button, same interaction pattern as
  before, different target element.
- All 9 pages: `<nav class="app-sidebar">...</nav>` removed, links moved
  into a `<nav class="top-nav" id="top-nav">` inside `<header
  class="app-header">`. Nav order kept from the old grouping (Fleet Map,
  Timesheet, Fuel, Maintenance, Geofences, Alerts Center, Utilisation,
  Cost & ROI, Reports) even though the group labels themselves are gone -
  closest match to the reference's flat list while keeping our 9 pages (the
  reference only has 7 - no Timesheet/Alerts Center).
- `js/main.js`: `bindNavToggle()` now targets `#top-nav` instead of
  `#app-sidebar` for the `data-open` toggle.
- Every page's `<main class="app-main" id="main-content">...</main>` block
  (the actual page content built in prior passes) was extracted and
  reinserted verbatim - Fleet Map, Fuel, Maintenance, Geofences, and
  Utilisation's real content is unchanged, only the shell around it moved.

Verified: `node --check` both JS files, null-byte scan across every file,
structure/dup-id/broken-link check on all 9 pages plus an explicit check
for leftover `app-sidebar` references (found none), CSS brace balance.

## Next checkpoint

Nav-in-header is done and verified across all 9 pages. Remaining stubs:
Cost & ROI, Reports, Timesheet, Alerts Center - one page per pass, per
Working mode. New pages should build directly into the `.app-shell` /
`.top-nav` header pattern, not the old sidebar. Ask afzl before starting
Cost & ROI.

## Eighth pass (2026-07-10) - remaining 4 pages built, site complete

afzl asked to push dummy data through to see the whole site. Built all 4
remaining pages in one pass rather than one-per-checkpoint, since the goal
was "see how it looks" end-to-end rather than incremental review:

- Cost & ROI: summary-grid, a hero "savings story" panel, per-asset costs
  using `.metric-card-grid`/`.metric-card` (the established reusable
  pattern - third page to use it now, alongside Fuel and Utilisation),
  6-month trend chart flagged as illustrative (same static-SVG caveat as
  Utilisation's trend).
- Reports: summary-grid, available-reports grid (new `.report-grid` CSS
  rule - auto-fit, didn't exist before), recent-reports table.
- Timesheet: summary-grid, driver activity table.
- Alerts Center: summary-grid, active alerts feed + routing rules panel
  side by side (new base rule for `.sidebar-layout` added - only the
  mobile override existed before, the desktop two-column grid rule was
  missing entirely).

`data/fleet.js` got `costRoi`, `reports`, `timesheet`, `alerts` keys, all
appended after `utilisation`. `js/main.js` got the four matching render
functions and four new lines in `renderPageContent()`.

Two more missing-CSS gaps caught during this pass (same class of bug as
the `.fuel-card-grid` one from the Utilisation pass): `.report-grid` and
the base (non-media-query) `.sidebar-layout` rule didn't exist. Both added.
Worth a standing habit: before wiring a new class into HTML/JS, grep
`css/styles.css` for it first.

Verified: `node --check` both JS files, null-byte scan across every file,
structure/dup-id/broken-link check on all 9 pages, CSS brace balance. Zero
placeholder stubs remain in the folder - all 9 pages are real.

## Next checkpoint

The full 9-page fleet-v2 site is built. No open build item right now -
next steps are afzl's review/feedback, then either polish passes on
existing pages or new functionality, not new stub pages (there aren't any
left).

## Working mode (confirmed 2026-07-10)

afzl builds each page himself (in his own tool). Claude's job is reviewer/
fixer, not builder: check what lands here against brand tokens, the shared
shell, and the `UI_AUDIT.md`/`QA_AUDIT.md` fixes noted in the build prompt -
then verify (`node --check` on both JS files, HTML structure/dup-id/broken-
link check, CSS brace balance) and fix anything broken directly, the same
way the Fuel page truncation got caught and fixed this pass. Don't build a
page fresh unless explicitly asked to.
