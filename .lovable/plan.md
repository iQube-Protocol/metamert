

# Instructions for Claude Code: Make iQube drawers (Persona, Identity) open as fast as Wallet/Cartridge

Paste the following as a single instruction block to Claude Code working in the metaMe Runtime repo (the Next.js runtime app, NOT this Lovable shell).

---

## Context

The Lovable thin-client shell sends drawer-open messages to the runtime iframe. Wallet and Cartridge drawers open near-instantly. Persona (`OPEN_PERSONA_IQUBE`) and Identity (`OPEN_IDENTITY_IQUBE`) drawers open very slowly or not at all.

Root cause is on the **runtime side**, not the shell side:

1. The runtime's `MetaMeRuntimeClient.onShellMessage` handler for `LAUNCH_CARTRIDGE` is bound very early in the runtime bootstrap. Wallet opens via a built-in **prompt intent** in the runtime's inference/router layer, which is also available immediately.
2. The handlers for `OPEN_PERSONA_IQUBE` and `OPEN_IDENTITY_IQUBE` are bound **later** in the runtime lifecycle (after the relevant drawer components mount), so early shell messages are dropped.
3. Neither Persona nor Identity has a corresponding fast-path **prompt intent** in the runtime router, so the inference fallback never opens the drawer either.
4. The runtime never reliably emits `RUNTIME_READY` in production sessions, so the shell cannot use it as a gate.

The shell already triple-dispatches `OPEN_PERSONA_IQUBE` and `OPEN_IDENTITY_IQUBE` (canonical envelope, hybrid, flat) — that is not the problem. The problem is the **runtime's** message handling and intent routing.

## What to change in the runtime

### 1. Bind `OPEN_PERSONA_IQUBE` and `OPEN_IDENTITY_IQUBE` handlers at the same lifecycle stage as `LAUNCH_CARTRIDGE`

In `MetaMeRuntimeClient` (or whichever module owns `onShellMessage`):

- Move the registration of `OPEN_PERSONA_IQUBE` and `OPEN_IDENTITY_IQUBE` to the **same bootstrap point** where `LAUNCH_CARTRIDGE` is registered, not inside the persona/identity drawer components' `useEffect`.
- The handler should set a global runtime store flag (e.g. `personaDrawer.open = true`, `personaDrawer.iqubeType = "knyt"`), not directly call into a not-yet-mounted component.
- Whenever `PersonaIQubeDrawer` / `IdentityIQubeDrawer` mounts, it reads from that store flag and opens itself if the flag is set. This decouples message arrival from component mount order.

This alone will fix ~90% of the perceived slowness.

### 2. Add a small inbound message buffer

In the runtime's shell-message bridge, keep a 32-entry FIFO of inbound messages received before the runtime is fully bootstrapped. On bootstrap completion, replay the buffer through the registered handlers.

This makes the runtime tolerant of shell messages that arrive before any handlers exist (which is what's happening with Persona/Identity today).

### 3. Add prompt intents for `persona` and `identity` so the inference path can also open the drawer

In the runtime's prompt router (the same module that maps `"open my wallet"` → wallet drawer):

- Add a `persona` intent that matches phrases like `"open persona"`, `"qripto persona"`, `"knyt persona"`, `"tell me about the * persona"` and opens the Persona iQube drawer with the matched `iqube_type`.
- Add an `identity` intent that matches `"identity"`, `"open identity"`, `"identity iqube"`, `"tell me about identity in the iqube protocol"` and opens the Identity iQube drawer.

This gives Persona and Identity the same dual-path reliability Wallet has: the drawer opens either via the direct iframe message OR via the prompt-inference fast path, whichever wins.

### 4. Emit `RUNTIME_READY` reliably

The shell already listens for `RUNTIME_READY` via `normalizeInbound()`. The runtime must:

- emit `{ type: "RUNTIME_READY" }` to `window.parent` once `MetaMeRuntimeClient` has finished bootstrapping AND the shell-message handlers (including persona/identity) are bound.
- emit it via `window.parent.postMessage(...)` with `targetOrigin: "*"` (the shell normalizes origins).
- emit it exactly once per mount, but it is safe to emit again on full re-mount.

Without this, the shell's replay-on-ready logic never fires.

### 5. (Optional) Acknowledge drawer-open messages

For each of `LAUNCH_CARTRIDGE`, `OPEN_PERSONA_IQUBE`, `OPEN_IDENTITY_IQUBE`, post back an ack envelope to the shell:

```
{ type: "DRAWER_OPENED", payload: { drawer: "persona" | "identity" | "cartridge", id?: string } }
```

The shell can use this to clear its "Opening…" badge deterministically and to stop any retry attempts. Not required for the speed fix, but eliminates the need for the shell to do timer-based retries.

## What NOT to change

- Do not change the message **type names** (`OPEN_PERSONA_IQUBE`, `OPEN_IDENTITY_IQUBE`, `LAUNCH_CARTRIDGE`). The shell contract is correct.
- Do not require additional fields in the envelopes. Persona uses `payload.iqube_type` ∈ `"knyt" | "qripto"`. Identity has empty payload. Cartridge uses `payload.cartridge_id`.
- Do not require the shell to wait for `RUNTIME_READY` before sending — the buffer in step 2 must handle early arrivals.

## Verification (runtime side)

1. Hard reload the runtime in the iframe. Click Persona → KNYT in the shell within the first 1 second of load. The drawer should open within ~250ms, not after 30+ seconds.
2. Same test for Identity.
3. Confirm `RUNTIME_READY` is observed in the shell's console (`[ShellContext] RUNTIME_READY received`).
4. Confirm that sending an `OPEN_PERSONA_IQUBE` message via DevTools `window.postMessage` to the iframe always opens the drawer, regardless of whether any persona-related component is currently mounted.
5. Confirm Wallet and Cartridge behavior is unchanged.

## Reference: shell-side envelopes Claude Code should expect

```
// Persona (triple-dispatched by shell)
{ type: "OPEN_PERSONA_IQUBE", source: "shell", payload: { iqube_type: "knyt" | "qripto" }, msg_id, timestamp }
{ type: "OPEN_PERSONA_IQUBE", iqube_type: "knyt" | "qripto", payload: { iqube_type: ... }, msg_id, timestamp, source: "shell" }
{ type: "OPEN_PERSONA_IQUBE", iqube_type: "knyt" | "qripto" }

// Identity (triple-dispatched by shell)
{ type: "OPEN_IDENTITY_IQUBE", source: "shell", payload: {}, msg_id, timestamp }
{ type: "OPEN_IDENTITY_IQUBE", payload: {}, msg_id, timestamp, source: "shell" }
{ type: "OPEN_IDENTITY_IQUBE" }

// Cartridge (single envelope, already working)
{ type: "LAUNCH_CARTRIDGE", source: "shell", payload: { cartridge_id: "metame-codex" | "qripto-codex" | "knyt-codex" }, msg_id, timestamp }
```

The runtime should accept all three persona/identity shapes (it likely already does for cartridge — same normalization).

---

End of instruction block for Claude Code.

