

## Bug: Mobile gap tap shows quick links but no prompt box

**Root cause**: Event bubbling. The gap `onPointerUp` correctly calls `activateMode("play")` (full prompt mode), but the event propagates to the parent `<nav>` element's `onPointerUp` handler (`handleNavAreaPointerUp`), which then calls `activateQuickActions("play")` — overriding prompt mode with quickActionOnly mode (no prompt box).

**Fix**: One-line change in `src/components/SmartMenu.tsx`.

Add `e.stopPropagation()` to `handleGapPointerUp` so the tap doesn't bubble to the nav's handler:

```tsx
const handleGapPointerUp = useCallback((e: React.PointerEvent) => {
  e.stopPropagation();          // ← add this
  if (e.pointerType === "touch") {
    activateMode("play");
  }
}, [activateMode]);
```

No other files need changes.

