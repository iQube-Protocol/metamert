
What’s happening

1) Center-cluster hover is still activating prompt mode because the gap zones fire instantly on `onPointerEnter`. When moving toward Earn/Play/Make, the cursor often crosses a side gap first, so prompt mode opens before the button interaction.

2) Outside click/tap is not reliably closing because most “outside” area is the embedded runtime iframe. Clicks inside that iframe do not bubble to the parent document, so current parent-level handlers miss them.

3) Mobile is still intermittent because `handleNavAreaPointerUp` still checks `e.target !== e.currentTarget`, which drops taps that land on child wrappers instead of the nav element itself.

Plan

1) Make gap activation intentional (desktop)
- In `SmartMenu.tsx`, change gap hover activation from immediate to hover-intent (short delay + cancel on leave), so crossing gaps while aiming for center buttons won’t trigger prompt mode accidentally.
- Keep existing menu-item tap/click behavior unchanged.

2) Make outside dismissal reliable across iframe boundaries
- In `Index.tsx`, add a transparent dismiss overlay above `RuntimeFrame` only when `viewState` is `promptMode` or `quickActionOnly`.
- Overlay tap/click calls `deactivateMode()`, ensuring one-tap close even when runtime is inside cross-origin iframe.

3) Fix mobile empty-area tap reliability
- In `SmartMenu.tsx`, update `handleNavAreaPointerUp` to ignore only real button taps (`closest("button")`) instead of using `target/currentTarget` equality.
- This makes taps on non-button nav space consistent.

4) Preserve chevron and existing item behaviors
- No changes to chevron collapse/expand behavior.
- No changes to “tap menu item” inference/UI behavior path.

Technical details

Files to update:
- `src/components/SmartMenu.tsx`
- `src/pages/Index.tsx`
- (optional cleanup) `src/components/SmartMenuPromptBar.tsx` if any redundant outside-click logic remains after overlay-based dismissal.

Validation checklist:
- Desktop: hovering side gaps opens prompt; hovering center buttons alone does not open prompt.
- Desktop/mobile: clicking/tapping outside menu (including runtime area) closes prompt/quick actions.
- Mobile: empty nav-space tap reliably opens quickActionOnly.
