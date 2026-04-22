
# Stabilize SmartMenu activation zones and eliminate delayed/lost drawer launches

## What is actually going wrong

### 1) Play hover territory was over-reduced
The current nav layout gives both center gaps a fixed `2.5rem` width while the Be/Share sides each take `flex-1`. That means the edge activation zones now own too much of the space between the center cluster and the edge buttons. This matches your complaint: the balance is no longer 50/50.

### 2) Persona / Identity / Cartridge actions are not reliably reaching the runtime
The drawer and cartridge helpers themselves are already correct. The instability is in the delivery path:

- `ShellContext` only stores **one** pending runtime command (`pendingRuntimeCommandRef`)
- commands are flushed when `iframeReadiness === "ready"`
- `EmbedFrame` currently promotes the iframe to `"ready"` after a **5s fallback timeout even if `RUNTIME_READY` never arrived**
- drawer/cartridge actions have **no acknowledgement or retry**
- later clicks can overwrite earlier pending clicks before the runtime is truly ready

That combination can produce exactly the symptoms you described:
- clicks appear to do nothing
- actions fire very late
- a command can be lost if it was flushed on the fallback-ready state before the runtime handlers were actually live

## Implementation plan

### A. Restore the nav activation balance to 50/50
Update `src/components/SmartMenu.tsx` so the area between the center cluster and each edge item is split evenly:

- replace the current over-constrained edge/gap ownership
- make each side bridge explicitly divided into:
  - an inner half for Play activation
  - an outer half for Be or Share activation
- keep the enlarged Be/Share rollover zones, but cap them so they do not steal more than half of the bridge area
- preserve the existing hover-preview persistence and submenu travel grace

Result:
- Play regains half of each side bridge
- Be/Share still have materially larger rollover zones
- submenu hover behavior remains unchanged

### B. Separate “iframe loaded” from “runtime actually ready”
Harden the runtime lifecycle in `EmbedFrame`, `RuntimeFrame`, and `ShellContext`:

- stop treating the 5s fallback as true runtime readiness
- keep a distinct state for:
  - iframe element loaded / bootstrap sent
  - runtime handshake received (`RUNTIME_READY`)
- only flush runtime-bound drawer/cartridge commands after the real handshake
- if a fallback state is still needed for UX, use a non-command-flushing status like `loaded-unconfirmed` rather than `ready`

### C. Replace the single pending command with a real queue
Refactor `ShellContext` so runtime-bound actions use a FIFO queue instead of one mutable ref:

- queue persona drawer opens
- queue identity drawer opens
- queue cartridge launches
- optionally queue direct iframe actions that must not be lost before handshake

This prevents:
- later clicks overwriting earlier ones
- one slow startup silently dropping user intent

### D. Add delivery hardening for drawer and cartridge actions
For runtime-only actions, add a guarded dispatch path:

- enqueue while runtime is not handshaked
- flush in order on real `RUNTIME_READY`
- re-send bootstrap context on `RUNTIME_READY` before flushing queued commands
- keep origin handling centralized via `resolveIframeOrigin`

For cartridge launch specifically:
- route launches through the same reliable queue instead of immediate fire-and-forget when the runtime is not truly ready

### E. Give immediate inline feedback instead of silent waiting
Add visible feedback in the submenu layer while commands are queued:

- show a lightweight “Opening…” / “Connecting runtime…” state on the tapped Persona, Identity, or Cartridge control
- keep the active pill/button visually latched while waiting
- clear the loading state once the queued command is dispatched

This avoids the current “nothing happened” impression while the runtime finishes handshaking.

### F. Keep the existing drawer contract intact
Do not change the known-good contracts:

- persona pill click still sends **only** `OPEN_PERSONA_IQUBE`
- identity still uses `OPEN_IDENTITY_IQUBE`
- no `SELECTOR_CHANGE` is reintroduced into persona drawer opening
- no business logic is moved into the shell

## Files to update

- `src/components/SmartMenu.tsx`
  - rebalance bridge activation geometry
  - preserve submenu persistence behavior

- `src/components/EmbedFrame.tsx`
  - stop equating timeout fallback with true runtime readiness
  - expose a distinct non-handshake loaded state if needed

- `src/components/RuntimeFrame.tsx`
  - align bootstrap timing with the hardened readiness model
  - re-send bootstrap on real handshake if needed before queue flush

- `src/contexts/ShellContext.tsx`
  - replace single pending command ref with ordered queue
  - flush only on true `RUNTIME_READY`
  - route persona / identity / cartridge actions through the same reliable dispatcher
  - add queued/loading UI state exposure

- `src/components/SmartMenuSubmenu.tsx`
  - show inline loading feedback for queued runtime actions

## Verification

### Interaction checks
- hovering halfway between Be and the center cluster should trigger Be only on the outer half
- hovering the inner half of that bridge should trigger Play
- same behavior on the Share side
- submenu must still persist long enough to travel from nav item to floating submenu

### Reliability checks
- click Identity before the runtime handshake finishes → it should show loading, then open as soon as handshake completes
- click Persona, then a persona pill before handshake finishes → it should queue and open deterministically after handshake
- click Cartridge before handshake finishes → it should queue and launch once runtime is ready
- repeated rapid clicks should not overwrite each other unpredictably

### Regression tests to add/update
- SmartMenu zone behavior tests for balanced bridge ownership
- Shell queue tests proving multiple pending runtime commands are preserved in order
- tests that fallback iframe loaded state does **not** flush queued runtime commands
- rendered submenu tests for loading feedback and single-dispatch behavior

## Technical notes

```text
Current failure mode:
user click
  -> single pending command slot
  -> iframe marked "ready" by 5s timeout
  -> queued command flushes too early
  -> runtime not actually handshaked
  -> no ack / no retry
  -> action appears lost or arrives much later

Target behavior:
user click
  -> runtime command queue
  -> inline loading state
  -> real RUNTIME_READY received
  -> bootstrap confirmed
  -> queued commands flushed FIFO
  -> drawer / cartridge opens deterministically
```

The key fix is to stop treating timeout-based iframe availability as real runtime readiness, and to deliver runtime-only actions through an ordered queue instead of a single overwrite-prone pending ref.
