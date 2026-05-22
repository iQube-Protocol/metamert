## Diagnosis

One auth account (e.g. `dele@metame.com`) can own several personas. The shell is currently labelling the Be button from whichever persona surface arrives first or whichever surface the shell-auth context resolves to — that is often `devagent`, an account-level/default persona for the email, not the persona the user actually activated inside the runtime.

Two real causes:

1. The shell still treats any `displayLabel` / `ownFioHandle` on a persona-changed event as "the active persona", with no requirement that the event mark itself active. Account-level or default-persona payloads therefore overwrite the true active label.
2. The recent change made `devagent` unrenderable even when it is the active persona, which is wrong — `devagent` is a real persona and must render when the user has it active.

## Plan

1. Revert the global `devagent` filter
   - Remove the `/^devagent$/i` skip in `src/lib/metame-protocol.ts` and its tests.
   - `devagent` is a normal persona handle; the parser must not strip it.

2. Only accept persona surfaces that are marked active
   - In `parseMetameEvent`, prefer surface paths that explicitly identify the active persona: `surface.activePersona.{displayLabel,fio_handle,ownFioHandle}`, then `payload.activePersona.*`, then top-level only when the event carries `active: true` or `isActive: true`.
   - Account-level / candidate personas (no active marker) are ignored for label purposes.

3. Always carry persona id alongside the label
   - Extend `MetamePersonaChanged` to optionally include `personaId` (T1-safe id only, e.g. `knyt-persona`, `qripto-persona`, `metame-persona`, custom slug).
   - In `ShellContext`, key `personaState.activeHandle` on `{ personaId, handle }`. Only overwrite when the incoming event matches the active persona id, or when the event explicitly transitions the active persona.

4. Clear stale labels on persona transitions
   - On persona-changed with no resolvable active surface, do NOT keep the previous handle. Reset `activeHandle` to undefined so SmartMenu falls back to literal `Be`.
   - On `metame:persona-revoked` and on auth sign-out/sign-in transitions, reset `activeHandle` and re-request active persona from the runtime.

5. Bind label to runtime, not shell-auth
   - Keep the rule that the shell does NOT fetch `/api/wallet/active-persona` (shell auth differs from user auth).
   - On `RUNTIME_READY` and on detected auth changes inside the iframe, post `REQUEST_ACTIVE_PERSONA` and only adopt the response when it is an active-marked surface.

6. Regression tests
   - `devagent` renders when it arrives as `surface.activePersona.displayLabel`.
   - An account-level event with `displayLabel: "devagent"` and no active marker is ignored while `Kn0w1` is the confirmed active persona.
   - Logging in as a different user clears the previous active handle and adopts the new one.
   - Multiple personas under one email: switching active persona inside the runtime updates Be to the new persona’s handle and never reverts to a sibling persona's label.

7. Validate
   - Run focused metame-protocol + persona-flow tests.
   - In preview, sign in as `dele@metame.com`, switch among personas, confirm Be reflects only the active persona, including when active is `devagent`.

## Technical Notes

- Files touched: `src/lib/metame-protocol.ts`, `src/contexts/ShellContext.tsx`, `src/test/metame-protocol.test.ts`, possibly `src/lib/smart-menu-config.ts` (PersonaState shape).
- Contract reminder: only T1 surface fields (`displayLabel`, `ownFioHandle`, persona slug id) cross the boundary — never `authProfileId`, `rootDid`, or internal `personaId` UUIDs.
- Active-marker keys accepted (any of): `active: true`, `isActive: true`, presence under `surface.activePersona` / `payload.activePersona`.