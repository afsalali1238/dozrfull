# Dozr Hero Video — Prompt (AI Video Generation)

Refined from your original drone-shot concept. Goal: fix the two failure modes
that make AI-generated construction footage read as fake — (1) "AI slop" visual
artifacts (morphing geometry, floating objects, inconsistent scale, warped
metal, phantom vehicles) and (2) physically wrong vehicle placement (machines
not touching the ground, wrong orientation relative to what they're doing,
scale mismatches between foreground and background equipment).

Matches the photography rules already locked in `Dozr_Brand_Guidelines.html`
and `Dozr_Image_Prompts.md`: in-situ, real wear, natural daylight, no
studio-clean look, no artificial color grading.

---

## 1. Main prompt (use as-is in Sora / Veo / Kling / Runway)

```
Cinematic aerial drone footage over a UAE construction and logistics yard in
Al Quoz, Dubai, hazy golden-hour morning. Slow, continuous forward push,
altitude roughly 40-60 meters, camera tilted down at a 30-degree angle — not
a flat top-down map view. Subtle handheld-style drone drift (slight roll and
yaw, like real UHD gimbal footage), not a locked robotic glide.

Lower-right third of frame, foreground, sharp focus: a weathered yellow CAT
excavator sits on leveled sandy ground with its tracks fully grounded, boom
extended toward a sand mound, bucket mid-scoop, hydraulic arm articulating
naturally along one continuous plane of motion — no bending past mechanical
limits. Directly behind it, on the same ground plane and correctly
foreshortened by distance, a flatbed trailer is parked hitched to a visible
tow truck cab, all axles and wheels touching the ground, load bed level. A
wheel loader idles to the left of the excavator, front bucket lowered, tires
grounded, facing the same working direction as the excavator (not
cross-angled into it). Real dust haze low at ground level, visible mechanical
wear, scratched paint, sand accumulation on tracks and tires — no showroom
gloss.

Upper-left two-thirds of frame: open pale sky, sun-bleached and slightly
overexposed, with 2-3 tower cranes in heavy silhouette at varying, realistic
distances (not identical copies at identical spacing). Cranes are static or
near-static — no fast jib rotation. This upper region stays uncluttered and
low-contrast to hold a white text overlay.

Color grade: warm neutral, sandy beige / steel grey / muted industrial
yellow, desaturated, soft golden-hour light with long shadows falling
consistent with a single low sun angle — every shadow in frame points the
same direction. Natural motion blur on moving parts (bucket, tires) matching
camera and subject speed — no artificial hyper-smooth interpolation look.

Shot on 35mm cinema lens equivalent, shallow atmospheric haze for depth,
photoreal texture (visible rust, weld seams, tire tread), not a render, not
a video-game asset, not a stylized illustration. No people in frame. No
text, no logos, no watermarks, no signage lettering (avoid garbled AI text).
Silent b-roll — no dialogue, no voiceover, no on-screen captions; ambient
industrial sound only if audio is generated (engine idle, distant machinery,
wind).
```

## 2. Negative prompt (add to the negative/exclude field if your tool has one)

```
floating vehicles, wheels or tracks not touching ground, vehicles clipping
through terrain, duplicated or flickering vehicles, extra limbs on
excavator arm, boom bending backward or through the cab, warped or melting
metal, inconsistent vehicle scale between shots, mismatched shadow
directions, oversaturated teal-and-orange grade, glossy showroom finish,
motion judder, unnatural hyper-smooth camera glide, morphing crane
silhouettes, text artifacts, garbled signage, watermark, logo, people,
extra wheels, wheels changing count between frames, low-resolution
background, lens flare bloom, over-sharpened HDR look
```

## 3. Why the original prompt needed this pass

- **No camera tilt specified** → most models default to a flat top-down
  "map" angle for "aerial," which reads as a game engine, not b-roll.
  Fixed by locking a 30° tilt and adding drift.
- **No ground-contact instruction** → this is the #1 cause of "floating
  excavator" artifacts in generated construction footage. Every vehicle
  now has an explicit "touching ground / grounded tracks / grounded
  wheels" clause.
- **No relative orientation between vehicles** → without this, models
  often generate the loader facing the wrong way or the trailer floating
  behind the cab at the wrong angle. Fixed by specifying facing direction
  and same ground plane.
- **"Perfect seamless loop" is currently unrealistic for most tools** —
  see §4. Kept as an optional post-production step instead of a generation
  instruction the model will likely ignore or fake badly.
- **No shadow-consistency instruction** → mismatched shadow angles between
  foreground and background objects is a top AI-slop tell. Now locked to
  one sun direction.
- **No lens/motion-blur guidance** → hyper-smooth, blur-free motion is the
  other big tell. Added natural motion blur matched to speed.

## 4. Practical generation notes

- **Duration**: most text-to-video models (Sora, Veo 3, Kling, Runway
  Gen-4) cap native generation at 5-10 seconds per clip. Don't expect a
  single continuous multi-vehicle push-in longer than that in one pass.
  Generate 2-3 separate 5-8s clips (e.g., wide establishing push-in →
  closer excavator detail → loader/trailer pass) and edit them together,
  rather than asking for one long unbroken shot — quality and consistency
  degrade fast past ~8s.
- **Seamless loop**: ask the model for a clean static-ish start and end
  frame (camera position roughly matching), then close the loop in an
  editor (crossfade or match-cut) rather than relying on "perfect loop" in
  the prompt — no current tool reliably delivers a truly seamless loop
  from prompt text alone.
- **Vehicle count**: 3 vehicles (excavator, wheel loader, trailer+cab) is
  close to the practical ceiling for multi-object consistency in one shot.
  If you see phantom duplicates or merging vehicles in the output, drop to
  2 (excavator + loader, cut the trailer) — that's the most common failure
  point at this vehicle density.
- **Resolution/aspect**: force 16:9 explicitly in the tool's aspect-ratio
  parameter, not just in text — same issue noted in `Dozr_Image_Prompts.md`
  for stills, where square output was returned despite "16:9" in the
  prompt.
- **Audio**: generate muted, or strip audio in post. "No voice" doesn't
  reliably suppress an AI-generated ambient soundtrack in every tool —
  safer to mute/replace in editing.
- **Existing draft**: `video_drafts/hero_video_watermark_removed_draft.mp4`
  is your prior attempt — worth a side-by-side once the new generation is
  in, to confirm this pass actually fixes the floating/scale issues rather
  than just moving them around.

## 5. Brand check

Yellow CAT excavator as the hero subject lines up with Dozr's accent color
(`#FFC400`) without forcing it — good, keep the excavator's paint yellow
rather than swapping brand for it. Everything else (sandy beige, steel grey,
low saturation) sits inside the existing palette already used for equipment
photography. No text/logo baked into the video — overlay the Dozr wordmark
in post using Space Grotesk, per the brand guide, not generated in-frame.
