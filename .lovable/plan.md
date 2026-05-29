# Update R/T Scoring Dots — Animation & Colour Spec

Align the header's Reliability/Trust dot strips in `src/components/RuntimeHeader.tsx` with the canonical metaMe spec.

## Changes (single file: `src/components/RuntimeHeader.tsx`)

### 1. Dot count math
- Desktop: keep `Math.ceil(value/2)` out of 5 dots (already matches spec).
- Mobile (`useIsMobile`): retain 3-dot strip per existing product decision; apply same animation/colour rules.

### 2. Colour ramps (lit dots only)
Replace current `trustDotColor` / `reliabilityDotColor` with spec bands:

- Reliability:
  - `≤ 3` → `bg-red-500`
  - `3.01–6` → `bg-yellow-500`
  - `> 6` → `bg-purple-500`
- Trust:
  - `≤ 3` → `bg-red-500`
  - `3.01–6` → `bg-yellow-500`
  - `> 6` → `bg-green-500`

Unlit dots: `bg-slate-600` (replacing `bg-mm-ink-faint/30`).

### 3. Dot geometry
- Each dot: `h-1.5 w-1.5 rounded-full` (down from `h-2 w-2`).
- Strip wrapper: `flex items-center gap-0.5`.
- Label `R` / `T`: `text-[10px]`, separated from strip by `gap-2` on the parent.

### 4. Busy-pulse animation
Define `isBusy` from existing `inferring` flag (chat round-trip in flight). TTS state is not currently tracked in the shell, so `isBusy = inferring` for now; leave a TODO if a TTS hook is later wired in.

When `isBusy`:
```tsx
className={`h-1.5 w-1.5 rounded-full ${colorClass} animate-pulse`}
style={{ animationDelay: `${i * 0.15}s` }}
```
When idle:
```tsx
className={`h-1.5 w-1.5 rounded-full ${colorClass} transition-all duration-300`}
```

Apply to both lit and unlit dots so the whole strip ripples.

### 5. Placement
Keep current right-side header placement, R before T. Remove the saturation/brightness filter and the `ring`/`scale-105` flash wrapper added previously — spec says passive glance indicator with no extra emphasis. Keep direction arrows (▲▼) as they were already part of the shell — they're additive and don't conflict.

### 6. Cleanup
- Drop unused `trustFlash` state and 3s timer (replaced by pulse driven by `inferring`).
- Keep `trustDir` / `reliabilityDir` arrows intact.
- Keep mobile 3-dot scaling helper (`scoreToDots3`) but feed it into the same renderer.

## Out of scope
- No layout/positioning changes to header.
- No changes to AA-API payloads or trust score plumbing.
- TTS busy-state hook not added (no existing TTS state in shell).
