

## Problem

On mobile/tablet, tapping any nav icon immediately opens prompt mode, which auto-focuses the input and triggers the virtual keyboard. There's no way to browse quick actions without invoking the keyboard. Desktop solves this with hover previews, but touch devices have no hover.

## Proposed Solution: Tap vs Long-Press / Double-Tap Distinction

Introduce a **single-tap = quick actions only** (no prompt, no keyboard) vs **double-tap or long-press = full prompt mode** pattern, but only on touch devices. Desktop behavior remains unchanged.

### How it works

1. **Single tap on a nav icon (touch devices)**: Opens the floating quick action submenu for that mode, but does NOT enter prompt mode. The nav bar stays visible beneath the floating submenu. No input is rendered, so no keyboard appears. The same idle timers apply (3s submenu hide, 4s full collapse).

2. **Double-tap or swipe-up on a nav icon (touch devices)**: Enters full prompt mode with the input field (existing behavior). User explicitly wants to type.

3. **Tap on empty nav bar area**: Shows the **active/default (Play) mode's** quick actions without prompt mode (same as single-tap on Play).

4. **Desktop behavior**: Unchanged — hover previews + click enters prompt mode.

### New state: `quickActionOnly`

Add a new `ViewState` value: `"quickActionOnly"` — renders the nav bar with the floating submenu above it (like hover preview) but driven by tap state rather than hover. The submenu is fully actionable. Idle timers apply normally.

### Technical changes

| File | Change |
|------|--------|
| `src/lib/smart-menu-config.ts` | Add `"quickActionOnly"` to `ViewState` type |
| `src/contexts/ShellContext.tsx` | Add `activateQuickActions(mode)` action that sets `viewState: "quickActionOnly"` + `activeMode` without triggering prompt. Update idle collapse to handle this state. |
| `src/components/SmartMenu.tsx` | Detect touch vs pointer device. Single tap on touch → `activateQuickActions()`. Click on pointer → existing `activateMode()`. Add render branch for `viewState === "quickActionOnly"`: nav bar + floating submenu (no prompt bar). Add tap handler on empty nav area. |
| `src/components/SmartMenuPromptBar.tsx` | Remove auto-focus `useEffect` — instead, only focus when explicitly entering prompt mode (not quick-action-only). Or guard with a prop/context flag. |
| `src/components/SmartMenuSubmenu.tsx` | When in `quickActionOnly` mode and user taps a quick action that needs text input, transition to full prompt mode at that point. |

### Touch detection approach

Use `onTouchEnd` vs `onClick` differentiation. Set a `lastTouchTime` ref on `touchend`; in `click` handler, if `Date.now() - lastTouchTime < 500`, treat as touch-tap (quick actions only). Otherwise treat as pointer click (full prompt mode).

### Transition from quick-action-only to prompt mode

- User can swipe up on the nav bar or double-tap to enter prompt mode
- Typing into any future prompt input transitions naturally
- The prompt bar could show a subtle "tap to type" affordance instead of auto-focusing

