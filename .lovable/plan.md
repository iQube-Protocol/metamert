
Fix the runtime handshake and cartridge delivery path without changing the menu geometry again.

## Why it is slow now

The delay is not a real “load time” problem so much as a broken delivery pipeline:

1. `EmbedFrame` and `ShellContext` both listen for `RUNTIME_READY`, but they do it differently.
   - `EmbedFrame` only accepts `ev.data?.type === "RUNTIME_READY"`
   - `ShellContext` uses `normalizeInbound()` and accepts enveloped/stringified messages
   - result: readiness is inconsistent and can be missed by one layer

2. `RuntimeFrame` never passes `onReady` to `EmbedFrame`.
   - bootstrap is only sent on iframe `onLoad`
   - if the runtime build expects or benefits from a post-`RUNTIME_READY` replay, it never gets it

3. Cartridge selection no longer follows the existing dual-dispatch pattern.
   - it currently goes through `launchCartridge()`
   - that sends a direct iframe `PROMPT_SUBMIT` plus `LAUNCH_CARTRIDGE`
   - it does not use the authoritative `promptAction()` / shell prompt path that was previously generating the conversational response
   - so both the prompt side and the cartridge layer side became fragile

4. Runtime-only actions are over-blocked behind the “true ready” queue.
   - Persona / Identity / Cartridge overlay actions wait for `iframeReadiness === "ready"`
   - when handshake signaling is delayed or missed, those actions sit in the queue far too long

## What to change

### 1. Unify handshake ownership in one place
Refactor the readiness flow so `RuntimeFrame` is the single source of truth for lifecycle events.

- Remove the separate `RUNTIME_READY` listener logic from `EmbedFrame`
- keep `EmbedFrame` focused on iframe element lifecycle only:
  - `probing`
  - `loading`
  - `loaded-unconfirmed`
  - `error`
  - `blocked`
- detect `RUNTIME_READY` only in the normalized message path used by `RuntimeFrame` / `ShellContext`

Result:
- no split-brain readiness state
- no missed ready events because of envelope shape differences

### 2. Make bootstrap idempotent and replay it once on true runtime readiness
Introduce a dedicated bootstrap helper in `RuntimeFrame`:

- send `SHELL_READY`
- send `HANDOFF`
- send `SET_THEME`
- send `DEVICE_CONTEXT_UPDATE`

Call it:
- once when the iframe element loads
- once again on the first normalized `RUNTIME_READY`

Use a guard so replay is controlled and intentional, not spammy.

Result:
- compatibility with runtime builds that are ready to receive bootstrap only after their internal client mounts
- no minute-long stall waiting on a one-shot bootstrap that arrived too early

### 3. Split “iframe-loaded” delivery from “runtime-confirmed” replay
Change queued runtime commands from “wait silently until ready” to a 2-phase model:

- Phase A: if the iframe element is loaded (`loaded-unconfirmed`), send the command optimistically immediately
- Phase B: keep a replay entry and resend once on first `RUNTIME_READY`
- remove the command only when:
  - a known ack arrives, or
  - the replay has happened and no further retry is needed

Use this for:
- `OPEN_PERSONA_IQUBE`
- `OPEN_IDENTITY_IQUBE`
- `LAUNCH_CARTRIDGE`

Result:
- commands do not sit idle for 60+ seconds
- slow handshake no longer blocks first delivery attempt
- runtime still gets a guaranteed replay after full readiness

### 4. Restore cartridge dual-dispatch exactly
Refactor cartridge selection so it restores the original two-path behavior:

```text
select cartridge
  -> update local cartridge/codex state
  -> immediately send prompt path through shell prompt/API flow
  -> send cartridge overlay open to iframe
  -> replay overlay open on true RUNTIME_READY if needed
```

Concretely:
- stop using direct iframe `PROMPT_SUBMIT` as the primary cartridge prompt path
- reuse the shell’s existing prompt pipeline (`submitPrompt` / `promptAction`) so cartridge selection again produces the runtime response/content selection behavior
- keep `LAUNCH_CARTRIDGE` as a separate overlay action
- preserve the required nested payload contract:
  - `{ type: "LAUNCH_CARTRIDGE", payload: { cartridge_id } }`

Result:
- cartridge selection again does both things:
  1. generates the conversational/content response
  2. opens the cartridge layer

### 5. Keep Persona and Identity fast without reintroducing old races
Preserve the current “no `SELECTOR_CHANGE` on persona click” rule, but change delivery behavior:

- persona pill click still sends only `OPEN_PERSONA_IQUBE`
- identity still sends only `OPEN_IDENTITY_IQUBE`
- both dispatch immediately once the iframe element exists
- both replay once on `RUNTIME_READY`

This keeps the known-good drawer contract while removing the long wait.

### 6. Tighten the feedback UI without touching nav behavior
Do not alter SmartMenu hover geometry in this pass.

Only update the feedback copy/state so it reflects the new lifecycle accurately:
- “Connecting runtime…” = iframe not yet loaded
- “Launching…” / “Opening…” = command sent, awaiting replay/confirmation
- clear feedback as soon as command is delivered/replayed

### 7. Clean the submenu ref warning
Fix the `Function components cannot be given refs` warnings in `SmartMenuSubmenu.tsx`.

That warning is not the root cause of the handshake delay, but it is noisy and can mask real lifecycle issues during debugging. Clean it in the same pass so the preview signal is trustworthy again.

## Files to update

- `src/components/EmbedFrame.tsx`
  - remove direct `RUNTIME_READY` ownership
  - keep only iframe element status reporting
  - keep `loaded-unconfirmed` as visual state only

- `src/components/RuntimeFrame.tsx`
  - centralize normalized runtime readiness handling
  - add idempotent bootstrap helper
  - replay bootstrap once on first `RUNTIME_READY`

- `src/contexts/ShellContext.tsx`
  - replace strict ready-only queue behavior with staged send + replay
  - separate replay tracking for runtime-only actions
  - restore cartridge dual-dispatch using shell prompt flow plus overlay launch
  - keep persona/identity contract unchanged

- `src/components/SmartMenuSubmenu.tsx`
  - keep feedback badge but align it with staged send/replay states
  - fix ref-warning source

- `src/test/persona-flow.test.ts`
  - keep current contract locked

- `src/test/submenu-interactions.test.tsx`
  - add regression coverage for cartridge selection restoring both prompt + overlay behavior

- `src/test/shell-state.test.ts`
  - add normalized `RUNTIME_READY` envelope/string cases
  - add staged-send/replay queue coverage

## Verification

### Handshake
- iframe load should trigger immediate bootstrap
- first normalized `RUNTIME_READY` should trigger one controlled bootstrap replay
- queued commands should no longer wait a minute before first delivery attempt

### Persona / Identity
- click Identity before full handshake:
  - immediate feedback
  - first send on iframe load
  - replay on `RUNTIME_READY`
- click Persona pill before full handshake:
  - same behavior
- no `SELECTOR_CHANGE` should be sent for persona drawer open

### Cartridge
- selecting a cartridge must again do both:
  - produce a prompt-driven response/content selection
  - open the cartridge layer
- if handshake is delayed, the prompt path must still start immediately
- overlay launch must replay on `RUNTIME_READY` if the first send was too early

### Regressions to lock in
- no nav activation-zone changes
- no submenu persistence changes
- no loss of queued actions on rapid repeated clicks
- no direct double-nesting of `payload` in cartridge/persona messages

## Technical note
The repeated `HEAD ... status 0` probe requests are expected with `mode: "no-cors"` and are not themselves the 60-second bottleneck. The real bottleneck is the current handshake/delivery sequencing and the cartridge path bypassing the shell’s authoritative prompt flow.
