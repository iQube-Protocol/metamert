## Why it is still defaulting to `devagent`

The shell is still authenticating/hydrating as the fixed dev DID `did:metame:dev-shell` (`ShellContext.tsx:876-879`). The current network response confirms `shell-config` is requested with that dev-shell token and the response persona is `did:metame:dev-shell`.

The code correctly notes this is the wrong identity for the logged-in user inside the runtime iframe: shell auth can return `devagent`, while the iframe may be logged in as a different email/user with a different active persona. The shell must not let that dev-shell/account fallback drive the Be label.

The recent change removed the strict active gate, so any `metame:persona-changed` payload with `displayLabel` can update the Be label. That means if the runtime emits an account/default or resync fallback event like `displayLabel: "devagent"`, the shell accepts it as active even when it is just one persona attached to the account/email.

## Fix plan

1. **Add source-aware persona acceptance in `ShellContext.tsx`**
   - Keep accepting `devagent` when it is explicitly active (`event.isActive === true`).
   - Accept non-`devagent` runtime persona surfaces for compatibility with current runtime events.
   - Do not let an unmarked/plain `devagent` event overwrite the Be label, because that is the ambiguous account/default fallback causing stickiness.

2. **Track confidence of the current Be label**
   - Store whether the current handle came from an explicit active persona event or only a compatible runtime surface event.
   - Explicit active events always win.
   - Ambiguous fallback `devagent` only wins when no better active/surface persona has been seen, or when it is explicitly marked active.

3. **Harden `parseMetameEvent` tests**
   - Add regression coverage for:
     - `surface.activePersona.displayLabel: "devagent"` is accepted as active.
     - plain `displayLabel: "devagent"` parses but is treated as ambiguous by shell logic.
     - nested active persona beats outer/default `devagent`.
     - switching from `devagent` to `Kn0w1`/KNYT updates the handle.

4. **Add temporary diagnostic logging only where useful**
   - Log ignored ambiguous `devagent` events with enough shape/source context to confirm this is what the runtime is sending.
   - Avoid adding user-facing toasts.

5. **Validate**
   - Run focused persona protocol/state tests.
   - Confirm the Be label no longer sticks to `devagent` unless the runtime marks `devagent` as the active persona.