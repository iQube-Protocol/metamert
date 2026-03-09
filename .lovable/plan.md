

## Why It's Not Working

The `handleNavBarHoverEnter` handler on the `<nav>` element (line 217) has this guard:

```typescript
if (e.target !== e.currentTarget) return;
```

This means it only fires when the pointer enters **directly on the `<nav>` element itself** -- not on any child. But the nav is filled with three child `<div>` wrappers (lines 219, 222, 227) that occupy nearly all the space. There is almost no bare `<nav>` surface to hover over, so the condition almost never passes.

## Plan

**File: `src/components/SmartMenu.tsx`**

1. Change `handleNavBarHoverEnter` to check whether the pointer target is a `<button>` (or inside one) rather than requiring it to be the `<nav>` itself. This way, hovering the gaps between buttons (which land on the `<div>` wrappers or the `<nav>`) will trigger the prompt, but hovering directly onto a button will not.

```typescript
const handleNavBarHoverEnter = useCallback((e: React.PointerEvent) => {
  // Only trigger on empty space -- not on buttons
  if ((e.target as HTMLElement).closest("button")) return;
  if (e.pointerType === "touch") return; // touch has its own path
  if (Date.now() - navRestoredAt.current < 400) return;
  activateMode("play");
}, [activateMode]);
```

2. Move the handler from the `<nav>` element to its container `<div>`, or additionally attach `onPointerMove` to catch cases where the pointer enters through a child div but then moves into empty space. The simplest robust approach: use `onPointerMove` on the `<nav>` with a check that the direct target is not a button, and a guard ref to avoid repeated activation.

Recommended minimal approach -- keep `onPointerEnter` on `<nav>` but replace the `e.target !== e.currentTarget` check with `closest("button")`:

```typescript
if ((e.target as HTMLElement).closest("button")) return;
```

This single-line fix in `handleNavBarHoverEnter` should make it work.

