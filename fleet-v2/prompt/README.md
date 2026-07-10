# Dozr Fleet v2 - Build Prompts

Ready-to-paste prompt for building the remaining 8 screens of the Fleet v2
rebuild. Same pattern as `../../prompt/` (Marketplace) and `../../fleet/prompt/`
(the old Fleet build): copy the whole prompt into an AI coding assistant.

| File | Task |
|---|---|
| `00_build_remaining.md` | Build all 8 remaining pages: Fuel, Maintenance, Geofences, Utilisation, Cost & ROI, Reports, Timesheet, Alerts Center |

Fleet Map (`fleet-v2/index.html`) is already built and approved - not part
of this prompt.

Read `../CLAUDE.md` first (this folder's conventions, including the
platform truncation note) before running the prompt.

Build order: Fuel -> Maintenance -> Geofences -> Utilisation -> Cost & ROI
-> Reports -> Timesheet -> Alerts Center - same order as the nav groups
read top to bottom.

Primary references for every page: the matching already-built page in
`../../fleet/` (old build, Dozr-branded), plus
`https://telematics-flame.vercel.app/` for the original IA. Full detail is
inline in `00_build_remaining.md`, not duplicated here.
