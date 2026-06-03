## Diagnosis

The Sign In card is anchored to the right DOM target initially, but the step effect opens runtime wallet UI immediately. That changes the layout and leaves Joyride with a target that is either offscreen, hidden, or no longer the intended focus, so Popper recalculates and moves the tooltip up near the header. The current controlled `stepIndex` also only waits for the target before showing a step; it does not protect against the target disappearing or scrolling after the step effect runs.

There is a second structural issue in the flow: the Cartridges step uses the header `cartridge-indicator`, which can be absent when no cartridge chip is open. In my browser pass, the flow skipped from Smart Menu to Co-pilot because that target was not present. Other later steps have the same risk if their menu submenu target is staged and then replaced by a runtime drawer.

## Plan

1. **Make tour staging deterministic**
   - Add a tour-only staging mode inside `VisitorTour.tsx` so each step has one stable shell anchor.
   - Wait for the target, then allow Joyride to render.
   - Add a short post-effect settle delay for menu animations before setting `stepIndex`.
   - Prevent wallet/runtime drawer side effects from firing before Joyride has anchored to the menu item.

2. **Fix Sign In flow**
   - Keep the Sign In step anchored to `[data-tour="quick-action-signin"]`.
   - Stage only the Earn quick actions before showing that step.
   - Move the wallet Sign-In deep link to the transition after the user clicks **Next**, so the card never jumps upward while explaining the Sign In button.
   - If the Sign In pill is horizontally clipped in the Earn carousel, scroll it into view before Joyride anchors.

3. **Fix Create Persona / wallet steps**
   - Apply the same pattern: anchor the step to a stable shell item first, then dispatch the runtime deep link when advancing.
   - For Create Persona, open the Create Persona wizard after the user leaves that explanatory step, not before the tooltip is positioned.
   - Keep the fallback to the Earn/Wallet menu item if runtime-internal wallet badges are not first-class shell anchors.

4. **Stop accidental skipped steps**
   - Replace the fragile Cartridges target with a stable header/runtime shell target, or guarantee a small stable `data-tour` anchor exists in the header even when no open cartridge chip exists.
   - Audit every step target:
     - `runtime-area` is always present
     - `smart-menu` is present only in default/quick-action mode
     - `quick-action-signin`, `quick-action-wallet`, `quick-action-settings` require staged mode/submenu
     - `trust-dots` and `help-button` require header visible
   - Make the runStepEffect for each step produce exactly the DOM needed for its target.

5. **Verify end-to-end**
   - Run the tour manually in the preview at the current viewport size.
   - Confirm every step appears in order and anchors to the intended UI:
     1. Runtime
     2. Smart Menu
     3. Cartridges
     4. Co-pilot prompt
     5. Sign In pill in Earn menu
     6. Create Persona / Wallet path
     7. SmartWallet
     8. Settings
     9. Activate Persona
     10. Trust & Reliability
     11. Help button
   - Check console logs for Joyride target-missing or runtime errors.

## Technical notes

- Main file: `src/components/tour/VisitorTour.tsx`.
- Likely small supporting edit: either `RuntimeHeader.tsx` or `CartridgeIndicator.tsx` if we need a stable always-present cartridge tour anchor.
- No backend, AA-API, Supabase, iframe protocol, or runtime business logic changes.