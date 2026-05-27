## Problem

The previous fix made `SmartMenu` `absolute` inside the runtime container so its submenu overlays the iframe. Side effect: the iframe now stretches to the full container height (the nav bar no longer reserves any layout space), so `RuntimeFrame` is taller than before and its content has shifted/sized differently than the original.

## Fix — `src/pages/Index.tsx`

Reserve the nav bar's vertical space at the bottom of the runtime container so the iframe occupies the same region it did before, while the absolutely-positioned `SmartMenu` still floats above for its expanded submenu/prompt states.

Change the runtime container wrapper to add bottom padding equal to the nav bar height (`4.25rem`, matching `SmartMenu`'s `<nav>` height):

```tsx
<div className="relative flex-1 overflow-hidden" style={{ paddingBottom: '4.25rem' }}>
  {menuActive && <div className="absolute inset-0 z-40" onClick={deactivateMode} />}
  <RuntimeFrame key={resetKey} />
  <BrowserSurfaceHost />
  <div className="absolute inset-x-0 bottom-0 z-50 pointer-events-auto">
    <SmartMenu />
  </div>
</div>
```

Notes:
- `RuntimeFrame` and `BrowserSurfaceHost` render inside the padded region → identical sizing to the pre-overlay layout.
- `SmartMenu` stays `absolute bottom-0`, so its collapsed nav bar (4.25rem) sits exactly where the reserved padding ends, and its expanded submenu/prompt-bar grows upward as an overlay over the iframe — no layout shift.
- `BrowserSurfaceHost` uses `absolute inset-0` and will fill the padded region, which is consistent with previous behavior (it already sat above the menu via `z-50` in its own component, and the nav remained visible underneath only when collapsed).

## Non-goals

- No changes to `SmartMenu` internals, `RuntimeFrame`, `BrowserSurfaceHost`, or the proxy fallback work from earlier turns.
- No change to focus-mode logic (`runtimeHints.focusMode` still hides the header).

## Verification

1. Welcome/home screen: iframe content position and size match the pre-overlay baseline.
2. Tap Be/Earn/Play/Make/Share: submenu/prompt bar expands upward as an overlay; iframe does not resize or shift.
3. Header hide via focus mode still works (padding stays at bottom, container grows in height).
