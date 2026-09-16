# WAB-TKD — End Round / Tie Decision / Rest — 2026-09-16

- End Round now only closes an active fighting round, preventing duplicate endings while paused for PTG/Kyeshi/tie decisions.
- Individual match: a tied round remains paused for an explicit decision. The operator can use the AI/statistics recommendation or WOO-SE-GIROK, then the selected round winner flows into the normal official rest phase.
- Individual non-tied round: End Round immediately starts the configured rest phase unless the match is already decided by the normal final-round rules.
- Par Équipe: every completed round enters the configured rest phase. Even after the final configured team round, the rest phase runs before the explicit team-winner reveal.
- The generic Start/Resume control is blocked while the final Par Équipe winner is awaiting reveal, so the final rest cannot be bypassed.
- Public Display continues to mirror the operator MatchState, so the rest/tie decision state is the same on the second screen.
