# Dozr Marketplace — Image Prompts for Every Placeholder

Reference for generating real images to drop into the `.photo` placeholders across
`marketplace/`. Every prompt below is built from the photography rules already
locked in `Dozr_Brand_Guidelines.html` (section 03, Photography):

- **In-situ only** — real UAE jobsites, real conditions, dust and wear visible. No studio cleanup, no cutouts on white.
- **Crop: 4:3**, consistent across cards and detail pages.
- **Framing:** the machine fills 70–80% of the frame — no tiny machine lost in a wide landscape.
- **Light:** natural daylight only. No studio lighting, no rim lights.
- **Treatment:** keep the ground, the site, the context. Never a stock-photo-perfect isolated cutout.
- **Fallback** (documented, not something to generate): Ink `#141518` background with the yellow blade-mark logo centered — used only if a real photo isn't available.

**Before you generate:** the `.photo` divs in the code right now are flat colored
`<div>`s with no image wired in (no `<img>`, no `background-image`) — generating
these won't show up on the live pages until that plumbing exists. Once you've
picked images you like, say so and I'll wire an `assets/` path per unit into
`data/equipment.js` and the placeholder CSS so they actually render.

---

## 1. Master prompt formula (equipment photography)

Every equipment shot — category tiles, card photos, detail hero, thumbnails,
the quote-approval photo — should follow this formula. Swap in the bracketed
parts per shot.

```
[EQUIPMENT], photographed in-situ on a UAE construction site near Al Quoz,
Dubai — sandy ground, low industrial warehouses and a crane or two visible
in the hazy background, bright natural daylight, harsh midday sun, real
dust and wear visible on the machine, no artificial lighting. [ANGLE/SHOT].
The machine fills 70–80% of the frame. Photorealistic, shot on a
professional camera, not a render or illustration. No text, no watermark,
no logo overlays, no isolated white background. 4:3 aspect ratio.
```

Generate everything at **1600×1200px (4:3)** regardless of the exact box
size below — the site will crop with `object-fit: cover`, and the brand
guide's own rule is "consistent 4:3 crop," not a bespoke ratio per box.

---

## 2. Placeholder box sizes (for reference, not for exact-match generation)

| Placeholder | Where | CSS box (desktop) | Live ratio | Generate at |
|---|---|---|---|---|
| Category tile | Home `#category-grid` | ~174×96px | ~1.8:1 | 1600×1200 (4:3), crop top/bottom |
| Card photo | Home featured / Browse results | ~358×170px (140px on Browse) | ~2.1–2.6:1 | 1600×1200 (4:3), crop top/bottom |
| Detail hero | Equipment Detail | ~736×320px | ~2.3:1 | 1600×1200 (4:3), crop top/bottom |
| Thumb row (×4) | Equipment Detail | ~170×74px each | ~2.3:1 | 1600×1200 (4:3), crop top/bottom |
| Approval photo | Quote Approval | ~300×132px | ~2.3:1 | reuse the matching unit's hero shot |
| Feature visual | Home "See Dozr in action" | ~608×320px | ~1.9:1 | 1600×840 (16:9-ish) — not equipment photography, see §4 |
| Map panel | Tracking page | 340×230px | ~1.5:1 | 1200×820 (3:2) — not equipment photography, see §5 |

Note the boxes are all *wider* than 4:3 (1.5:1 to 2.6:1) — generating at 4:3
and cropping with `object-fit: cover` means the top/bottom gets trimmed on
every box, which is fine as long as the machine is centered per the framing
rule above (70–80% fill, not pushed to one edge).

---

## 3. Category tiles (Home, `#category-grid` — 6 images)

One representative machine per category. These aren't tied to a specific
inventory unit — they represent the category itself.

**Excavators**
```
An excavator, photographed in-situ on a UAE construction site near Al Quoz,
Dubai — sandy ground, low industrial warehouses and a crane visible in the
hazy background, bright natural daylight, harsh midday sun, real dust and
wear visible on the machine, no artificial lighting. Three-quarter front
view, boom and bucket visible, machine mid-dig or parked on a leveled dirt
lot. The machine fills 70–80% of the frame. Photorealistic, shot on a
professional camera, not a render or illustration. No text, no watermark,
no logo overlays, no isolated white background. 4:3 aspect ratio.
```

**Wheel Loaders**
```
A wheel loader, photographed in-situ on a UAE construction site near Al
Quoz, Dubai — sandy ground, low industrial warehouses in the hazy
background, bright natural daylight, harsh midday sun, real dust and wear
visible on the machine, no artificial lighting. Three-quarter front view,
bucket raised slightly, tires dusty. The machine fills 70–80% of the
frame. Photorealistic, shot on a professional camera, not a render or
illustration. No text, no watermark, no logo overlays, no isolated white
background. 4:3 aspect ratio.
```

**Cranes**
```
A mobile crane (all-terrain crane on a truck chassis), photographed in-situ
on a UAE construction site near Al Quoz, Dubai — sandy ground, a
half-built structure with scaffolding in the hazy background, bright
natural daylight, harsh midday sun, real dust and wear visible on the
machine, no artificial lighting. Side/three-quarter view, boom partially
extended and angled upward, outriggers deployed. The machine fills 70–80%
of the frame. Photorealistic, shot on a professional camera, not a render
or illustration. No text, no watermark, no logo overlays, no isolated
white background. 4:3 aspect ratio.
```

**Dump Trucks**
```
A heavy dump truck (articulated or rigid, UAE construction fleet style),
photographed in-situ on a UAE construction site near Al Quoz, Dubai —
sandy ground, a stockpile of aggregate nearby, low industrial warehouses
in the hazy background, bright natural daylight, harsh midday sun, real
dust and wear visible on the truck, no artificial lighting. Three-quarter
front view, bed empty or loaded, tires dusty. The truck fills 70–80% of
the frame. Photorealistic, shot on a professional camera, not a render or
illustration. No text, no watermark, no logo overlays, no isolated white
background. 4:3 aspect ratio.
```

**Flatbed Trailers**
```
A flatbed trailer attached to a heavy tractor unit, loaded or ready to
load, photographed in-situ on a UAE port/construction logistics yard near
Al Quoz, Dubai — sandy ground, containers or equipment stacked in the
hazy background, bright natural daylight, harsh midday sun, real dust and
wear visible, no artificial lighting. Three-quarter view showing the full
length of the trailer bed. The vehicle fills 70–80% of the frame.
Photorealistic, shot on a professional camera, not a render or
illustration. No text, no watermark, no logo overlays, no isolated white
background. 4:3 aspect ratio.
```

**Generators**
```
A large towable diesel generator (industrial genset on a trailer chassis),
photographed in-situ on a UAE construction site near Al Quoz, Dubai —
sandy ground, cabling running to a site office in the background, bright
natural daylight, harsh midday sun, real dust and wear visible on the
casing, no artificial lighting. Three-quarter view, control panel visible
on the side. The unit fills 70–80% of the frame. Photorealistic, shot on
a professional camera, not a render or illustration. No text, no
watermark, no logo overlays, no isolated white background. 4:3 aspect
ratio.
```

---

## 4. Equipment unit photography (card + detail hero + 4 thumbnails)

Per the brand rule ("consistent across cards and detail pages"), each unit
needs **one hero shot** (reused for its card photo, detail hero, and the
Quote Approval photo when that unit is quoted) **plus 4 detail-page thumbnails**
at different angles. That's 5 prompts per unit × 7 units in `data/equipment.js`.

### Angle template (fill in `[UNIT]` with the specific machine)

**Hero / main shot**
```
[UNIT], photographed in-situ on a UAE construction site near Al Quoz,
Dubai — sandy ground, low industrial warehouses and a crane visible in the
hazy background, bright natural daylight, harsh midday sun, real dust and
wear visible on the machine, no artificial lighting. Three-quarter front
view, parked and ready for hire, full machine visible. The machine fills
70–80% of the frame. Photorealistic, shot on a professional camera, not a
render or illustration. No text, no watermark, no logo overlays, no
isolated white background. 4:3 aspect ratio.
```

**Thumbnail 1 — side profile**
```
[UNIT], same jobsite near Al Quoz, Dubai, natural daylight, dust and wear
visible. Full side profile view, entire machine in frame, ground line
visible. Photorealistic. No text, no watermark, no white background. 4:3
aspect ratio.
```

**Thumbnail 2 — cab / controls close-up**
```
[UNIT], close-up of the operator cab and control panel, shot from outside
looking into the open cab door, natural daylight, real wear on the seat
and controls visible. Photorealistic, in-situ, no studio lighting. No
text, no watermark, no white background. 4:3 aspect ratio.
```

**Thumbnail 3 — undercarriage / tracks or tires**
```
[UNIT], low-angle close-up of the tracks or tires and lower chassis, dust
and dirt caked on visible, natural daylight, real jobsite ground (sand or
gravel) visible. Photorealistic, in-situ, no studio lighting. No text, no
watermark, no white background. 4:3 aspect ratio.
```

**Thumbnail 4 — rear / attachment detail**
```
[UNIT], rear three-quarter view showing the counterweight and any
attachment (bucket, forks, etc.), natural daylight, dust and wear visible,
same UAE jobsite setting. Photorealistic, in-situ, no studio lighting. No
text, no watermark, no white background. 4:3 aspect ratio.
```

### Substitution values — the 7 units in `data/equipment.js`

| `[UNIT]` value to use | id | Notes to fold into the prompt |
|---|---|---|
| `A CAT 305 CR mini excavator, compact size, roughly 5 tonnes` | cat-305-cr | Small/compact machine, tight jobsite feel |
| `A CAT 320 crawler excavator, roughly 20 tonnes, well-maintained but with visible service life` | cat-320 | Verified/GPS unit — should look clean but genuinely used, not brand-new |
| `A Komatsu WA320 wheel loader` | komatsu-wa320 | — |
| `A Hitachi ZX130 excavator, roughly 13 tonnes` | hitachi-zx130 | — |
| `A Kubota KX080 mini excavator, roughly 8 tonnes, visibly older and more worn` | kubota-kx080 | Not verified/no GPS in the data — lean into a rougher, more weathered look |
| `A Volvo EC220 excavator, roughly 22 tonnes` | volvo-ec220 | — |
| `A CAT 336 large excavator, roughly 36 tonnes, a big machine` | cat-336 | Not verified/no GPS — largest unit, should read as noticeably bigger than the others |

Example — fully filled hero prompt for CAT 320:

```
A CAT 320 crawler excavator, roughly 20 tonnes, well-maintained but with
visible service life, photographed in-situ on a UAE construction site
near Al Quoz, Dubai — sandy ground, low industrial warehouses and a crane
visible in the hazy background, bright natural daylight, harsh midday
sun, real dust and wear visible on the machine, no artificial lighting.
Three-quarter front view, parked and ready for hire, full machine
visible. The machine fills 70–80% of the frame. Photorealistic, shot on a
professional camera, not a render or illustration. No text, no watermark,
no logo overlays, no isolated white background. 4:3 aspect ratio.
```

---

## 5. "See Dozr in action" feature tabs (Home, 3 images)

Not equipment photography — these represent phone-screen product moments.
Box is ~608×320px (≈1.9:1); generate at **1600×840px**.

**Track it live**
```
A smartphone screen close-up showing a live GPS tracking map interface —
a route line from a construction yard icon to a destination pin, a
vehicle marker mid-route, an ETA readout, clean minimal UI in black,
white, and a single yellow accent color. Phone held at a slight angle,
shallow depth of field, natural daylight, hand or wrist barely visible at
the frame edge holding the phone on a construction site. Photorealistic.
No visible app logos or brand names other than a generic clean UI. No
text overlays added outside the phone screen itself. 16:9-ish landscape
crop.
```

**Prove delivery**
```
A smartphone screen close-up showing a digital signature / proof-of-
delivery capture screen — a signature pad with a finger mid-signature, a
timestamp and location stamp visible below it, clean minimal UI in black,
white, and a single yellow accent color. Phone held by a construction
worker in a hi-vis vest, natural daylight, shallow depth of field,
photorealistic. No visible brand names other than a generic clean UI. No
added text overlays. 16:9-ish landscape crop.
```

**Get paid faster**
```
A smartphone screen close-up showing a generated invoice — line items,
a total in AED, a "VAT compliant" style badge, clean minimal UI in
black, white, and a single yellow accent color. Phone resting on a desk
or clipboard in a site office, natural daylight through a window,
shallow depth of field, photorealistic. No visible brand names other
than a generic clean UI. No added text overlays. 16:9-ish landscape crop.
```

---

## 6. Live tracking map background (Tracking page, 1 image)

This sits *behind* an existing inline SVG (a dashed route line and two
pin markers already drawn in code) — it needs to read as a muted map
texture, not a busy photo, so the overlay stays legible. Box is
340×230px (≈1.5:1); generate at **1200×820px**.

```
A top-down stylized city map texture, muted beige and grey tones like a
minimal navigation app basemap, showing simplified road networks, a few
building block outlines, and a hint of coastline/water in one corner
(Dubai-style urban grid, not literal or labeled). No text, no street
labels, no pins or markers (those are added separately), no photorealism
— flat, muted, map-style illustration. Desaturated, low contrast, so a
dark line and bright yellow marker would stay clearly visible on top of
it. 3:2 aspect ratio.
```

---

## Suggested file naming (for when these get wired in)

```
assets/equipment/cat-305-cr-hero.jpg
assets/equipment/cat-305-cr-thumb-1.jpg ... thumb-4.jpg
assets/equipment/cat-320-hero.jpg
... (same pattern for all 7 unit ids)
assets/categories/excavators.jpg
assets/categories/wheel.jpg
assets/categories/cranes.jpg
assets/categories/dump.jpg
assets/categories/flatbed.jpg
assets/categories/generators.jpg
assets/feature/track.jpg
assets/feature/verify.jpg
assets/feature/pay.jpg
assets/map-texture.jpg
```
Matches the `id`/`category` keys already used in `data/equipment.js` and
`DOZR_CATEGORIES`, so wiring them in later is a straight lookup, not a
rename exercise.
