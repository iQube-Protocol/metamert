## Diagnosis

The shell is not hardcoded to start KNYT. It starts as `metame`, then two external inputs can flip it:

1. `GET https://dev-beta.aigentz.me/api/runtime/settings/context` currently returns `{"context":"knyt"}` in the preview network log, so the new hydration effect immediately applies KNYT.
2. The iframe can still send `RUNTIME_LEAD_CHANGE: knyt`, which this shell currently trusts unconditionally.

So even if the iframe UI/admin surface appears set to metaMe, the platform singleton that this shell reads is still returning KNYT, or the iframe is still broadcasting KNYT during startup.

## Plan

1. Add a small runtime-context preference guard in `ShellContext.tsx`:
   - Keep initial shell default as `metame`.
   - Remember user/shell-selected context in localStorage.
   - On startup, prefer the local `metame` value over stale server `knyt`.
   - Only accept server `knyt` if there is no local preference or the user explicitly selected KNYT.

2. Persist only intentional shell toggle changes:
   - `setRuntimeContext(next)` writes localStorage, sends `RUNTIME_CONTEXT_CHANGE`, and performs the existing server `PUT`.
   - `applyRuntimeContextFromRuntime(next)` does not persist stale iframe startup echoes unless they match a trusted current state.

3. Add targeted logging around context changes:
   - Log whether context came from local preference, server hydration, shell toggle, or iframe message.
   - This will make it obvious whether remaining flips are from server GET or iframe `RUNTIME_LEAD_CHANGE`.

4. Validate with browser/network signal:
   - Reload the preview.
   - Confirm the shell stays metaMe on first paint.
   - Confirm no `RUNTIME_LEAD_CHANGE: knyt` overrides it unless the user explicitly toggles to KNYT.

## Important note

The platform endpoint still needs to be corrected because the network snapshot shows `GET /api/runtime/settings/context` returning KNYT. This plan prevents the thin client from being dragged back into stale KNYT takeover while preserving the existing iframe protocol.