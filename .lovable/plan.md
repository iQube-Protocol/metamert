

# Fix: Launch the codex when launching a cartridge

## Root cause

The runtime mounts cartridge surfaces in response to **`SELECTOR_CHANGE { selector_type: "codex", id: <codex_id> }`**, NOT `selector_type: "cartridge"`. From inside the runtime, clicking a cartridge actually fires the codex selector — that's why launching from the iframe works while launching from the shell menu doesn't.

Current `launchCartridge()` in `src/contexts/ShellContext.tsx` sends:

1. `SELECTOR_CHANGE { selector_type: "cartridge", id: "metame-runtime" }` — **runtime ignores for mount**
2. `PROMPT_SUBMIT { text, cartridge_id, codex_id }` — runtime processes the prompt (which is why you see the metaMe / KNYT / Qriptopian intro replies), but never mounts the cartridge surface

So the prompts arrive, the inference runs, but no cartridge ever actually launches. The user just confirmed the disambiguation: **cartridge ≡ codex for launch purposes**.

## Fix

Rewrite `launchCartridge()` to mount via the codex selector instead of the cartridge selector, then seed the intro prompt as before.

New sequence per click:

1. **`SELECTOR_CHANGE { selector_type: "codex", id: <default_codex_id> }`**
   - This is the contract the runtime actually mounts on (same path the in-runtime cartridge picker uses).
   - Cartridge → codex mapping comes from `DEFAULT_CARTRIDGES[].default_codex_id`:
     - `metame-runtime` → `metame-core`
     - `qriptopian` → `qriptopian-codex`
     - `knyt` → `knyt-codex`
2. **`SELECTOR_CHANGE { selector_type: "cartridge", id: <cartridge_id> }`** *(kept as a secondary hint)*
   - Runtime can use it to label the active cartridge pill, but mount no longer depends on it.
3. **`PROMPT_SUBMIT { text: <seed prompt>, cartridge_id, codex_id }`**
   - Same per-cartridge greeting as today (metaMe / Qriptopian / KNYT mappings preserved, `Open the {label} cartridge.` fallback).

Local state, optimistic header overlay (floppy + ✕), and the 4s trust/reliability pulse all remain unchanged.

## Files touched

- `src/contexts/ShellContext.tsx` — change the body of `launchCartridge()` so the **first** outbound message is `SELECTOR_CHANGE { selector_type: "codex", id: codexId }`, followed by the existing cartridge selector hint and the seeded `PROMPT_SUBMIT`.

## Files NOT touched

- `src/lib/smart-menu-config.ts` — `default_codex_id` already correct for all three cartridges
- `src/lib/shell-messages.ts` — `selector_type: "codex"` already typed
- `src/components/SmartMenuSubmenu.tsx` — already routes through `selectCartridge` → `launchCartridge`
- `src/components/RuntimeHeader.tsx` — overlay rendering unchanged

## Result

| Cartridge link | Before | After |
|---|---|---|
| metaMe | Prompt fires, no cartridge mount | Codex `metame-core` mounts + intro prompt |
| Qriptopian | Prompt fires, no cartridge mount | Codex `qriptopian-codex` mounts + intro prompt |
| KNYT | Prompt fires, no cartridge mount | Codex `knyt-codex` mounts + intro prompt |

Header cartridge icon + ✕ continue to appear immediately on click (optimistic overlay preserved). Lightning bolt remains driven by `runtimeContext` only.

