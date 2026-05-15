Root cause: the shell is only reading `displayLabel` / `ownFioHandle` at the top level of `metame:persona-changed`. The runtime’s Pattern A payload can also put those fields inside `surface`, so the parser returns a persona event with no handle and the Be label stays stuck on the previous value (`devgent/devagent`). On sign-out, the revoke path also only clears `activeHandle`; it leaves the local active persona id/accent unchanged instead of returning the Be nav to its default state.

Plan:
1. Update `src/lib/metame-protocol.ts` so `parseMetameEvent` reads persona surface fields from both:
   - top-level `displayLabel` / `ownFioHandle`
   - nested `surface.displayLabel` / `surface.ownFioHandle`
   while still dropping forbidden identity fields like `personaId`, `authProfileId`, `rootDid`, and `kybeAttestation`.
2. Update persona state handling in `src/contexts/ShellContext.tsx`:
   - On `metame:persona-changed`, set `activeHandle` from the inline T1 label/handle and map the active persona id/accent when the handle indicates KNYT or Qripto.
   - On `metame:persona-revoked`, reset persona state to the default visible persona and remove `activeHandle`, so the nav label falls back to `Be`.
   - Remove the now-unused `fetchActivePersona` import to avoid reintroducing the dev-shell identity path.
3. Add/adjust regression coverage in `src/test/metame-protocol.test.ts` for nested `surface` payloads and revoked sign-out parsing, so this does not regress.