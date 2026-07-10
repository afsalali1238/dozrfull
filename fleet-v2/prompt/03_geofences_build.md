# Geofences page build

**Target tool:** whatever you're building with (Claude Code, Cursor, VS Code
Copilot, etc.)
**File being built:** `fleet-v2/geofences.html` (currently a stub)
**Folder:** `fleet-v2/` inside the Dozr repo

---

Copy everything below into your coding tool.

---

Build `fleet-v2/geofences.html` for the Dozr project.

## Scope — read this part twice

**Touch only:** `fleet-v2/geofences.html` (full rewrite), plus additive-only
edits to `fleet-v2/data/fleet.js` (add a `geofences` key — see below) and
`fleet-v2/js/main.js` (add one `renderGeofencesPage()` function and one line
inside the existing `renderPageContent()` dispatcher).

**Do not touch** `alerts.html`, `cost-roi.html`, `reports.html`,
`timesheet.html`, `utilisation.html`, `index.html`, `fuel.html`,
`maintenance.html`, `css/styles.css`, or `CLAUDE.md`. Last round the build
tool touched all 6 remaining stub pages instead of just the one in scope,
and four of them came back with null-byte corruption padded to their old
file size — invisible to `wc -c`, only visible reading raw bytes. If your
tool has any "apply across similar files" or "fix all pages" mode, disable
it for this task. One page, one data key, one render function. Nothing else.

## Read first

1. `fleet-v2/CLAUDE.md` — all of it, especially the **Platform note**
   sections (silent truncation, `Edit`-tool/disk desync, and the **Fourth
   pass** section describing the null-byte corruption incident from last
   round) and the **Working mode** section. Write files via `bash` heredoc
   (`cat > file << 'EOF' ... EOF`), not just your editor's save, then verify:
   - `node --check fleet-v2/js/main.js` and `node --check
     fleet-v2/data/fleet.js` must both exit clean.
   - `wc -c` every file you touched, wait a couple seconds, `wc -c` again —
     sizes must match.
   - Scan for null bytes: `python3 -c "print(open('FILE','rb').read().count(b'\x00'))"`
     must print `0` for every file you touched.
   - Confirm every file you did **not** touch is byte-identical to before
     you started (`wc -c` before and after) — if anything else changed size,
     stop and revert it.
2. `fleet-v2/maintenance.html` and `renderMaintenancePage()` in
   `fleet-v2/js/main.js` — this is the current completed reference for the
   `data-page` wiring pattern. Follow it exactly: `data-page="geofences"` on
   `<body>`, a `renderGeofencesPage()` function, one added line in
   `renderPageContent()`.
3. `fleet-v2/data/fleet.js` — see how `fuel: {...}` and `maintenance: {...}`
   were added as keys on `window.DOZR_FLEET`. Add `geofences` the same way,
   right after `maintenance`.
4. `fleet/geofences.html` (old build, one folder up) — layout/copy reference
   only.
5. `fleet/UI_AUDIT.md` — **read the Geofences-specific finding before
   building anything.** Quoting it directly:

   > Geofences nests three panels inside each other (Geofence Manager →
   > Zones panel → Recent Events panel), each with its own border/radius/
   > shadow. Flatten one level — Recent Events probably doesn't need to be a
   > panel-inside-a-panel; a simple divider would read lighter.

   **Do not reintroduce this bug.** Structure: one outer `panel` ("Geofence
   Manager") containing a `map-card` (map on the left, a `Zones` panel on
   the right using the existing `.zone-list` class) — that's two levels, not
   three. Put **Recent Events as its own separate `panel` section below**,
   a sibling of the Geofence Manager panel, not nested inside Zones.

   Also noted in the same audit: the reused `.nav-actions` class for the
   "+ New Zone / Polygon / Circle" button group is harmless but
   content-scoped rename is nicer — if you want to address it, add a new
   class (e.g. `.geofence-toolbar`) with the same flex rules rather than
   reusing the header-only `.nav-actions` class; not required, skip if it
   adds risk.

## Data to add — `fleet-v2/data/fleet.js`

Add a `geofences` key to `window.DOZR_FLEET`, after `maintenance`:

```js
geofences: {
  summary: [
    { label: "Active zones", value: "4", note: "Across all sites" },
    { label: "Assets tracked", value: "8", note: "Inside a zone now" },
    { label: "Entries today", value: "6", note: "Since 00:00" },
    { label: "Exits today", value: "5", note: "Since 00:00" }
  ],
  zones: [
    { name: "Al Quoz Yard", shape: "Polygon", area: "0.8 sq km", hours: "07:00-18:00", assets: 3 },
    { name: "Jebel Ali Port", shape: "Polygon", area: "1.2 sq km", hours: "24h", assets: 3 },
    { name: "Dubai Creek Harbour", shape: "Rectangle", area: "0.5 sq km", hours: "06:00-20:00", assets: 2 },
    { name: "Abu Dhabi KIZAD", shape: "Circle", area: "7.1 sq km", hours: "24h", assets: 1 }
  ],
  events: [
    { time: "14:32", asset: "DZR-001", action: "Entered", zone: "Al Quoz Yard" },
    { time: "13:55", asset: "DZR-004", action: "Exited", zone: "Jebel Ali Port" },
    { time: "13:10", asset: "DZR-003", action: "Entered", zone: "Jebel Ali Port" },
    { time: "11:22", asset: "DZR-005", action: "Exited", zone: "Dubai Creek Harbour" }
  ]
}
```

## Page structure — `fleet-v2/geofences.html`

Same shared shell as every other page (copy byte-for-byte from
`maintenance.html`, only change the active nav link and page title/heading).
Then:

- `<h1 class="sr-only">Geofences</h1>`
- One `<section class="summary-grid" id="geofences-summary" aria-label="Geofences summary"></section>` — empty, JS fills it.
- One `<section class="panel">` titled "Geofence Manager" containing a
  `<div class="map-card">` with:
  - a `<div class="map-surface" id="geofence-map" role="img" aria-label="Geofence zones"></div>` (JS will inject a simple inline SVG showing rough zone shapes — reuse the existing `.map-surface` class, don't invent a new one)
  - a `<div class="panel">` titled "Zones" containing `<div class="zone-list" id="zone-list"></div>`
- A **separate, sibling** `<section class="panel">` titled "Recent Events"
  containing `<div class="timeline" id="event-feed"></div>` — not nested
  inside the Zones panel.
- Existing CSS already has `.map-card`, `.map-surface`, `.zone-list`,
  `.timeline`, `.summary-grid`, `.summary-card` — reuse them, don't add new
  classes unless something is genuinely missing.

## JS wiring — `fleet-v2/js/main.js`

Add (following the exact shape of `renderMaintenancePage()`):

```js
function renderGeofencesPage() {
  var summary = document.getElementById("geofences-summary");
  if (summary && FLEET.geofences) {
    summary.innerHTML = FLEET.geofences.summary.map(function (card) {
      return '<div class="summary-card"><div class="eyebrow">' + card.label + '</div><strong>' + card.value + '</strong><span>' + card.note + '</span></div>';
    }).join("");
  }
  var zoneList = document.getElementById("zone-list");
  if (zoneList && FLEET.geofences) {
    zoneList.innerHTML = FLEET.geofences.zones.map(function (zone) {
      return '<div class="zone-item"><div class="meta"><strong>' + zone.name + '</strong><span class="status-chip" data-status="ok">' + zone.shape + '</span></div><div class="metric-line" style="margin-top:6px"><span>' + zone.area + '</span><span>' + zone.hours + '</span></div><div class="metric-line"><span>Assets</span><span>' + zone.assets + '</span></div></div>';
    }).join("");
  }
  var feed = document.getElementById("event-feed");
  if (feed && FLEET.geofences) {
    feed.innerHTML = FLEET.geofences.events.map(function (ev) {
      return '<div class="event-item" data-action="' + ev.action + '"><div><strong style="display:block;font-size:12px">' + ev.asset + ' ' + ev.action + ' ' + ev.zone + '</strong></div><span style="font-family:var(--font-mono);font-size:9.5px;color:var(--slate);white-space:nowrap">' + ev.time + '</span></div>';
    }).join("");
  }
  var map = document.getElementById("geofence-map");
  if (map) {
    map.innerHTML = '<svg viewBox="0 0 100 100" role="img" aria-label="Geofence zones"><rect width="100" height="100" fill="var(--canvas)"/><rect x="12" y="18" width="24" height="24" rx="4" fill="rgba(255,196,0,.18)" stroke="var(--yellow-dark)" stroke-width="1.4"/><rect x="44" y="24" width="28" height="18" rx="4" fill="rgba(20,100,71,.12)" stroke="var(--green)" stroke-width="1.4"/><circle cx="76" cy="34" r="12" fill="rgba(20,21,24,.06)" stroke="var(--slate)" stroke-width="1.4"/><rect x="24" y="58" width="46" height="22" rx="4" fill="rgba(162,36,36,.08)" stroke="var(--error)" stroke-width="1.4"/></svg>';
  }
}
```

Note: `.zone-item` and `.metric-line` classes are used above. `.zone-item`
exists via `.asset-item, .site-item, .zone-item, .event-item ... { border:
1px solid var(--line); border-radius: 12px; padding: 8px 10px; }` already in
`css/styles.css` (shared rule). `.metric-line` may not exist yet — check
before adding; if missing, add one small rule near the other utility
classes: `.metric-line { display: flex; justify-content: space-between;
gap: 8px; color: var(--slate); font-size: 11px; }`. That is the one CSS
change permitted in this pass, additive only, appended not rewritten.

Extend the existing `renderPageContent()` dispatcher (don't duplicate it,
add one line):

```js
if (page === "geofences") renderGeofencesPage();
```

## Before you're done — verify, don't just save

1. Write every changed file via `bash` heredoc.
2. `node --check fleet-v2/js/main.js` and `node --check
   fleet-v2/data/fleet.js` — both must exit clean.
3. Confirm `geofences.html` has exactly two panel-nesting levels in the
   Geofence Manager section (map-card containing a Zones panel — not three),
   Recent Events as a sibling section, one `<html>`/`</html>` pair, no
   duplicate `id` attributes, every local `href`/`src` resolves.
4. `wc -c` each file you touched, wait a couple seconds, `wc -c` again.
5. Null-byte scan on every file you touched, and a `wc -c` check on every
   file you did *not* touch to confirm they're unchanged.

Don't touch any other page — Utilisation, Cost & ROI, Reports, Timesheet,
and Alerts Center stay stubs until their own turn.
