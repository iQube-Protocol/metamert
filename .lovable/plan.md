

# Fix: Floating quick action menu disappearing on hover

## Root Cause

There's a conflict between two hover handlers:

1. **SmartMenu.tsx** (outer wrapper) correctly calls `pauseIdleTimer` on pointer enter -- this clears all timers.
2. **SmartMenuSubmenu.tsx** (inner components: QuickActionsCarousel, CartridgeSelector, CodexSelector) each call `resetIdleTimer("hover")` on pointer enter -- this **restarts** the 3s countdown timer.

Because pointer events bubble, when the mouse enters a submenu child, `resetIdleTimer` fires and starts a new 3s timer, defeating the pause from the parent. After 3 seconds of hovering without other interaction, the submenu hides.

## Fix

Replace all `resetIdleTimer("hover")` calls inside `SmartMenuSubmenu.tsx` with `pauseIdleTimer()` so that hovering over any part of the floating menu keeps it visible. The parent's `onPointerLeave={resumeIdleTimer}` on the outer wrapper already handles restarting timers when the pointer leaves.

### Changes

**`src/components/SmartMenuSubmenu.tsx`** -- 3 edits:
- `QuickActionsCarousel`: change `onPointerEnter={() => resetIdleTimer("hover")}` to `onPointerEnter={pauseIdleTimer}`; destructure `pauseIdleTimer` instead of `resetIdleTimer`
- `CartridgeSelector`: same change
- `CodexSelector`: same change

