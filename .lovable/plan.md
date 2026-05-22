Root cause: the shell is waiting for one exact event shape (`isActive` / `surface.activePersona`) and the latest devagent fallback filter can now ignore the only persona surface the runtime is actually sending. The AA shell-config still hydrates as `did:metame:dev-shell`, so the fix must treat the iframe runtime as the source of truth and stop relying on shell-config identity.

Plan:
1. Rework `ShellContext` persona handling into a small confidence-based reducer:
   - Explicit active persona events always win.
   - Non-devagent runtime persona surfaces update the Be label even without an active marker.
   - Ambiguous plain `devagent` only updates when explicitly active, or when there is no current runtime persona at all.
   - Persona pill clicks clear any stale `activeHandle` so the UI does not remain stuck on the previous label while waiting for runtime confirmation.
2. Broaden `parseMetameEvent` to recognize the likely runtime payload aliases, not just the narrow current keys:
   - `persona`, `currentPersona`, `selectedPersona`, `active_persona`
   - `name`, `displayName`, `fio`, `fioHandle`, `ownFioHandle`
   - active markers nested inside those objects.
3. Add focused regression tests for the real failure modes:
   - non-devagent persona updates without an active marker.
   - plain devagent cannot overwrite a known active non-devagent persona.
   - explicit active devagent still works.
   - nested/aliased active persona payloads parse correctly.
4. Validate with the focused persona tests and console diagnostics so we can see whether the runtime is sending no persona event versus sending an ignored shape.