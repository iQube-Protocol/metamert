

## Plan: Simplify nav buttons + fix mobile gap triggers

### Changes in `src/components/SmartMenu.tsx`

**1. Remove double-tap from NavButton** (lines 302-323)

Replace the touch branch with simple single-tap only — same as current single-tap behavior (`activateQuickActions`). Remove the `sharedTapRef` double-tap tracking entirely.

```tsx
const handlePointerUp = (e: React.PointerEvent) => {
  e.stopPropagation();
  if (e.pointerType === "touch") {
    onPointerTap(item.id, "touch"); // single tap only → quickActionOnly
  } else {
    onAction(item.id);
    onPointerTap(item.id, e.pointerType); // desktop click → promptMode
  }
};
```

Remove `sharedTapRef` prop from NavButton (and the `sharedLastTouchTap` ref + all prop passing in the parent).

**2. Fix mobile gap triggers** (line 126-129)

Change `handleGapPointerUp` to call `activateMode("play")` instead of `activateQuickActions("play")`, so tapping invisible gaps on mobile mirrors desktop behavior (prompt box +