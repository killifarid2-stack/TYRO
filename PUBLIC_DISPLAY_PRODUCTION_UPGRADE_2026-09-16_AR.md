# WAB-TKD — Public Display Production Upgrade — 2026-09-16

Implemented inside the current WAB-TKD project. No demo project was created and no existing assets/animations were deleted.

## Implemented
- Electron Second Display Manager metadata: display list, primary/external classification, TV-name heuristic, resolution, scale factor and saved display fingerprint.
- Public Display remains a dedicated Electron second-display window and now rebinds after wireless/Miracast reconnects even if Windows gives the monitor a new display id.
- Master design contract: 1920×1080 / 16:9.
- Uniform whole-page scaling via Electron zoom normalization, so 1080p, 4K and smaller second displays use one CSS design viewport rather than independently scaling RED/MATCH/BLUE layers.
- Preview and TV continue to use the same PublicScoreboard renderer/component and the same match/design state synchronization.
- Calibration persisted in userData: `fit`, `fill`, `16:9` (default `16:9`).
- Display connection status exposed to the operator: CONNECTING / CONNECTED / DISCONNECTED and automatic reconnect.
- Public Display preparation handshake before the renderer is considered READY.
- Error fallback to a clean STANDBY screen instead of a broken public layout.
- Optional operator display guides: Master 1920×1080, Safe Area, Center, RED/MATCH/BLUE zones.
- Display diagnostics metadata visible in the Display Manager (resolution, scale, master canvas, mode).

## Important limitation
Electron can reliably identify a primary vs external monitor, but Windows/Electron does not provide a universal, authoritative “this is a TV” flag. The UI therefore reports `TV` only when the monitor label contains common TV/manufacturer hints; otherwise it reports `External`. Wireless/Miracast displays are handled as normal external displays.

## Verification
- TypeScript: `npx tsc --noEmit` passed.
- Production Vite build could not be executed in this environment because dependencies were not installed; `npm ci --ignore-scripts` timed out before completing.
