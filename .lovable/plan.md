# Render cartridge indicator + persona handle in shell header

You're right — I wired the protocol state into context but didn't surface it visually. Two gaps to close:

1. **Cartridge indicator + close button.** `openCartridges` is populated by `metame:cartridge-opened/-tab-changed/-closed`, but `RuntimeHeader` only renders the legacy `cartridgeOverlay` chip (driven by a different runtime path). Need a new tile per open cartridge with the right icon, accent color, label, and an X that calls `closeCartridge(id)` (which already posts the canonical `metame:cartridge-closed` envelope back into the iframe).

2. **"Be" pill not updating.** The pill already reads `personaState.activeHandle`. The new `metame:persona-changed` handler ONLY calls `fetchActivePersona()` (server re-fetch), per the strict contract. If that proxy returns null/unauth (which it likely is — aa-proxy `active-persona` requires a valid bearer that the shell may not have when only the iframe is signed in), the handle never updates. Need diagnostics + a pragmatic fallback that still respects the privacy boundary.

## Scope

### 1. New header tile component — `src/components/CartridgeIndicator.tsx`
- Reads `openCartridges`, `closeCartridge` from `useShell()`.
- Renders one chip per open cartridge in the order they were opened. Each chip: cartridge accent-colored icon (look up via `cartridgeState.available` for `accentHex`/`icon`; fallback to `Save`/`Box` and `var(--mm-ink-secondary)`), short `displayLabel` (truncated, hidden on mobile), and an `X` close button with `aria-label`.
- Tooltip shows full label + current `tab`/`subTab` when present.
- Uses existing `--mm-*` tokens — same chip styling as the current `cartridgeOverlay` indicator (variant background, hairline border, radius-xs).

### 2. Wire into `RuntimeHeader`
- Pull `openCartridges`, `closeCartridge` from `useShell()` and mount `<CartridgeIndicator />` in the right-hand cluster, immediately to the LEFT of the existing `cartridgeOverlay` chip (so canonical metame chips sit before the legacy floppy chip; both can coexist during transition).
- No changes to the center lightning bolt or the legacy overlay path.

### 3. Persona handle — diagnose + transitional fallback in `ShellContext.tsx`
- On `metame:persona-changed`, log the fetch result clearly: `[Shell] persona fetch →` with surface or `null`/error reason.
- Add a transitional fallback: if the event payload carries `displayLabel` or `ownFioHandle` (some versions of the runtime still inline these alongside the canonical event), apply them immediately while the proxy fetch resolves. Log `[Shell] persona handle from event payload (transitional)` so we can see it firing. Strictly avoid reading any forbidden field (`personaId`, `authProfileId`, `rootDid`, `kybeAttestation`).
- On `metame:persona-revoked` keep current behaviour (clear handle).
- Update `parseMetameEvent` to preserve `displayLabel` / `ownFioHandle` on the persona-changed variant (currently dropped) — surface-only fields, contract-safe.

### 4. Tests
- Extend `src/test/metame-protocol.test.ts`:
  - persona-changed parser preserves optional `displayLabel`/`ownFioHandle`.
  - persona-changed parser still drops forbidden fields (`personaId`, `authProfileId`, `rootDid`, `kybeAttestation`).

### 5. Out of scope
- Breadcrumb showing `tab`/`subTab` in main header — only in tooltip for now.
- Avatar imagery — text label only.
- Replacing or removing the legacy `cartridgeOverlay` floppy chip.

## Verification
1. `bunx vitest run src/test/metame-protocol.test.ts`.
2. Manual: open KNYT codex inside the runtime → expect a KNYT-amber chip to appear in the header with close button. Click X → chip vanishes and the runtime tears down (for layered cartridges) or no-ops (codex-shell URLs).
3. Manual: switch persona inside the iframe → console shows the metame event AND the fetch result; "Be" pill updates either from the inline label (transitional) or the proxy result, whichever arrives first.

## Open question (we may need CC to confirm)
- Does `/api/wallet/active-persona` work when the SHELL has no bearer of its own (i.e., only the iframe is signed in)? If not, we'll need either a shell-side handoff or to permanently rely on the inline `displayLabel`/`ownFioHandle` in the event. The transitional fallback above keeps us functional either way.
