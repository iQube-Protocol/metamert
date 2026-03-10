

## Analysis

To clarify the previous behavior you described: it was **not** a three-tap sequence. The flow was:

1. **First tap** → `activateQuickActions(mode)` → enters `quickActionOnly` with that mode's quick links visible, no prompt box
2. **Second tap** (on the same button, while already in quickActionOnly) → `activateMode(mode)` → transitions to `promptMode` with prompt box + quick links

So it's a **two-tap** sequence: tap once to browse quick actions, tap again to open the prompt box for that specific mode. This is the correct UX to restore.

## Plan

### File: `src/components/SmartMenu.tsx`

**Change `handleNavPointerUp`** (lines 97-103): Add logic so that if the user taps the same mode button that's already active in `quickActionOnly`, it upgrades to `promptMode`:

```tsx
const handleNavPointerUp = useCallback((mode: SmartMenuMode, pointerType: string) => {
  if (pointerType === "touch") {
    // If already in quickActionOnly for this mode, upgrade to prompt mode
    if (viewState === "quickActionOnly" && activeMode === mode) {
      activateMode(mode);
    } else {
      activateQuickActions(mode);
    }
  } else {
    activateMode(mode);
  }
}, [activateMode, activateQuickActions, viewState, activeMode]);
```

This also needs the `quickActionOnly` nav bar's NavButtons to pass the `activeQAMode` through — which they already do. The NavButton touch handler already calls `onPointerTap(item.id, "touch")`, so no NavButton changes needed.

**One callback change, no other files affected.**

### Interaction summary (mobile)
- **Button tap 1** → quick links for that mode (no prompt box, no keyboard)
- **Button tap 2** (same mode) → prompt box opens for that mode
- **Button tap** (different mode while in quickActionOnly) → switches quick links to new mode
- **Invisible gap tap** → prompt box for Play (unchanged)

