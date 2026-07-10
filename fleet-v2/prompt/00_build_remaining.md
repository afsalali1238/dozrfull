# Dozr Fleet v2 - build the remaining 8 screens

**Target tool:** AI coding assistant (Claude Code, Cowork, Cursor, or similar - writes real files directly)
**Working folder:** `fleet-v2/` (all output goes here - do not touch `fleet/`, it is the old build kept for reference only)

---

Copy everything below into your coding assistant to continue the Dozr Fleet v2 rebuild.

---

Build the remaining 8 screens of the Dozr Fleet v2 dashboard, one page at a
time, fully finishing and reviewing each before moving to the next. Fleet
Map (`fleet-v2/index.html`) is already built and approved - use it as the
pattern for shell, tone, and density on every page below.

## Read first, in this order

1. `fleet-v2/CLAUDE.md` - this folder's decisions and conventions. Pay
   attention to the "Platform note" section near the bottom about silent
   file truncation in this mounted folder - it is not fixed, it can still
   happen, and the workaround there (bash heredoc writes, verify byte counts
   after a delay, keep new content plain ASCII) is mandatory for every file
   you touch in this session, not optional.
2. Root `CLAUDE.md` and `ROADMAP.md`'s "Fleet/Telematics Rebuild" section -
   brand tokens, phase history, why this folder exists instead of `fleet/`.
3. `fleet-v2/index.html` plus `fleet-v2/css/styles.css`, `fleet-v2/js/main.js`,
   and `fleet-v2/data/fleet.js` - the actual shell, tokens, and data shape
   you are extending. Every new page reuses this CSS file (add to it, do not
   fork it) and this data file (add new top-level keys, do not duplicate
   asset records).
4. `fleet/` (the old build, one level up - i.e. `fleet/fuel.html`,
   `fleet/maintenance.html`, `fleet/geofences.html`, `fleet/utilisation.html`,
   `fleet/cost-roi.html`, `fleet/reports.html`, `fleet/timesheet.html`,
   `fleet/alerts.html`) - these are already-built Dozr-branded versions of
   every page below. Use them as your primary layout/copy/data-shape
   reference, the same way `fleet-v2/index.html` used the live reference
   site for Fleet Map. Do not copy them byte for byte - `fleet-v2` uses a
   different nav shell (grouped Operate/Monitor/Analyze sidebar) and asset
   IDs are `DZR-` not `KSP-`.
5. `fleet/UI_AUDIT.md` and `fleet/QA_AUDIT.md` - specific, already-diagnosed
   problems in the old build. Apply the fixes below while porting each page,
   do not reintroduce them:
   - Maintenance: the old page showed two summary rows with contradicting
     numbers for the same concept (Due This Week vs Due Soon). Build one
     summary row, or make the two concepts unambiguously different.
   - Any "list of all assets + a metric" pattern (Fuel's per-asset cards,
     Cost & ROI's per-asset costs, Utilisation's per-asset bars): reuse
     `fleet-v2/css/styles.css`'s `.asset-panel` / `.asset-item` pattern
     already established on Fleet Map, do not invent a third layout for the
     same kind of data.
   - Geofences: do not nest panel-inside-panel-inside-panel. One level of
     nesting max.
   - Reuse the already-corrected `--green` (#146447) and `--error` (#A22424)
     tokens in `fleet-v2/css/styles.css` for any status/contrast color - do
     not reintroduce the lighter originals from `Dozr_Brand_Guidelines.html`.
6. `https://telematics-flame.vercel.app/` - click through the matching tab
   for whichever page you are building, to see the original IA this whole
   product traces back to. Repo (single `index.html`, useful for exact
   copy/data-field names): `https://github.com/afsalali1238/telematics`.

## Build order and what each page needs

Work through these in order. Each one adds its data to
`fleet-v2/data/fleet.js` immediately before it's built, not ahead of time.

1. **Fuel** (`fleet-v2/fuel.html`) - reference `fleet/fuel.html` +
   telematics-flame's Fuel tab. Per-asset fuel cards (level bar, rate,
   today's consumption), a fleet fuel summary strip, fuel theft detection
   callout if the reference still shows one. Add `fuelToday`, `fuelRate`
   details per asset if not already present.
2. **Maintenance** (`fleet-v2/maintenance.html`) - reference
   `fleet/maintenance.html`, but fix the duplicate-summary issue from
   `UI_AUDIT.md` (see above) while porting it. Add a `maintenance[]` array
   to `data/fleet.js` (service item, last/due/current hours, status) - the
   shape already exists in `fleet/data/fleet.js`, port it over.
3. **Geofences** (`fleet-v2/geofences.html`) - reference
   `fleet/geofences.html`. Zone manager list, entry/exit event log. Add a
   `geofences[]` array if the existing one in `data/fleet.js` needs more
   fields (hours, shape, color).
4. **Utilisation** (`fleet-v2/utilisation.html`) - reference
   `fleet/utilisation.html`. Working/idle/off breakdown per asset, 7-day
   trend. One asset-metric pattern (see fix list above), not three.
5. **Cost & ROI** (`fleet-v2/cost-roi.html`) - reference
   `fleet/cost-roi.html`. Net savings hero, ROI multiple, cost-per-asset
   breakdown, savings trend.
6. **Reports** (`fleet-v2/reports.html`) - reference `fleet/reports.html`.
   Available report cards + recently-generated table. Keep Dozr's own
   6-report list (Daily Utilisation, Fuel Consumption, Maintenance
   Schedule, Operator Performance, ESG Emissions, Client Site Report) -
   this was already a deliberate decision in the old build, do not swap in
   the tour's report names.
7. **Timesheet** (`fleet-v2/timesheet.html`) - reference
   `fleet/timesheet.html`. Driver-centric table: driver, vehicle, shift
   start/end, moving/idle/stopped hours, mini stacked-bar per row. Add a
   `drivers[]` array to `data/fleet.js`.
8. **Alerts Center** (`fleet-v2/alerts.html`) - reference
   `fleet/alerts.html`. Every asset's alerts in one severity-tiered feed
   (critical/warning/info/ok), reusing the `.event-item[data-severity]`
   pattern already built for Fleet Map's Active Alerts tab - do not invent
   a second alert-rendering pattern for this page.

## Shared rules across every page

- Brand tokens only (`var(--ink)`, `var(--yellow)`, etc. from
  `fleet-v2/css/styles.css`'s `:root`) - never a hardcoded hex. Flag
  anything the token set doesn't cover instead of inventing a color.
- One shared sidebar/header, byte-for-byte identical across all 9 pages
  aside from the active-nav `aria-current` and page title/h1. Grouped nav
  (Operate/Monitor/Analyze) - see any current stub page for the exact markup
  to copy.
- Semantic HTML: real `<button>`/`<a>`, real `<table>` with `<th scope>`
  for data tables, `<label for>` on every input, `aria-live` on anything
  that auto-updates.
- Keep new content plain ASCII (no em dashes, curly quotes, emoji) per the
  platform note above - use plain hyphens, and inline SVG icons instead of
  emoji where the design calls for an icon (see the search-field icon in
  `fleet-v2/index.html` for the pattern).
- Write every file via a `bash` heredoc, not the editor's inline edit
  feature, and verify the byte count/tail immediately after and again a few
  seconds later before moving to the next file.

## After all 8 pages are built

- Update `ROADMAP.md`'s "Fleet/Telematics Rebuild" section and
  `fleet-v2/CLAUDE.md`'s "Next checkpoint" note to reflect that all 9 pages
  are now real, not stubs.
- Run a full verification pass before calling it done: `node --check` on
  `js/main.js` and `data/fleet.js`, an HTML tag-balance + duplicate-id check
  across all 9 pages, and a broken-internal-link check. Do not skip this -
  it is what caught the truncation bug last time.
