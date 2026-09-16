# WAB-TKD — Round Result / Rest / Dual Display Polish — 2026-09-16

## Implemented

- Rest screen now uses dedicated player-name frames and removes the old `CHUNG — MAR` nationality presentation from the rest header.
- Rest player panels no longer duplicate the player identity under the name; round data and statistics have separate areas.
- Rest `ROUNDS` rows are generated from the configured round count instead of being hard-coded to three.
- Rest `HITS` now places the real HEAD and BODY equipment artwork beside the hit counts, with the previous top-positioned presentation removed.
- `ROUNDS WON` values in the rest center are enlarged and kept in separate BLUE/RED frames.
- A round-result card now explicitly shows DRAW, AI recommendation/confidence, WOO-SE-GIROK, and KO artwork when the corresponding state exists.
- Match result winner frame now shows the side-specific KO artwork for KO results and a GOLDEN POINT badge for GDP results.
- Result `ROUNDS WON` values are enlarged and round rows include the recorded decision/method where available.
- WOO-SE-GIROK title was enlarged; BLUE/RED decision labels were lifted above the referee-arm artwork to prevent text/arm collisions.
- Electron Public Display now caches the latest authoritative operator match state and sends it to a newly opened/reconnected display after page load. The latest published broadcast design is also re-sent. This removes the startup race where the second screen could show its own initial/default state while the operator screen was already live.

## Preservation

- Existing assets and animation files remain in place.
- Existing match/round decision logic was not replaced; the changes are presentation/routing hardening around the existing state and decision data.
- Existing Electron dual-screen architecture remains the source-of-truth model: Operator → Public Display.
