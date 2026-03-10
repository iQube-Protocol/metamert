

## Root cause of the flicker

The flicker is **not** caused by CSS animations — it's caused by **React unmounting and remounting the entire DOM tree** on every view state change.

The `SmartMenu` component uses three separate `return` branches:
1. `promptMode` → returns `<div>` with `<SmartMenuPromptBar />`
2. `quickActionOnly` → returns `<div>` with `<nav>` + buttons
3. `defaultNav` → returns `<TooltipProvider>` with `<div>` with `<nav>` + buttons

When you tap a nav button and the state changes from `defaultNav` → `quickActionOnly`, React sees completely different element trees (one wrapped in `TooltipProvider`, one not). It **destroys** the old nav bar DOM and **creates** a new one from scratch. This destruction + recreation is the visible flicker — no amount of removing CSS animations will fix it.

## Fix: Single unified render tree

Refactor `SmartMenu` to render **one persistent DOM structure** that conditionally shows/hides elements based on `viewState`, instead of three separate return branches.

### Changes in `src/components/SmartMenu.tsx`:

**Replace the three conditional returns** with a single return that:

1. Always renders the outer `<div className="flex flex-col">` wrapper
2. Always renders the `<nav>` element with the 5 nav buttons (never unmounted)
3. Conditionally renders the submenu above the nav (for all three cases: hover preview, quickActionOnly, promptMode)
4. Conditionally renders `<SmartMenuPromptBar />` **instead of** the nav buttons only when in `promptMode` — using CSS `display: none` / `display: flex` to hide/show the nav vs prompt bar, keeping both in the DOM
5. Wraps the whole thing in `TooltipProvider` always (it's just a context provider, no visual impact)

```text
<TooltipProvider>
  <div className="flex flex-col">
    {/* Submenu — shown in hover preview, quickActionOnly, or promptMode */}
    {submenuVisible && <SmartMenuSubmenu />}
    
    {/* Prompt bar — rendered but hidden unless promptMode */}
    <div style={{ display: isPromptMode ? 'flex' : 'none' }}>
      <SmartMenuPromptBar />
    </div>
    
    {/* Nav bar — rendered but hidden when promptMode */}
    <nav style={{ display: isPromptMode ? 'none' : 'flex' }}>
      ...5 NavButtons (always mounted)...
    </nav>
  </div>
</TooltipProvider>
```

This ensures the nav buttons are **never unmounted** during state transitions, eliminating the flicker entirely. The prompt bar can use `display: none` toggling since it doesn't need to preserve focus state across transitions (it auto-focuses on mount anyway).

### Key details:
- Move `TooltipProvider` to wrap everything (it was only on defaultNav before — harmless to keep always)
- The accent border color on the nav can still be set dynamically via inline style based on `activeMode`
- Touch/swipe handlers stay on the outer wrapper
- Hover preview, quickActionOnly submenu, and promptMode submenu all share the same conditional slot above the nav

One file changed: `src/components/SmartMenu.tsx`

