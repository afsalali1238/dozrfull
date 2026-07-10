# Maintenance page build

**Target tool:** whatever you're building with (Claude Code, Cursor, VS Code
Copilot, etc.)
**File being built:** `fleet-v2/maintenance.html` (currently a stub)
**Folder:** `fleet-v2/` inside the Dozr repo

---

Copy everything below into your coding tool.

---

Build `fleet-v2/maintenance.html` for the Dozr project.

## Read first

1. `fleet-v2/CLAUDE.md` — all of it, especially:
   - The **Platform note** sections (there are two — an original one about
     silent file truncation, and a "Platform note update" about the `Edit`
     tool reporting success while the file on disk stays truncated). Both
     apply here. Write files via `bash` heredoc (`cat > file << 'EOF' ...
     EOF`), then verify with `node --check` / `wc -c` / `tail -c` — don't
     trust an editor tool's own success message.
   - The **Working mode** section at the bottom: afzl builds, Claude
     reviews. You are doing the building this round — build it right the
     first time since review will check it closely.
   - The **Third pass** section describing how Fuel was wired: a
     `data-page="maintenance"` attribute on `<body>`, a
     `renderMaintenancePage()` function in `js/main.js`, one line added to
     `renderPageContent()`. Follow the exact same pattern, don't invent a
     new one.
2. `fleet-v2/fuel.html` and the `renderFuelPage()` function in
   `fleet-v2/js/main.js` — this is the completed reference for how a
   Monitor-group page should be structured and wired. Maintenance should
   look and behave the same way (shared shell, `summary-grid` at the top,
   one `panel` below it, same JS wiring pattern).
3. `fleet-v2/data/fleet.js` — see how `fuel: { summary: [...], assets: [...]
   }` was added at the end of `window.DOZR_FLEET`. Add a `maintenance` key
   the same way, right after `fuel`.
4. `fleet/maintenance.html` (old build, one folder up) — layout/copy
   reference only, not a source of truth for markup or classes.
5. `fleet/UI_AUDIT.md` — **read the Maintenance-specific finding before
   building anything.** Quoting it directly:

   > Maintenance shows two summary sections back-to-back (top strip +
   > "Maintenance status" panel) with overlapping metrics — Overdue is 2 in
   > both, but Due This Week says 4 while Due Soon says 3 for what reads as
   > the same concept. Fix: merge into one summary row, or clearly
   > differentiate what each represents.

   **Do not reintroduce this bug.** Build exactly **one** summary section
   (`summary-grid`, same as Fuel), not two. If you want both a
   date-based "due this week" concept and an hours-based "overdue" concept,
   fold them into distinct cards inside that single summary row — don't add
   a second summary panel underneath.

## Data to add — `fleet-v2/data/fleet.js`

Add a `maintenance` key to `window.DOZR_FLEET`, after `fuel`:

```js
maintenance: {
  summary: [
    { label: "Due this week", value: "6", note: "Planned service" },
    { label: "Overdue", value: "2", note: "Critical work" },
    { label: "On schedule", value: "5", note: "Healthy assets" },
    { label: "Fleet readiness", value: "92%", note: "Availability" }
  ],
  items: [
    { asset: "DZR-002", type: "Backhoe", service: "Hydraulic filter change", due: "Today", status: "Overdue", action: "Dispatch" },
    { asset: "DZR-001", type: "Excavator", service: "Coolant check", due: "Tomorrow", status: "Due soon", action: "Book" },
    { asset: "DZR-004", type: "Truck", service: "Brake inspection", due: "03 Jul", status: "Due soon", action: "Book" },
    { asset: "DZR-005", type: "Crane", service: "Battery health test", due: "12 Jul", status: "On schedule", action: "View" },
    { asset: "DZR-008", type: "Excavator", service: "Sensor calibration", due: "14 Jul", status: "On schedule", action: "View" },
    { asset: "DZR-007", type: "Loader", service: "Oil sample", due: "16 Jul", status: "Due soon", action: "Book" }
  ]
}
```

Adjust numbers/wording if you like, but keep the shape (`summary` array of
`{label, value, note}`, `items` array of maintenance rows) — `main.js`'s
renderer will expect this shape.

## Page structure — `fleet-v2/maintenance.html`

Same shared shell as every other page (sidebar nav grouped Operate/Monitor/
Analyze with `aria-current="page"` on Maintenance, header with search/live
pill/alert badge — copy it byte-for-byte from `fuel.html` and only change
the active nav link and page title/heading). Then:

- `<h1 class="sr-only">Maintenance</h1>`
- One `<section class="summary-grid" id="maintenance-summary" aria-label="Maintenance summary"></section>` — empty, JS fills it. **Only one of these.**
- One `<section class="panel">` containing a table: `<thead>` with columns
  Asset, Type, Service, Due, Status, Action (`<th scope="col">` on each),
  `<tbody id="maintenance-table-body"></tbody>` left empty for JS.
- Existing CSS already has `.table-wrap`, `.summary-grid`, `.summary-card`,
  `.status-chip[data-status="..."]` — reuse them, don't add new classes
  unless something is genuinely missing.

## JS wiring — `fleet-v2/js/main.js`

Add (following the exact shape of `renderFuelPage()`):

```js
function renderMaintenancePage() {
  var summary = document.getElementById("maintenance-summary");
  if (summary && FLEET.maintenance) {
    summary.innerHTML = FLEET.maintenance.summary.map(function (card) {
      return '<div class="summary-card"><div class="eyebrow">' + card.label + '</div><strong>' + card.value + '</strong><span>' + card.note + '</span></div>';
    }).join("");
  }
  var body = document.getElementById("maintenance-table-body");
  if (body && FLEET.maintenance) {
    body.innerHTML = FLEET.maintenance.items.map(function (item) {
      var statusAttr = item.status.toLowerCase();
      return '<tr><td>' + item.asset + '</td><td>' + item.type + '</td><td>' + item.service + '</td><td>' + item.due + '</td><td><span class="status-chip" data-status="' + statusAttr + '">' + item.status + '</span></td><td><button class="btn btn-secondary" type="button">' + item.action + '</button></td></tr>';
    }).join("");
  }
}
```

And extend the existing `renderPageContent()` dispatcher (don't duplicate
it, add one line):

```js
if (page === "maintenance") renderMaintenancePage();
```

## Before you're done — verify, don't just save

1. Write every changed file via `bash` heredoc, not just your editor's save.
2. `node --check fleet-v2/js/main.js` and `node --check
   fleet-v2/data/fleet.js` — both must exit clean.
3. Confirm `maintenance.html` has exactly one `summary-grid` section, one
   `<html>`/`</html>` pair, no duplicate `id` attributes, and every local
   `href`/`src` resolves.
4. `wc -c` each file, wait a couple seconds, `wc -c` again — sizes must
   match. If they don't, the write got silently truncated; rewrite via
   heredoc and re-verify.

Don't touch any other page — Geofences, Utilisation, Cost & ROI, Reports,
Timesheet, and Alerts Center stay stubs until their own turn.
