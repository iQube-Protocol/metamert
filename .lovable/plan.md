

# Restore cartridge activation while keeping header-color decoupling

## What regressed

When we decoupled the header lightning bolt from cartridge selection, `selectCartridge()` was rewired to *only* dispatch `LAUNCH_CARTRIDGE` and stopped updating `cartridgeState`. That broke three things that have nothing to do with the header color:

1. The **active checkmark / accent on the cartridge pill** in the Play → Cartridge selector no longer moves to the chosen cartridge.
2. All outbound iframe and AA-API messages (`PROMPT_SUBMIT`, `MENU_ACTION`, `MODE_CHANGED`, `sendIframeAction`) carry the **stale `cartridge_id` / `codex_id`** ("qriptopian") regardless of what the user picked, so the runtime can't scope inference to the right cartridge.
3. The **active codex** no longer follows the cartridge default when switching.

## What we keep

- Header lightning bolt color stays driven exclusively by `runtimeContext` (coral for metaMe, amber for KNYT) — i.e. cartridge selection still does **not** tint the header.
- The cartridge overlay floppy-disk indicator added for Claude Code still works the same.
- The `LAUNCH_CARTRIDGE` message is still sent to the iframe so the runtime mounts the requested cartridge.
- The KNYT central quick-action remains the metaMe ↔ KNYT runtime-context toggle.

## The fix (one file: `src/contexts/ShellContext.tsx`)

Update `launchCartridge()` so it does both jobs cleanly:

1. **Dispatch `LAUNCH_CARTRIDGE`** to the iframe (unchanged).
2. **Update `cartridgeState`**: set `activeCartridgeId` to the new id and set `activeCodexId` to that cartridge's `default_codex_id`. This restores the active checkmark, restores correct outbound context enrichment, and re-aligns the codex selector — without touching the header lightning color (which now reads from `runtimeContext`, not `cartridgeState`).
3. Keep the existing post-select UX: switch the submenu back to `quickActions` and restart the idle timer.

`selectCartridge()` continues to delegate to `launchCartridge()`, so existing call sites (the cartridge pill in `SmartMenuSubmenu.tsx`) just work.

## Why this is safe

- `RuntimeHeader.tsx` no longer reads `cartridgeState.activeCartridgeId` for the lightning bolt — confirmed in the current file. So restoring local cartridge state cannot re-tint the header.
- The cartridge-overlay floppy-disk in the header reads `cartridgeOverlay` (set by the runtime's `CARTRIDGE_OVERLAY_ACTIVE` message), not `cartridgeState`, so its color logic is unaffected.
- All existing outbound enrichment (already wired to `cartridgeState.activeCartridgeId` / `activeCodexId`) starts working again with no other code changes.

## No changes needed in

- `src/components/RuntimeHeader.tsx`
- `src/components/SmartMenuSubmenu.tsx`
- `src/lib/smart-menu-config.ts`
- The Claude Code handoff (the iframe contract — `LAUNCH_CARTRIDGE` + `RUNTIME_CONTEXT_CHANGE` — is unchanged)

## Files touched

- `src/contexts/ShellContext.tsx` — restore `setCartridgeState({ activeCartridgeId, activeCodexId })` inside `launchCartridge()`.

