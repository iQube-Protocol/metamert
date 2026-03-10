

## Bug: Second tap collapses instead of upgrading to prompt mode

**Root cause**: `activateMode()` in `ShellContext.tsx` (line 238) has a toggle guard that collapses if the same mode is already active in *either* `promptMode` or `quickActionOnly`. So when `handleNavPointerUp` calls `activateMode(mode)` on the second tap (to upgrade from quickActionOnly → promptMode), `activateMode` treats it as a "tap active mode again = collapse" toggle.

**Fix**: In `src/contexts/ShellContext.tsx`, change `activateMode`'s toggle guard to only collapse when already in `promptMode`, not `quickActionOnly`. When in `quickActionOnly`, tapping the same mode should upgrade to `promptMode`.

```tsx
// Line 238: Change this:
if (activeMode === mode && (viewState === "promptMode" || viewState === "quickActionOnly")) {

// To this:
if (activeMode === mode && viewState === "promptMode") {
```

This way:
- **Second tap in quickActionOnly** → `activateMode` no longer collapses, instead falls through to set `promptMode` (line 246)
- **Tap in promptMode** → still collapses as expected (toggle behavior preserved)
- **`activateQuickActions`** retains its own collapse logic for quickActionOnly (line 256), so tapping a *different* path to collapse still works

One line change, one file.

