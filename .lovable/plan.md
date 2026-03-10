

## Black box on right side in prompt mode

**Root cause**: The prompt bar wrapper `<div style={{ display: isPromptMode ? 'flex' : 'none' }}>` creates a flex **row** container (default `flex-direction: row`). The `SmartMenuPromptBar` inside it doesn't have `width: 100%` or `flex: 1`, so it only takes up as much width as its content needs, leaving a gap on the right side where the dark background bleeds through.

**Fix** in `src/components/SmartMenu.tsx` (line 191):

Add `className="w-full"` to the prompt bar wrapper div, or change it to use `display: block` instead of `display: flex`:

```tsx
// Line 191 — change from:
<div style={{ display: isPromptMode ? 'flex' : 'none' }}>

// To:
<div style={{ display: isPromptMode ? 'block' : 'none' }}>
```

Single line change in one file.

