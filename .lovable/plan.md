
# Fix the Persona flow end to end

## What is broken right now

There are two separate issues in the current shell code:

1. **The shell boots into an invalid persona state**
   - `DEFAULT_PERSONAS` now hides `metame-persona` in `src/lib/smart-menu-config.ts`
   - but `ShellContext` still initializes `activePersonaId: "metame-persona"`
   - so the shell starts with an active persona that does not exist in the rendered list

2. **Persona selection is doing two different runtime actions at once**
   - `selectPersona()` currently sends:
     - `SELECTOR_CHANGE` with `selector_type: "persona"`
     - `OPEN_PERSONA_IQUBE`
   - the runtime owner’s contract for opening the drawer only requires `OPEN_PERSONA_IQUBE`
   - that matches your symptom exactly: **runtime content refreshes, but the persona drawer does not open reliably**

A third gap is making this harder to debug:

3. **There is no persona-specific acknowledgment path**
   - cartridges have explicit overlay lifecycle handling
   - personas do not
   - so the shell cannot tell the difference between:
     - submenu render problem
     - wrong outbound message
     - runtime ignore/no-op
     - runtime opens then immediately replaces the drawer

## Implementation plan

### 1. Make persona state internally consistent
Update the persona model so hidden personas cannot leave the shell in an impossible state.

Files:
- `src/lib/smart-menu-config.ts`
- `src/contexts/ShellContext.tsx`

Changes:
- Replace the comment-hidden `metaMe` approach with an explicit visible/hidden rule in the persona config, or a dedicated filtered constant for rendered personas.
- Set the default `activePersonaId` to a visible persona (`qripto-persona` unless you want `knyt-persona`).
- Ensure `personaState.available` only contains personas the submenu should actually render.
- Add a guard so if the active persona is not in `available`, the shell automatically falls back to the first visible persona.

Result:
- The shell never starts with a missing persona.
- Persona pills always have a valid active selection.

### 2. Make persona opening use one canonical runtime action
Refactor the end-to-end persona click flow so it does exactly one thing for drawer opening.

Files:
- `src/contexts/ShellContext.tsx`
- `src/lib/shell-messages.ts`

Changes:
- Create one canonical mapper:
  - `qripto-persona -> "qripto"`
  - `knyt-persona -> "knyt"`
- Remove the loose fallback logic (`everything else -> qripto`).
- Change `selectPersona()` so it:
  1. updates local shell state
  2. sends the canonical `OPEN_PERSONA_IQUBE` message
  3. only sends `SELECTOR_CHANGE` if runtime actually needs that for persona sync
- If selector sync is still required, separate it into an explicit secondary sync step instead of bundling it into “open drawer”.

Preferred behavior:
```ts
postToIframe(iframeRef.current, {
  type: "OPEN_PERSONA_IQUBE",
  payload: { iqube_type: "knyt" | "qripto" },
}, origin);
```

Result:
- Clicking a persona pill opens the drawer instead of refreshing content.
- The shell follows the runtime owner’s contract exactly.

### 3. Make the submenu render robustly instead of silently failing
Harden the Persona submenu so missing data becomes visible immediately.

Files:
- `src/components/SmartMenuSubmenu.tsx`

Changes:
- Render persona pills from the validated visible persona list.
- Keep persona pills left-justified as requested.
- Keep cartridge pills right-justified as requested.
- Add a small fallback empty state if the visible persona list is empty:
  - e.g. “No personas available”
- Keep metaMe hidden for now.

Result:
- If persona config ever breaks again, the UI will show a clear state instead of “nothing appears”.

### 4. Add persona-specific diagnostics and success criteria
Make the bridge observable so this cannot regress silently.

Files:
- `src/contexts/ShellContext.tsx`
- `docs/SHELL_CONTRACT.md`
- `docs/RUNTIME_THINCLIENT_REFERENCE.md`

Changes:
- Add focused logging around persona actions:
  - quick action opened persona selector
  - persona selected
  - `OPEN_PERSONA_IQUBE` dispatched with chosen `iqube_type`
- If the runtime already emits any persona-related inbound event, wire it into the shell logger.
- If not, document the missing ack explicitly and treat `OPEN_PERSONA_IQUBE` as a fire-and-forget command with a known limitation until runtime adds an acknowledgment.
- Update docs so the canonical flow is accurate:
  - Be → Persona → visible persona pills
  - pill click → local state update + `OPEN_PERSONA_IQUBE`
  - no extra inference/content refresh side effect

Result:
- Future debugging becomes straightforward.
- The documented contract matches the actual implementation.

### 5. Add regression tests for the exact failure you hit
Add unit coverage around the shell-side persona contract.

Files:
- `src/test/...` new or existing test files

Tests:
- default active persona must exist in `DEFAULT_PERSONAS`
- hidden metaMe persona is not rendered
- `personaId -> iqube_type` mapping is exact
- `OPEN_PERSONA_IQUBE` is envelope-safe and not double-nested
- selector rendering uses the visible persona list, not a stale hardcoded default

Result:
- This specific regression is caught automatically next time.

## Technical notes

### Root cause summary
```text
Current flow:
Be -> Persona -> personaSelector -> click pill
  -> SELECTOR_CHANGE(persona)
  -> OPEN_PERSONA_IQUBE(...)
  -> runtime refreshes content
  -> drawer open is lost / ignored / superseded

Target flow:
Be -> Persona -> personaSelector -> click pill
  -> local activePersonaId updates
  -> OPEN_PERSONA_IQUBE(...)
  -> runtime opens requested drawer
```

### Files to touch
- `src/lib/smart-menu-config.ts`
- `src/contexts/ShellContext.tsx`
- `src/components/SmartMenuSubmenu.tsx`
- `src/lib/shell-messages.ts` if type tightening is needed
- `docs/SHELL_CONTRACT.md`
- `docs/RUNTIME_THINCLIENT_REFERENCE.md`
- test file(s) under `src/test/`

## Expected outcome after the fix

- The Be menu shows only:
  - Settings
  - Persona
  - Memory
  - Identity
  - Connections
- Persona submenu shows only:
  - Qripto
  - KNYT
- Persona options are visibly left-aligned
- Cartridge options remain right-aligned
- Clicking `Qripto` opens the Qripto persona iQube drawer
- Clicking `KNYT` opens the KNYT persona iQube drawer
- No unwanted runtime prompt refresh replaces the drawer
- The shell starts in a valid persona state every time
