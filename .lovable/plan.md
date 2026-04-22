

# Make Persona mimic Cartridge exactly, and Identity mimic Wallet exactly

## Goal
Stop the bespoke "minimalist" handling for Persona and Identity. Reuse the two delivery patterns that already work reliably:

- **Persona ⇒ Cartridge pattern** (overlay command + shell prompt pipeline)
- **Identity ⇒ Wallet pattern** (AA-API menu-action + optional iframe action + shell prompt pipeline)

No new mechanisms. No new queues. Just reuse the working paths.

## What changes

### 1. Persona — mirror Cartridge exactly
In `src/contexts/ShellContext.tsx`, refactor `selectPersona` so it does the same three things `launchCartridge` does, in the same order:

1. Update local persona state (`activePersonaId`) — equivalent to cartridge state update.
2. Send the explicit runtime overlay command:
   - `OPEN_PERSONA_IQUBE` with `payload: { iqube_type }`
   - dispatched via the same staged-send path Cartridge uses (so it survives slow handshake the same way `LAUNCH_CARTRIDGE` does).
3. Run the shell prompt pipeline via `submitPrompt(...)` with a generic persona-protocol prompt, e.g.:
   - "Tell me about the {personaLabel} persona in the iQube protocol."
   - This is the placeholder prompt — content can be refined later.

Result: clicking a persona pill behaves structurally identically to clicking a cartridge pill. The drawer opens via the overlay message; the runtime also produces a conversational response via the same prompt pipeline that cartridges use.

Drop the current "persona must never bundle a prompt" restriction in code and update the persona-iqube-contract memory to reflect the new contract (overlay + prompt, never SELECTOR_CHANGE).

### 2. Identity — mirror Wallet exactly
In `src/components/SmartMenuSubmenu.tsx`, treat the Identity quick action like Wallet instead of branching into a custom `openIdentityIQube()` path.

Identity action will, in this order:

1. `handleMenuAction("identity")` — AA-API menu-action path (same as Wallet's `apiAction`).
2. Optional direct iframe action: `sendIframeAction("open_identity_iqube")` (or the existing `OPEN_IDENTITY_IQUBE` overlay message), used as the immediate UI nudge — same role Wallet's iframe action plays.
3. `submitPrompt("Tell me about identity in the iQube protocol.")` — shell prompt/inference pipeline, identical to Wallet.

Remove the special-case early-return for `action.id === "identity"` in `handleAction` so Identity flows through the same generic dual-dispatch branch Wallet already uses.

Keep `openIdentityIQube()` available as the iframe-action helper, but it is no longer the sole delivery path.

### 3. Cartridge — leave as-is
`launchCartridge` already does:
- state update
- `LAUNCH_CARTRIDGE` overlay (nested `payload.cartridge_id`)
- `submitPrompt(...)`

No changes. This is the reference pattern.

### 4. Wallet — leave as-is
Wallet already runs `handleMenuAction(apiAction)` + `sendIframeAction(iframeAction)` + `submitPrompt(prompt)` from the generic quick-action branch in `SmartMenuSubmenu.tsx`. This is the reference pattern for Identity.

### 5. UI feedback
Keep the existing `PendingRuntimeBadge` so the user still sees "Opening…" / "Launching…" feedback while the staged overlay message replays on handshake. No nav geometry changes.

### 6. Memory + tests
- Update `mem://integration/persona-iqube-contract` to: "Persona click MUST mirror Cartridge — overlay `OPEN_PERSONA_IQUBE` + shell `submitPrompt`. SELECTOR_CHANGE still forbidden on persona click."
- Add/refresh memory note: "Identity click MUST mirror Wallet — `handleMenuAction('identity')` + optional iframe action + `submitPrompt`."
- Update `src/test/persona-flow.test.ts` to assert: overlay message sent AND `submitPrompt` invoked, and SELECTOR_CHANGE NOT sent.
- Add a test in `src/test/submenu-interactions.test.tsx` for Identity invoking the same three-call pattern Wallet uses.

## Files to update
- `src/contexts/ShellContext.tsx` — extend `selectPersona` to also call `submitPrompt`; keep staged overlay send.
- `src/components/SmartMenuSubmenu.tsx` — remove Identity early-return; let Identity flow through the generic Wallet-style branch (apiAction + iframeAction + prompt).
- `src/lib/smart-menu-config.ts` — ensure the Identity quick action has `apiAction: "identity"`, `iframeAction: "open_identity_iqube"`, and a generic `prompt` string ("Tell me about identity in the iQube protocol."). Same for Persona pills' generic prompt source if needed (or generate the prompt inline in `selectPersona`).
- `src/test/persona-flow.test.ts` — update expectations.
- `src/test/submenu-interactions.test.tsx` — add Identity = Wallet-pattern coverage.
- `mem://integration/persona-iqube-contract.md` — update rule.
- `mem://index.md` — update Core line about persona to reflect new contract.

## Verification

### Persona (must match Cartridge behavior)
- Clicking Qripto/KNYT pill:
  - opens the persona iQube drawer in the runtime (overlay message)
  - produces a conversational response in the runtime about that persona
  - never sends `SELECTOR_CHANGE`

### Identity (must match Wallet behavior)
- Clicking Identity:
  - hits AA-API menu-action `identity`
  - sends the iframe overlay/menu action to open the Identity iQube drawer
  - produces a conversational response about identity in the iQube protocol

### Cartridge / Wallet
- No behavior change. Both must continue to work exactly as before.

### Regressions to lock
- No change to nav hover geometry.
- No change to submenu persistence.
- No reintroduction of `SELECTOR_CHANGE` on persona click.
- LAUNCH_CARTRIDGE envelope still nests `cartridge_id` under `payload`.

