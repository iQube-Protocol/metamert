

## Fix: Dark Mode Glass Float & Restore Original Dark Styling

### Problem
The `.dark .glass-float` CSS rule uses `hsla(var(--card), 0.45)` but `--card` contains raw HSL numbers (`213 50% 7%`), not a valid color. This produces an invalid CSS value, causing the browser to render a white/transparent background — the "white rim" around floating menus in dark mode.

### Root Cause
Before the light mode implementation, `.glass-float` used the same `hsla()` pattern universally. The light mode refactor split it into two rules but didn't fix the syntax for the dark override.

### Fix — 1 file

**`src/index.css`** (lines 287-292):

Replace the broken `.dark .glass-float` rule with correct `hsl()` syntax:

```css
.dark .glass-float {
  background: hsl(213 50% 7% / 0.45);
  backdrop-filter: blur(20px) saturate(1.5);
  -webkit-backdrop-filter: blur(20px) saturate(1.5);
  border-color: hsl(217 33% 17% / 0.3);
}
```

This hardcodes the original KNYT dark values directly instead of relying on the broken `hsla(var(--card), ...)` pattern. The values `213 50% 7%` and `217 33% 17%` match the dark mode `--card` and `--border` tokens exactly.

No other dark mode changes needed — the `--mm-*` dark tokens were already restored to the correct KNYT palette in a previous fix.

