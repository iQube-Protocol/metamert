# Compress Trust/Reliability dots to 3 on mobile

## Goal
On the mobile breakpoint (`<768px`), render the **R** (Reliability) and **T** (Trust) indicators in `RuntimeHeader.tsx` as **3 dots** instead of 5, while preserving the same 0–10 underlying score semantics. Tablet and desktop continue to show 5 dots — no change.

## Mapping: 0–10 score → 3 filled dots

The current desktop function maps 0–10 to 0–5 dots via `Math.ceil(score / 2)`. For 3 dots we need a comparable banding so each dot represents a meaningful slice of the 0–10 range:

```text
Score 0       → 0 dots  (none)
Score 1–3.33  → 1 dot   (low band)
Score 3.34–6.66 → 2 dots (mid band)
Score 6.67–10 → 3 dots  (high band)
```

Formula:
```ts
function scoreToDots3(score: number | undefined, fallback: number): number {
  if (score == null) return fallback;
  const v = Math.min(10, Math.max(0, score));
  if (v === 0) return 0;
  return Math.min(3, Math.ceil(v / (10 / 3))); // ceil(v / 3.333)
}
```

This keeps parity with the desktop visual intent:
- Desktop default `reliability` fallback = 4/5 dots (high) → mobile fallback = 3/3
- Desktop default `trust` fallback = 3/5 dots (mid)  → mobile fallback = 2/3

Color thresholds (alert/codex/earn) stay tied to the raw 0–10 score — unchanged.

## Visual comparison

```text
Desktop / Tablet (≥768px):   R ● ● ● ● ○   T ● ● ● ○ ○
Mobile (<768px):              R ● ● ●       T ● ● ○
```

Direction arrow (▲/▼) and flash ring behavior are preserved on all breakpoints.

## Implementation

**File:** `src/components/RuntimeHeader.tsx`

1. Import `useIsMobile` from `@/hooks/use-mobile`.
2. Add `scoreToDots3` helper next to existing `scoreToDots`.
3. In the component:
   - Call `const isMobile = useIsMobile();`
   - Compute dot counts conditionally:
     ```ts
     const dotCount = isMobile ? 3 : 5;
     const rScore = isMobile
       ? scoreToDots3(trustScores.reliability, 3)
       : scoreToDots(trustScores.reliability, 4);
     const tScore = isMobile
       ? scoreToDots3(trustScores.trust, 2)
       : scoreToDots(trustScores.trust, 3);
     ```
4. Update `renderDots(filled, activeColor)` to accept a `total` argument (default 5) and iterate `[...Array(total)]`. Pass `dotCount` from the call sites.
5. Tighten the R/T container spacing on mobile to recover horizontal room:
   - Change `gap-4` → `gap-2 sm:gap-4` on the outer R/T wrapper
   - Change `px-3 py-2` → `px-2 py-1.5 sm:px-3 sm:py-2`
   - Keep dot size (`h-2 w-2`) and label font unchanged.

No other files touched. No changes to score semantics, colors, animations, message contracts, or memory.

## Out of scope
- Hiding R/T entirely on very narrow screens
- Changing the dot diameter or label
- Changing color thresholds
