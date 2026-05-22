Root cause: the shell only updates the Be/persona label when it receives a parsed `metame:persona-changed` / `aa-persona-change-v1` message. The live console has no `[Shell] metame event` entries, so the active persona event is either not arriving, arriving before the listener is mounted, or arriving in a shape the parser does not accept. Because there is no resync request on `RUNTIME_READY`, the shell can remain stuck on the runtime/dev fallback label (`devagent`).

Plan:

1. Make persona sync listener always active
   - Move persona protocol handling into a listener that does not depend on `config` being loaded.
   - This prevents losing early active-persona broadcasts during iframe boot/sign-in hydration.

2. Add an explicit runtime persona resync
   - When the iframe sends `RUNTIME_READY` or auth/context readiness, post a small request such as `REQUEST_PERSONA_SURFACE` / `REQUEST_ACTIVE_PERSONA` to the runtime.
   - The runtime can respond with the canonical `metame:persona-changed` payload containing `displayLabel` and `ownFioHandle`.

3. Harden parser + fallback behavior
   - Accept the observed nested surface shapes already used by runtime payloads.
   - Treat `devagent` as a developer/internal fallback label, not a browser-safe persona label.
   - If no valid T1 display field exists, show literal `Be`, never `devagent`.

4. Add regression coverage
   - Test that `displayLabel: "Kn0w1"` beats any outer `devagent` field.
   - Test that revoked/sign-out clears the label back to `Be`.
   - Test that early/wrapped persona messages update `personaState.activeHandle`.

5. Validate in preview
   - Confirm console shows the parsed persona event.
   - Confirm Be label renders `Kn0w1` when that persona is active.
   - Confirm sign-out/persona revoke returns the nav label to `Be`.