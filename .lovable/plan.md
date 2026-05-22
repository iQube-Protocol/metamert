## Diagnosis

The regression is from the last fix being too strict: `ShellContext` now ignores every `metame:persona-changed` event unless `parseMetameEvent()` marks it `isActive`.

That protects against a sibling/default persona like `devagent` overwriting the label, but it also means current runtime persona switch events that only send `displayLabel`, `ownFioHandle`, or `surface.displayLabel` are discarded. So switching personas no longer updates the Be label at all.

There is also a second issue: clicking a persona pill only updates `activePersonaId` for the icon tint and opens the drawer; it does not set `activeHandle`, so the visible label must wait for a runtime event. If that event is now ignored, the label appears frozen.

## Plan

1. Restore compatibility with the runtime's current persona-change events
   - Keep parsing `devagent` as a valid persona label.
   - Treat these as active persona surfaces:
     - `surface.activePersona.*`
     - `payload.activePersona.*`
     - `active: true` / `isActive: true`
     - runtime-originated `metame:persona-changed` / `aa-persona-change-v1` events that contain a usable T1 display surface (`displayLabel`, `ownFioHandle`, `surface.displayLabel`, etc.)
   - Still strip forbidden internal identifiers (`authProfileId`, `rootDid`, UUID persona IDs).

2. Stop the permanent `devagent` stickiness without blocking real `devagent`
   - Remove the rule that ignores all unmarked persona events.
   - Instead, add source-aware priority:
     - Explicit active surface always wins.
     - Runtime surface events with a display label can update the handle.
     - Shell/dev-auth fallback surfaces should not overwrite a previously confirmed runtime persona.
   - `devagent` should render only when it arrives through the same accepted runtime active/surface path as any other persona.

3. Update shell state transitions
   - On accepted persona-change with a label, set `personaState.activeHandle` immediately.
   - Infer `activePersonaId` from safe label/handle (`knyt` → `knyt-persona`, `qripto/qrypto` → `qripto-persona`) when possible, otherwise preserve the selected persona id.
   - On persona-revoked/sign-out, clear `activeHandle` back to `Be`.

4. Add regression coverage
   - A current runtime event with `surface.displayLabel: "Kn0w1"` updates the parsed surface as acceptable.
   - `devagent` is accepted when it is the event's actual active/runtime surface.
   - A generic account/default `devagent` payload does not override a stronger nested active persona surface.
   - Persona events with no display surface clear or preserve state only according to the intended transition, not by leaking a stale label.

5. Validate
   - Run the focused persona protocol tests.
   - Confirm the Be label can change again after persona switches, while `devagent` is no longer forced unless it is the actual active persona.