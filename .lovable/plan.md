
Objective: restore the dot animation pattern itself (the traveling, sequential pulse across dots) while keeping the current inference trigger/stop behavior unchanged.

What I verified in the codebase:
1) `src/components/RuntimeHeader.tsx`
- Current dot rendering uses:
  - `inferring ? "animate-pulse transition-all duration-700" : "transition-all duration-300"`
- The previous sequential effect is missing because:
  - `animate-dot-wave` is no longer applied.
  - per-dot `animationDelay` is no longer applied.

2) `tailwind.config.ts`
- `dot-wave` keyframes and `animation["dot-wave"]` are still present.
- This means the sequence animation infrastructure still exists and can be re-used.

3) `src/contexts/ShellContext.tsx`
- Current inference behavior logic (completion-signal-based stop + safety timeout) is already in place.
- No behavior rollback is required for your request.

Clarification status:
- No blocking unknowns. Your request is specific: keep behavior timing logic changes, restore the original dot animation pattern.

Implementation plan:
1) Restore the original sequential animation wiring in `RuntimeHeader` dots
- Update `renderDots()` in `src/components/RuntimeHeader.tsx` so that when `inferring` is true:
  - class includes `animate-dot-wave`
  - inline style applies stagger: `animationDelay: \`${i * 150}ms\``
- Keep current color logic and filled/unfilled dot logic unchanged.
- Keep non-inferring state static (no animation).

2) Preserve all inference trigger/stop behavior as-is
- Do not modify `src/contexts/ShellContext.tsx`.
- This keeps your preferred behavior updates while restoring only the visual pattern.

3) Validate and tune (only if needed for visual parity)
- If sequence feels off after restore, only tweak the stagger increment (e.g. 120–180ms) and/or `dot-wave` duration (currently 1.2s) in `tailwind.config.ts` for exact prior feel.
- Default plan is to first restore exact previous wiring before any tuning.

Technical details (for implementation):
- Primary file to change: `src/components/RuntimeHeader.tsx`
- Expected dot render shape during inference:
  - `className` contains `animate-dot-wave`
  - `style={inferring ? { animationDelay: \`${i * 150}ms\` } : undefined}`
- No API changes, no shell protocol changes, no context/state-model changes.
- Existing Tailwind keyframes already support this (`dot-wave`).

Validation plan (end-to-end):
1) Hard refresh preview (to avoid stale CSS/JS artifacts).
2) Trigger inference via prompt submit:
- Confirm dots animate in a left-to-right sequential wave (single-dot emphasis moving across).
3) Trigger inference via SmartMenu action:
- Confirm same sequence pattern appears.
4) Confirm behavior logic remains unchanged:
- Dots start/stop according to current completion-signal logic (no reversion of trigger behavior).
5) Check mobile + desktop:
- Verify sequence looks consistent at current mobile viewport and standard desktop viewport.

Acceptance criteria:
- During inference, dots visibly animate as a sequential traveling pattern (not uniform pulse-all-at-once).
- No change to current inference lifecycle behavior.
- No regressions in trust/reliability dot colors, menu interactions, or header layout.
