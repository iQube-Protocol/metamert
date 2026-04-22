
# Fix the iQube drawer regressions end to end

## Why this is failing now

This is no longer a message-shape problem first. The helper contracts for both drawers are already present:

- `postPersonaIQubeOpen()` triple-dispatches `OPEN_PERSONA_IQUBE`
- `postIdentityIQubeOpen()` triple-dispatches `OPEN_IDENTITY_IQUBE`

The more likely regression is in the UI interaction layer:

1. The rendered Be submenu controls are fragile
   - submenu buttons and persona pills still rely on click timing inside a hover/auto-hide system
   - recent hover-persistence and submenu-order changes increased the chance that the panel state changes before the drawer-open action is dispatched

2. The shell has helper-level tests but not rendered interaction tests
   - current tests validate the message helpers only
   - there is no regression coverage proving that clicking the actual Be quick links and persona pills invokes those helpers from the mounted UI

3. System-only drawer actions are spread across multiple paths
   - Persona open is a two-step UI flow
   - Identity open is a direct quick action
   - both need one hardened interaction path that is isolated from prompt/inference/menu-action behavior

## What to change

### 1) Harden the Be submenu interaction path
Update `src/components/SmartMenuSubmenu.tsx` so drawer-opening actions dispatch on stable pointer interaction, not fragile late click timing.

Implementation:
- Convert the system-action buttons/pills that open drawers from plain `onClick` handling to a guarded pointer handler (`onPointerUp`, with `stopPropagation`)
- Apply the same hardening to:
  - Persona quick action
  - Identity quick action
  - Persona selector pills
- Keep hover persistence intact while the pointer remains inside the floating panel
- Only restart the idle timer after pointer leave, not during the drawer-open interaction itself

Goal:
- the user action dispatches before any hover collapse or submenu state reset can interfere

### 2) Centralize drawer opens as explicit system actions
Refine `src/components/SmartMenuSubmenu.tsx` and `src/contexts/ShellContext.tsx` so both iQube drawers use one clean “system-only” execution path.

Implementation:
- Treat Persona and Identity as explicit shell-owned system actions
- Ensure they do not fall through to:
  - `handleMenuAction`
  - prompt submission
  - AA menu-action inference paths
  - selector refresh paths
- Keep the existing rule:
  - Persona must never send `SELECTOR_CHANGE`
  - Identity must never send persona-specific payload keys

Goal:
- drawer opens are fully decoupled from inference/menu behavior

### 3) Preserve submenu state correctly during drawer actions
Adjust the post-selection/menu-state behavior so the shell doesn’t visually snap back or collapse prematurely while dispatching the drawer-open message.

Implementation:
- Persona selector:
  - stays visible while hovered
  - fades only after pointer leaves and the idle timeout completes
- Identity quick action:
  - dispatches immediately without forcing a submenu reset before the message is sent
- Avoid any immediate submenu transition that can race the runtime open request

Goal:
- no more “menu flicker instead of drawer open”

### 4) Add UI-level regression tests, not just helper tests
Extend coverage under `src/test/` to lock in the real rendered interaction flow.

Add tests for:
- clicking the Be quick action `Persona` switches to `personaSelector`
- clicking a persona pill calls the persona open path exactly once
- clicking `Identity` calls the identity open path exactly once
- neither action falls through to `handleMenuAction`
- hover persistence does not block dispatch
- submenu order change does not alter action routing

Likely files:
- new/expanded UI interaction tests for `SmartMenuSubmenu`
- keep existing helper tests:
  - `src/test/persona-flow.test.ts`
  - `src/test/identity-flow.test.ts`

## Files likely involved

- `src/components/SmartMenuSubmenu.tsx`
- `src/contexts/ShellContext.tsx`
- `src/test/persona-flow.test.ts`
- `src/test/identity-flow.test.ts`
- one new rendered interaction test under `src/test/`

## Expected outcome

After the fix:

- Clicking `Persona` in the Be submenu reliably opens the persona selector
- Clicking `Qripto` opens the Qripto iQube drawer
- Clicking `KNYT` opens the KNYT iQube drawer
- Clicking `Identity` opens the Identity iQube drawer directly
- Hover persistence remains intact while the pointer stays over the submenu
- The submenu only auto-fades after the pointer leaves and the timeout expires
- No prompt submission or menu-action inference is triggered by these drawer actions
- Future submenu reorderings will not break drawer opening because the interaction path will be covered by rendered regression tests

## Technical notes

```text
Be quick action click
  -> shell system-action path
  -> drawer helper
  -> postMessage triple-dispatch
  -> runtime drawer opens

Persona pill click
  -> selectPersona(personaId)
  -> exact personaId -> iqube_type map
  -> OPEN_PERSONA_IQUBE only
  -> no SELECTOR_CHANGE
```

The key fix is to make the rendered submenu controls as robust as the message helpers already are.
