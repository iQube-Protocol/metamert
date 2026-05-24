# Why Earn is still dual-dispatching

The previous fix added `sendIframeAction("wallet")` to `handleNavPointerUp` in `SmartMenu.tsx` (drawer-only, good). But the Earn nav button still also fires the LLM round-trip from a different code path:

In `SmartMenu.tsx`, `NavButton.handlePointerUp` does — for any **non-touch** (desktop mouse) click:

```ts
} else {
  onAction(item.id);              // <-- handleMenuAction("earn") — AA-API menu-action + MENU_ACTION/prompt to iframe
  onPointerTap(item.id, e.pointerType);  // activateMode + sendIframeAction("wallet")
}
```

`onAction` resolves to `handleMenuAction` in `ShellContext.tsx` (line 952), which calls `menuAction(itemId, ctx)` against the AA-API and posts a `MENU_ACTION` (with `prompt`) to the iframe — that is the inference prompt the user is seeing.

The touch path goes only through `onPointerTap` (no `onAction`), which is why mobile behaves correctly. Desktop click triggers both.

# Fix

In `src/components/SmartMenu.tsx`, inside `NavButton.handlePointerUp`, skip the `onAction(item.id)` call when `item.id === "earn"`. Earn nav then performs only:

- `activateMode("earn")` (or `activateQuickActions` on touch) — expands submenu
- `sendIframeAction("wallet")` — opens wallet drawer (no LLM, no API)

Result: Earn nav opens the wallet drawer + expands the submenu on both desktop and mobile, with no LLM prompt dispatched. Other nav buttons (Be/Play/Make/Share) keep their existing `handleMenuAction` behavior on desktop.

No changes to `ShellContext`, the AA proxy, or submenu items.

## Files

- `src/components/SmartMenu.tsx` — one-line guard in `NavButton.handlePointerUp`
