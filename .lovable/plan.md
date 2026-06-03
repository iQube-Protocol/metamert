## Problems

1. **Co-pilot prompt step** currently anchors to `[data-tour="smart-menu-prompt"]` and calls `activateMode("play")`, so the card opens at the bottom (pointing at the menu cluster) and then jumps up to the prompt bar overlay. It should stay anchored to the bottom menu cluster the whole time.

2. **Sign In step** is anchored to `[data-tour="quick-action-wallet"]` (the Earn pill on the floating menu). It should instead point at the dedicated **Sign In quick action** we added to the Earn submenu — `[data-tour="quick-action-signin"]` — and then open the SmartWallet drawer with the signin deep link.

## Fix (single file: `src/components/tour/VisitorTour.tsx`)

### Step 4 — Co-pilot prompt
- Change `target` from `'[data-tour="smart-menu-prompt"]'` to `'[data-tour="smart-menu"]'`.
- Change `placement` from `"top"` to `"top"` (unchanged) but keep card anchored to the bottom cluster.
- Change `data.action` from `"show-prompt"` to `"reset"` so `runStepEffect` no longer calls `activateMode("play")`. The card stays put pointing at the bottom menu cluster.
- Update copy slightly so it still makes sense without the prompt bar being visible (e.g. "Tap any menu item to open the prompt bar — that's where you talk to your aigent.").

### Step 5 — Sign In
- Change `target` to `'[data-tour="quick-action-signin"]'`.
- Keep `placement: "top-end"`.
- Keep `data.action: "signin"`. In `runStepEffect` the `"signin"` case already: clears surfaces → `activateMode("earn")` (opens the earn submenu containing the signin pill) → `openWalletSignIn()` (deep-links the wallet to the Sign-In tab).
- Because `goToStep` waits for the anchor to mount before showing the card, the earn submenu will render first, then the card lands on the `quick-action-signin` pill, and the wallet drawer opens on the right with the Sign-In modal.

### Other steps — no changes
- Create Persona, Wallet, Settings, Activate Persona, Trust dots, Help — all stay as they are.

## Out of scope
- No design / card style changes.
- No changes to `DEEP_LINK_DISPATCH`, `ShellContext`, or runtime postMessage payloads.
- No changes to `SmartMenuSubmenu` (it already emits `data-tour="quick-action-${action.id}"`, so `quick-action-signin` is already in the DOM whenever the Earn submenu is open).