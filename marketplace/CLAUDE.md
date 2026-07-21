# Dozr Marketplace — Frontend

Real, deployable frontend for the Dozr client-facing Marketplace. This is a
sub-scaffold inside the main Dozr project — see the root `CLAUDE.md` and
`ROADMAP.md` for brand tokens, phase status, and overall project context.
This file only covers conventions specific to the code in this folder.

## Stack (decided, Phase 3 — 2026-07-08)

Vanilla HTML/CSS/JS. No framework, no bundler, no build step. Matches the
three sibling MVPs (kaslo-liard, vendorkaslo, telematics-flame) — real
multi-page static site, each screen its own `.html` file, deployed to Vercel
as-is.

**No backend yet — deliberate, not a placeholder.** Equipment data is
hardcoded in `data/equipment.js`. Every action that would normally hit a
server (Request Quote, Approve Quote, Track Job, contact a vendor) instead
opens a `wa.me` WhatsApp deep link with a pre-filled message — this matches
the real product spec, which is WhatsApp-native end to end (see
`LOGISTICS/02_Product/01_Kasper_Marketplace.docx`: quotes and approvals are
confirmed via WhatsApp, not a web form). When a real backend (Supabase) gets
added, only `data/equipment.js` and the WhatsApp-link functions in
`js/whatsapp.js` need to change — page markup stays the same.

## Where things are

- `index.html` — Home (search-first hero, category tiles, featured units, tabbed feature showcase, FAQ)
- `browse.html` — Browse (category tab bar, filters, listing grid)
- `equipment-detail.html` — Equipment detail + request-quote rail (reads `?id=` to look up the unit in `data/equipment.js`)
- `tracking.html` — Shared tracking link (no-login, single phone-frame card — mobile only, not part of main nav)
- `quote-approval.html` — Shared approval link (same no-login pattern as tracking) — **build this once the Claude Design pass for it lands in `LOGISTICS/05_Brand_Design/`**
- `contact.html` — Contact page (info cards + form that opens WhatsApp via `js/whatsapp.js`, no server POST) — added 2026-07-21
- `about.html` — About page (mission, how-it-works value grid, no fabricated team/testimonials) — added 2026-07-21
- `css/styles.css` — all brand tokens as CSS custom properties, reset, typography, shared nav/footer/button/card styles
- `js/main.js` — nav behavior, category tab switching, mobile menu toggle
- `js/whatsapp.js` — `buildWhatsAppLink(message)` helper — the ONE place the business WhatsApp number lives
- `data/equipment.js` — hardcoded equipment listings (plain JS array, `window.DOZR_EQUIPMENT`)
- `assets/` — images/icons as they're produced (empty for now)

## Conventions

- **Brand tokens are non-negotiable** — always reference the CSS custom
  properties in `css/styles.css` (`var(--ink)`, `var(--yellow)`, etc.), never
  hardcode a hex value in a page. If a page needs a color/font/radius not in
  the token set, stop and flag it — don't improvise.
- **Semantic HTML only** — real `<button>`/`<a>` for anything clickable, real
  `<label for>` + `<input>`/`<select>` for form fields, `role="img"
  aria-label` on decorative photo placeholders that represent real content,
  `aria-hidden="true"` on ones that don't. The hi-fi prototype
  (`LOGISTICS/05_Brand_Design/Dozr_Marketplace_Prototype.html`) had every one
  of these violations fixed on 2026-07-08 — don't reintroduce them here.
- **Reference, don't copy, the prototype.** `Dozr_Marketplace_Prototype.html`
  is Claude Design output — its interactivity (`<x-dc>`, `sc-if`, the
  `DCLogic` class) is that tool's internal preview engine and depends on
  runtime files (`support.js`/`image-slot.js`) that don't exist here. Use it
  for layout, copy, and visual reference only. Rebuild all interactivity in
  plain vanilla JS.
- **One shared nav/footer markup** — keep the header and footer identical
  (byte-for-byte, aside from the active-nav-item state) across every page so
  they don't drift. If you change one, change all of them.
- **No inline `<script>` business logic in pages** — page-specific JS goes in
  a `<script>` block at the bottom of that page's HTML file *or* a
  `js/<page>.js` file if it grows past ~20 lines; shared behavior stays in
  `js/main.js`.

## Build order (Phase 4 of ROADMAP.md)

Home → Browse → Equipment Detail → Tracking → Quote Approval (last, pending
its design pass). Each page: check the wireframe/prototype for that screen →
build it here → run `/brand-check` → run the `qa-accessibility-reviewer`
agent before considering it done. Don't skip ahead to a page whose design
isn't finished yet.

**Rate Cards page is cut from v1 scope** (decided 2026-07-08) — it would
contradict the request-quote pricing model. Don't build it.
