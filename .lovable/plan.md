
Goal: make the header R/T indicators animate in lockstep with real iframe inference (including welcome-state inference initiated inside the iframe), and stop only when inference/render is actually complete.

What I found in the current code
1) Animation styling is present
- `RuntimeHeader.tsx` correctly uses:
  - `animate-dot-wave` when `inferring === true`
  - staggered `animationDelay` (`i * 150ms`)
- `tailwind.config.ts` still defines `dot-wave` keyframes and animation.

2) The main issue is inference state signaling, not CSS
- `inferring` is only set to `true` in shell-owned actions:
  - `submitPrompt()`
  - `handleMenuAction()`
- During iframe-owned welcome prompt flow (spinner appears inside iframe), shell often never sets `inferring=true`.

3) Completion handling is currently too aggressive
- In `ShellContext.tsx`, any `STATE_SYNC` is treated like inference completion and schedules `inferring=false` after 2s.
- This can desync the indicators from the iframe spinner if `STATE_SYNC` is sent during processing.

4) Message parsing is fragile
- Current listeners read `e.data.type` directly and do not robustly normalize envelope-style payloads.
- `ShellContext` completion listener also lacks strict runtime-origin filtering, so it can react to unrelated window messages.

Implementation plan
1) Make iframe message handling inference-aware (start + complete), not completion-only
- File: `src/contexts/ShellContext.tsx`
- Replace current “`STATE_SYNC` always means complete” logic with a lifecycle parser:
  - Start inference (`setInferring(true)`) on:
    - explicit start-like message types (e.g. `INFERENCE_START`, `RENDER_START`, `PROCESSING_START` if present)
    - `STATE_SYNC` indicating processing/busy=true in payload/state
  - Complete inference (2s grace, existing behavior) on:
    - explicit completion types (`INFERENCE_COMPLETE`, `RENDER_COMPLETE`)
    - `STATE_SYNC` indicating processing/busy=false
- Keep existing 30s safety timeout.
- Keep existing shell-owned start triggers (`submitPrompt`, `handleMenuAction`) unchanged.

2) Normalize inbound message shapes before interpreting
- File: `src/lib/shell-messages.ts`
- Add a small helper to normalize iframe inbound events from either form:
  - direct: `{ type, ... }`
  - envelope/payload style: `{ type, payload: {...} }` and safely expose merged fields for consumers.
- This avoids missing state flags when runtime sends data under `payload`.

3) Apply strict origin guard for inference lifecycle listener
- File: `src/contexts/ShellContext.tsx`
- Use runtime origin derived from current config (same safe origin logic already used elsewhere) and ignore non-runtime `postMessage` events.
- This prevents accidental `inferring` toggles from unrelated messages.

4) Keep RuntimeFrame and ShellContext in sync on message interpretation
- File: `src/components/RuntimeFrame.tsx`
- Use the same normalization helper for inbound events, so `TRUST_UPDATE` and `STATE_SYNC` parsing are consistent.
- Preserve current toast suppression behavior.

Technical details (implementation-level)
- New inference lifecycle behavior:
  - `onInferenceStart()`:
    - clear any pending completion timer
    - set `inferring=true`
    - refresh 30s safety timer
  - `onInferenceComplete()`:
    - clear safety timer
    - start 2s grace timer
    - then set `inferring=false`
- `STATE_SYNC` handling:
  - no longer treated as unconditional completion
  - evaluated by payload state flags (processing/busy/inferring booleans)
- Envelope compatibility:
  - read fields from both top-level and `payload` to support protocol variants without regressions.

Why this addresses your exact complaint
- Right now, iframe spinner can run while shell indicators stay static because shell never receives/uses a start signal path for iframe-owned inference.
- This plan makes indicators start when iframe reports processing and only stop when iframe reports completion/rendered state (plus the existing 2s grace).

Validation plan (end-to-end)
1) Welcome flow (iframe-owned prompt)
- Trigger inference using the iframe’s own prompt input.
- Expected: R/T dots begin wave animation as spinner appears.
- Expected: animation continues during processing and through render, then stops after grace period.

2) Post-welcome flow (shell-owned prompt)
- Submit via shell `PromptBox`.
- Expected: same synchronized behavior.

3) Menu-triggered inference
- Tap `Earn/Play/Make`.
- Expected: indicators animate immediately and stay synced to runtime completion.

4) Idle behavior
- No spinner / no processing:
- Expected: indicators remain static, no phantom animation.

5) Mobile and desktop check
- Verify same synchronization behavior on both viewport classes.

Acceptance criteria
- Indicators animate whenever runtime spinner indicates active inference (including iframe-initiated inference).
- Indicators do not stop early while iframe is still processing.
- Indicators stop shortly after render completes (current grace behavior retained).
- No regressions to refresh/reset toast policy or menu/header layout.
