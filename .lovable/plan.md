

## Bug: Flicker returned on quickActionOnly nav bar

**Root cause**: Line 189 in `src/components/SmartMenu.tsx` has `animate-in fade-in` and `animationDuration: '350ms'` on the `<nav>` element inside the `quickActionOnly` block. This causes the entire nav bar to fade in when transitioning from `defaultNav` → `quickActionOnly`, creating a visible flicker.

Additionally, line 158 has the same `animate-in fade-in` on the `promptMode` wrapper div, which would cause a similar flicker when entering prompt mode.

**Fix** in `src/components/SmartMenu.tsx`:

1. **Line 158**: Remove `animate-in fade-in duration-350` and `animationDuration` style from the promptMode wrapper div
2. **Line 189**: Remove `animate-in fade-in` from the quickActionOnly `<nav>` element and remove `animationDuration: '350ms'` from its style

The submenu's own `animate-in fade-in slide-in-from-bottom-2` animations (lines 164, 184) should remain — those animate the floating quick-action layer smoothly. Only the nav bar / wrapper containers should not animate.

