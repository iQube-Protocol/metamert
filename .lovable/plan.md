# Adopt the canonical `metame:*` client protocol

CC has shipped two app→shell protocols on `dev-beta.aigentz.me`:

1. **PersonaSpine** — `metame:persona-changed` / `metame:persona-revoked` (with `aa-persona-change-v1` kept as a one-release alias).
2. **CartridgePresenceRegistry** — `metame:cartridge-opened` / `-tab-changed` / `-closed` (bidirectional close).

The shell already partially handles the legacy persona alias. We need to (a) generalize the listener to the canonical names, (b) re-fetch persona from `/api/wallet/active-persona` on every persona event (don't trust event payloads), (c) track open cartridges, and (d) post `metame:cartridge-closed` back into the iframe when the user dismisses a cartridge in shell chrome.

## Scope

### 1. Shared metame protocol module — `src/lib/metame-protocol.ts` (new)
- Types: `MetamePersonaChanged`, `MetamePersonaRevoked`, `MetameCartridgeOpened`, `MetameCartridgeTabChanged`, `MetameCartridgeClosed`, `CartridgeState`.
- `parseMetameEvent(raw): MetameEvent | null` — accept raw or bridge-wrapped `{type, payload}` shapes; require `type.startsWith("metame:")` OR equal `"aa-persona-change-v1"` (legacy alias treated as `metame:persona-changed`).
- `postCartridgeClose(iframe, cartridgeId, origin)` helper that posts the canonical `{ type: "metame:cartridge-closed", cartridgeId, schemaVersion: 1 }`.

### 2. PersonaSpine wiring — `src/contexts/ShellContext.tsx`
- Replace the existing `personaSyncHandler` (lines ~727–790) with one that switches on `metame:persona-changed | aa-persona-change-v1 | metame:persona-revoked`.
- On **changed**: call `fetchActivePersona()` (server-authoritative) and update `personaState.activeHandle` + `activePersonaId` from the surface. Stop reading `displayLabel`/`ownFioHandle` off the event payload — the new contract is "hint only, re-fetch".
- On **revoked**: clear `activeHandle` + `activePersonaId` so SmartMenu's "Be" pill falls back to the default unauthenticated label.
- Keep the existing origin check (filter to runtime origin).
- Preserve the `[Shell] aa-persona-change-v1 received` style debug log under both names.

### 3. CartridgePresenceRegistry — `src/contexts/ShellContext.tsx`
- Add `openCartridges: CartridgeState[]` to context state with reducer-style updates per the brief (open replaces same id and pushes to end; tab-changed mutates entry; closed filters out).
- Add a second message handler that calls `parseMetameEvent` and dispatches the three cartridge events.
- Expose `openCartridges`, `activeCartridge` (last entry), and `closeCartridge(cartridgeId)` via the `useShell()` context. `closeCartridge` posts the canonical event into the iframe AND optimistically removes the entry locally (the existing `cartridgeState`/`cartridgeOverlay` flow stays untouched — this is additive).

### 4. UI surfacing (minimal, additive)
- No new chrome component in this pass beyond what already exists. The brief's icon stack/breadcrumb is optional; we'll expose the state via context so a future header tile can render it. Confirm with the user before adding visible chrome — ask in follow-up.
- One concrete consumer now: when a `metame:cartridge-closed` arrives from the app for a cartridge that matches the current `cartridgeState.cartridgeId`, dispatch the existing `deactivateMode()` / overlay close path so shell chrome stays in sync.

### 5. Tests — `src/test/metame-protocol.test.ts` (new)
- `parseMetameEvent` accepts raw + envelope shapes, rejects foreign types, treats `aa-persona-change-v1` as persona-changed.
- Reducer logic for cartridge open/tab/close (order preserved, dedupe on open, tab merge).

## Out of scope (call out, don't build)
- Header avatar/breadcrumb/icon-stack rendering — needs design input; ask user separately.
- Removing the `aa-persona-change-v1` alias — keep until CC announces removal.
- Any inbound persona event from shell→app — explicitly forbidden by the contract.
- Reserved future families (notifications, receipts, approvals, capsules).

## Technical notes
- Origin enforcement: continue to use `resolveIframeOrigin(config)` for both directions; CC requires our shell origin (`*.lovable.app`, custom domains) to be on `authAllowedOrigins` — flag to user that prod custom domains (`metame.dev`, `metame.live`, `runtime.metame.com`, `metamert.lovable.app`) must be confirmed allowlisted before close-intent will work in prod.
- Privacy: never log or store `personaId`/`authProfileId`/`rootDid` from events (we already only consume `displayLabel`/`personaId` hint — drop the latter on the new path since we re-fetch).
- Schema version: include `schemaVersion: 1` on outbound `metame:cartridge-closed`.

## Verification
1. `bunx vitest run src/test/metame-protocol.test.ts`.
2. Manual: in dev preview, watch console for `metame:persona-changed` / `metame:cartridge-opened` and confirm "Be" pill updates after sign-in and after persona switch.
3. Manual: open KNYT codex → confirm `openCartridges` populated (logged via `[Shell] cartridge opened …`).
