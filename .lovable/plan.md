

## Bug Analysis

### Bug 1: Hover preview quicklinks persist after cursor leaves menu area

**Root cause**: When a nav button is clicked, `handleClick` calls `onTap(item.id)` which triggers `activateMode()`, switching `viewState` to `"promptMode"`. The SmartMenu component then renders the prompt-mode branch instead of the default-nav branch. However, `hoverPreviewMode` state is **never cleared** during this transition -- it just becomes invisible because the prompt-mode branch doesn't read it.

When idle collapse fires and `viewState` returns to `"defaultNav"`, the default-nav branch renders again. Since `hoverPreviewMode` still holds its stale value (e.g. `"play"`), the hover preview submenu immediately renders -- even though the cursor is nowhere near the menu. There is no `onPointerLeave` event to clear it because the cursor was never over the newly rendered elements.

**Fix (SmartMenu.tsx only)**: Clear `hoverPreviewMode` whenever `viewState` transitions away from `"defaultNav"` (entering prompt mode) AND when it returns to `"defaultNav"` (idle collapse). Add a check: when `viewState` changes to `"promptMode"`, immediately set `hoverPreviewMode` to `null`. Also add a `navRestoredAt` guard (as previously discussed) to block phantom hover events for 400ms after nav restoration.

Concrete change: Add an effect or render-time check in `SmartMenu`:
```
// Clear hover preview when leaving defaultNav
if (viewState === "promptMode" && hoverPreviewMode !== null) {
  setHoverPreviewMode(null);
}

// Guard against phantom hovers after nav restoration
const navRestoredAt = useRef<number>(0);
if (viewState === "defaultNav" && prevViewState.current !== "defaultNav") {
  navRestoredAt.current = Date.now();
  // Also clear any stale hover state
  if (hoverPreviewMode !== null) setHoverPreviewMode(null);
}
```
Update `handleNavHoverEnter` to skip if within 400ms of `navRestoredAt`.

### Bug 2: Prompt bar stays stuck after manually collapsing the floating quick actions

**Root cause**: When the user clicks the chevron to hide quick actions, `toggleSubmenu()` sets `submenuVisibility` to `"hiddenUserToggle"` and calls `clearIdleTimer()` -- killing both the 3s submenu timer and the 4s full-collapse timer. 

After this, `resumeIdleTimer()` (called on `onPointerLeave` of the prompt-mode wrapper) checks `if (submenuVisibility === "hiddenUserToggle") return;` and **does nothing**. So no new idle timer is ever started. The prompt bar stays visible forever with no way to auto-collapse, even when the cursor leaves the area entirely.

**Fix (ShellContext.tsx only)**: `resumeIdleTimer` should still start the **full collapse timer** even when submenu is `hiddenUserToggle`. The user-toggle only hides the floating quick-action layer -- it should not prevent the prompt bar from eventually collapsing.

Concrete change in `resumeIdleTimer`:
```
const resumeIdleTimer = useCallback(() => {
  if (submenuVisibility === "hiddenUserToggle") {
    // Still start the 4s full-collapse timer, just skip the 3s submenu timer
    clearIdleTimer();
    idleTimerRef.current = setTimeout(() => {
      if (promptHasTextRef.current) return;
      setViewState("defaultNav");
      setActiveMode(null);
      setSubmenuTypeState(null);
      setSubmenuVisibility("visibleAuto");
    }, 4000);
    return;
  }
  startIdleTimer();
}, [startIdleTimer, submenuVisibility, clearIdleTimer]);
```

## Files Changed

1. **`src/components/SmartMenu.tsx`** -- Clear `hoverPreviewMode` on view-state transitions; add `navRestoredAt` guard in `handleNavHoverEnter`
2. **`src/contexts/ShellContext.tsx`** -- Update `resumeIdleTimer` to start the 4s collapse timer even when `submenuVisibility === "hiddenUserToggle"`

## What stays unchanged

- All other idle timer logic (3s submenu hide, carousel swipe ignoring, text-prevents-collapse)
- `toggleSubmenu` behavior (still toggles between visible/hidden states)
- `pauseIdleTimer` behavior
- `activateMode` / `deactivateMode` logic
- SmartMenuSubmenu and SmartMenuPromptBar -- no changes
- Hover preview actionability (clicking quick actions from hover still works)

