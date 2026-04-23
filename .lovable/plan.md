

# Restore canonical drawer-open paths for Identity and Persona

The runtime now has stable, permanently-bound handlers for `OPEN_PERSONA_IQUBE` and `OPEN_IDENTITY_IQUBE` (registered with `[]` deps, not gated on `RUNTIME_READY`). The shell must therefore stop routing these through the wrong paths and stop staging them for replay.

## Fix 1 — Identity uses `openIdentityIQube()` directly

**File:** `src/components/SmartMenuSubmenu.tsx`

In `handleAction` (inside `QuickActionsCarousel`), add a dedicated early-return branch for Identity, placed alongside the existing `cartridge` / `persona` / `browse` branches and BEFORE the generic dual-dispatch (`apiAction` / `iframeAction` / `submitPrompt`) block:

```ts
if (action.id === "identity") {
  pulseInference();
  openIdentityIQube();   // canonical OPEN_IDENTITY_IQUBE triple-dispatch
  resetIdleTimer("quickAction");
  return;
}
```

This bypasses `handleMenuAction("identity")`, `sendIframeAction("open_identity_iqube")`, and `submitPrompt(...)` — Identity is a drawer-open action, not an inference action.

**File:** `src/lib/smart-menu-config.ts`

In the Identity quick-action definition, remove the `apiAction`, `iframeAction`, and `prompt` fields (and any `triggersInference` flag if present). Keep only `id`, `label`, `icon`, and any visual/layout fields. With those fields removed, Identity will no longer be eligible for the generic prompt branch even if the early-return is ever reordered.

## Fix 2 — Persona sends `OPEN_PERSONA_IQUBE` directly, no staging

**File:** `src/contexts/ShellContext.tsx`, function `selectPersona()`

Remove the `stageRuntimeCommand(() => postPersonaIQubeOpen(...))` wrapper. Replace it with a direct, immediate call:

```ts
// before
stageRuntimeCommand(() => postPersonaIQubeOpen(iframe, origin, iqubeType));

// after
postPersonaIQubeOpen(iframe, origin, iqubeType);
```

Keep everything else in `selectPersona()` exactly as-is:
- local persona state update (`activePersonaId`)
- `submitPromptRef.current?.(...)` for the conversational prompt
- `setSubmenuTypeState("quickActions")` collapse

The `openPersonaIQube()` helper in `ShellContext` (used elsewhere) should also drop its `stageRuntimeCommand` wrapper for consistency — direct send only.

## What is NOT changing

- `postPersonaIQubeOpen()` / `postIdentityIQubeOpen()` / `openIdentityIQube()` helpers — already correct (triple-dispatch).
- Persona submenu-open step (`setSubmenuType("personaSelector")`) — works correctly.
- Cartridge, Wallet, Memory, Browse — untouched.
- `stageRuntimeCommand` itself — still used for any other commands that legitimately need replay; only the persona usage is removed.
- Nav geometry, submenu persistence, idle-timer behavior — unchanged.
- The `PendingRuntimeBadge` UI — kept; will simply rarely show now since direct sends land immediately.

## Tests + memory

- `src/test/persona-flow.test.ts` — update to assert that `postPersonaIQubeOpen` is invoked synchronously in `selectPersona` (no staging), and `submitPrompt` still fires.
- `src/test/submenu-interactions.test.tsx` — update the Identity test to assert `openIdentityIQube()` is called once, and `handleMenuAction` / `sendIframeAction` / `submitPrompt` are NOT called for the Identity action.
- `mem://integration/identity-iqube-contract.md` — update: Identity quick action calls `openIdentityIQube()` directly; no `apiAction`, no `iframeAction`, no `submitPrompt`.
- `mem://integration/persona-iqube-contract.md` — update: persona drawer-open is sent directly via `postPersonaIQubeOpen`, not via `stageRuntimeCommand`. Prompt leg still fires.
- `mem://index.md` Core lines for persona/identity — update wording to reflect "direct send, no staging" for persona and "direct openIdentityIQube only" for identity.

## Verification

1. Click Identity (Be menu) → Identity iQube drawer opens within ~250ms. No prompt response is generated (drawer-open only).
2. Click Persona → KNYT or Persona → Qripto → drawer opens within ~250ms; conversational prompt about that persona still appears in the runtime chat.
3. Cartridge launch (Play) — unchanged, still instant.
4. Wallet (Earn) — unchanged, still instant.
5. Memory and other prompt-only quick actions — unchanged.
6. No regression in submenu hover, persistence, or idle-collapse behavior.

