

# Fix cartridge launching + add cartridge launch seed prompt

## Diagnosis (why nothing launches)

`launchCartridge()` currently fires THREE different messages back-to-back to the runtime for a single click:

1. `LAUNCH_CARTRIDGE` (a contract the runtime doesn't actually implement yet)
2. `MENU_ACTION { action_id: "cartridge.launch", codex_id }` (the runtime treats `codex_id` as a slug → "Codex not found" for metaMe / Qriptopian)
3. `SELECTOR_CHANGE { selector_type: "cartridge", id }` (the **documented, working** contract — see `docs/RUNTIME_THINCLIENT_REFERENCE.md` §7)

The runtime is receiving three conflicting intents in the same tick. Earlier the `MENU_ACTION` path was raising "Codex not found" for non-KNYT cartridges (because the runtime's menu-action handler resolves `codex_id` as a codex slug — and `metame-core` / `qriptopian-codex` aren't valid lookup keys on that path). Stacking three messages now leaves the runtime in an indeterminate state where the cartridge mount aborts.

Adding to that: the user instruction from earlier ("selecting a cartridge from the menu should also be sent to the iframe so that it initialises it as the first prompt") was never actually implemented — there is no `PROMPT_SUBMIT` seeded when a cartridge is launched from the menu.

## Fix

Rewrite `launchCartridge()` in `src/contexts/ShellContext.tsx` so it:

1. **Sends a single, canonical mount message** — `SELECTOR_CHANGE { selector_type: "cartridge", id: cartridgeId }` (the contract the runtime documents and already implements). Drop both `LAUNCH_CARTRIDGE` and `MENU_ACTION { cartridge.launch }` — they were the source of the "Codex not found" error and the current launch failure.

2. **Seeds an initialisation prompt** — immediately after the `SELECTOR_CHANGE`, send a `PROMPT_SUBMIT` with a per-cartridge greeting so the runtime opens the cartridge with a meaningful first turn instead of an empty surface. Mapping:
   - `metame-runtime` → `"Open the metaMe cartridge and orient me."`
   - `qriptopian` → `"Open the Qriptopian cartridge and show me what's available."`
   - `knyt` → `"Open the KNYT cartridge and walk me through it."`
   - Fallback for any future cartridge → `"Open the {label} cartridge."`

   The seed prompt is sent with the new `cartridge_id` + `codex_id` already in context so the runtime routes it to the freshly mounted cartridge.

3. **Keeps existing local state behaviour** — still updates `cartridgeState.activeCartridgeId` / `activeCodexId`, still optimistically shows the cartridge overlay (floppy + X) in the header, still pulses inference dots so the user gets visual feedback while the cartridge mounts.

4. **Header lightning bolt remains untouched** — driven only by `runtimeContext`, not by `cartridgeState` (existing rule preserved).

## Result

| Cartridge | Before (current) | After |
|---|---|---|
| metaMe | "Codex not found" / nothing | Mounts + seeded with intro prompt |
| Qriptopian | "Codex not found" / nothing | Mounts + seeded with intro prompt |
| KNYT | Nothing (broken by triple-message) | Mounts + seeded with intro prompt |

Header cartridge icon + ✕ close button continue to appear immediately on launch (already wired via the optimistic `setCartridgeOverlay` call, which the rewrite preserves).

## Files touched

- `src/contexts/ShellContext.tsx` — rewrite the body of `launchCartridge()` to send only `SELECTOR_CHANGE` + a per-cartridge seed `PROMPT_SUBMIT`.

## Files NOT touched

- `src/components/SmartMenuSubmenu.tsx` (already calls `selectCartridge` → `launchCartridge`)
- `src/lib/smart-menu-config.ts` (cartridge defs already carry `label` + `default_codex_id`, which is all the seed-prompt mapper needs)
- `src/components/RuntimeHeader.tsx` (overlay icon already reads `cartridgeOverlay`)

