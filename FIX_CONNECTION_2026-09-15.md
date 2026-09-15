# WAB-TKD — Side Judge ↔ Main Referee Connection Fix — 2026-09-15

## Root cause found

The final Supabase RLS hardening changed Realtime access to `TO authenticated`, while the side-judge screens have no Supabase login form. The client had also stopped bootstrapping the anonymous session that the previous working judge connection depended on. As a result, `judge-votes` / `match-sync` could be created with no authenticated Realtime session and the judge appeared connected in the UI while messages failed.

## Fix

- Restore an anonymous Supabase session as a Realtime fallback when no real Supabase session exists.
- Keep real Supabase sessions preferred.
- Add `ensureRealtimeSession()` and await it before subscribing from JudgePanel, OperatorScreen and PublicScoreboard.
- Keep production database DML protected: the strict RLS policy still rejects anonymous JWTs for INSERT/UPDATE/DELETE.
- Reuse the already subscribed Operator `judge-votes` channel for vote-result broadcasts instead of creating extra unsusbcribed channels.
- Preserve the existing reconnect logic in JudgePanel for `CHANNEL_ERROR`, `TIMED_OUT`, `CLOSED`, `online`, and `visibilitychange`.

## Validation

- `tsc --noEmit` — PASS.
- `node --check electron/main.cjs` — PASS.
- Full Vite build not run because `node_modules` is not installed in this execution environment.
