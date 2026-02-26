
Current blocker to address
- The shell prompt appears only when `shellState` becomes `post-welcome`.
- In the failing path (initial load, first prompt typed inside iframe), that transition is not being reliably triggered from iframe lifecycle messages.

Implementation plan
1. Add a single shared iframe-origin resolver utility and use it everywhere (`EmbedFrame`, `RuntimeFrame`, `ShellContext`) so all inbound/outbound checks target the exact same origin.
2. Harden inbound message normalization in `src/lib/shell-messages.ts`:
   - parse stringified JSON payloads,
   - accept both `{ type, payload }` and `{ payload: { type, ... } }` envelopes,
   - keep normalized `type`, `source`, `status`, `busy/processing/inferring`.
3. Centralize welcome transition logic in `ShellContext` as one method (`transitionToPostWelcome(trigger)`), then call it for:
   - `INFERENCE_START`, `PROCESSING_START`,
   - `INFERENCE_COMPLETE`, `RENDER_COMPLETE`,
   - `WELCOME_COMPLETE`,
   - `STATE_SYNC` with `busy/processing/inferring` true/false,
   - fallback `PROMPT_SUBMIT` from runtime (first-prompt safety net).
4. Keep strict source/origin filtering, but add alias-safe handling (ignore duplicate transitions once already `post-welcome`).
5. Add dev-only lifecycle diagnostics (`type`, `origin`, `source`, `status`, `busy`) for the first prompt chain to confirm real runtime event sequence in failing sessions.
6. Normalize policy key compatibility in `Index.tsx` visibility logic:
   - support both `show_prompt` and `show_prompt_box`,
   - support `floating_input` as post-welcome prompt enable signal when explicit prompt flags are absent.

Technical details
```text
iframe first prompt
  -> runtime emits lifecycle event(s)
  -> ShellContext normalized inbound handler
  -> transitionToPostWelcome()
  -> shellState = post-welcome
  -> FloatingOverlay computes showPrompt = true
  -> PromptBox visible without quick-action click
```

Validation plan
1. Reproduce exact failing path: fresh load -> first prompt inside iframe -> confirm shell prompt appears with no menu interaction.
2. Repeat after `Refresh` and `Reset` actions.
3. Confirm no regressions for menu quick actions and shell-owned prompt submission.
4. Compare console diagnostic sequence against the event list you said you can share; adjust alias mapping only if runtime emits additional names.
