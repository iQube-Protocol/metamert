

## Problem

The `onPointerEnter={handleNavBarHoverEnter}` on the `<nav>` fires even when hovering over buttons, because child pointer events bubble up. The `closest("button")` guard helps but is unreliable — the hover enters the nav before reaching the button, causing flicker and blocking normal button interaction.

## Proposed Solution: Invisible Gap Triggers

Yes — dedicated invisible trigger zones are more reliable. Instead of trying to detect "empty space" via event delegation, we place explicit clickable/hoverable `<div>` elements in the gaps between the button groups. These zones:

- Span the space between **Be** and the central cluster (Earn/Play/Make)
- Span the space between the central cluster and **Share**
- Are invisible (`opacity-0`, no visual rendering) but respond to pointer/touch events
- On hover (desktop): activate prompt mode with "play" as default
- On tap (mobile): activate quick actions for "play"

### Layout Change

Current structure:
```text
[Be] [  Earn | Play | Make  ] [Share]
```

The `flex-1` on the center div stretches it, but the buttons inside don't fill all space. We add two explicit gap divs:

```text
[Be] [GAP] [Earn | Play | Make] [GAP] [Share]
```

Where each `[GAP]` is a `<div className="flex-1" />` that absorbs remaining space.

### File: `src/components/SmartMenu.tsx`

1. **Remove** `onPointerEnter={handleNavBarHoverEnter}` from the `<nav>` element (both default nav and quickActionOnly nav).

2. **Add two invisible gap trigger divs** between Be/center and center/Share in the default nav:

```tsx
<div
  className="flex-1 min-w-[8px]"
  onPointerEnter={(e) => { if (e.pointerType !== "touch") activateMode("play"); }}
  onPointerUp={(e) => { if (e.pointerType === "touch") activateQuickActions("play"); }}
/>
```

3. **Same gap triggers** in the `quickActionOnly` nav layout for consistency.

4. Change the center `<div>` from `flex-1` to `shrink-0` so it only takes the width of its buttons, letting the gap divs absorb the remaining space.

### File: `src/components/SmartMenuPromptBar.tsx`

5. **Fix outside-click**: Remove the `if (!promptInputFocused) return;` guard so clicking outside always closes the prompt bar.

### File: `src/pages/Index.tsx`

6. **Extend runtime click handler**: Also handle `viewState === "quickActionOnly"` to allow tapping the main content area to dismiss.

