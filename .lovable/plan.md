

## Root Cause

The prompt box visibility has TWO gates:
1. **`showPrompt`** (computed from `shellState` + config policy) — this IS `true` once `post-welcome`
2. **`overlayVisible`** (auto-hides after 4000ms) — this becomes `false` and never recovers

When the iframe completes its welcome, `WELCOME_COMPLETE` fires → `shellState` changes to `"post-welcome"` → overlay shows briefly → auto-hides after 4s. When user then types a prompt in the iframe, `shellState` doesn't change (already `"post-welcome"`), so the `useEffect` that calls `setOverlayVisible(true)` doesn't re-fire. The prompt box stays hidden.

## Fix

**Expose an `overlayTrigger` counter from `ShellContext`** that increments on every inference lifecycle signal. `Index.tsx` watches this counter and re-shows the overlay.

### Changes

1. **`src/contexts/ShellContext.tsx`**:
   - Add `overlayTrigger` state (number, starts at 0)
   - Increment it inside the message handler whenever any lifecycle signal fires (INFERENCE_START, INFERENCE_COMPLETE, WELCOME_COMPLETE, prompt lifecycle signals)
   - Expose `overlayTrigger` in context value

2. **`src/pages/Index.tsx`**:
   - Read `overlayTrigger` from `useShell()`
   - Add it to the existing `useEffect` dependency that calls `setOverlayVisible(true)` (alongside `shellState`)
   - This ensures every inference signal from the iframe re-shows the overlay with a fresh 4s auto-hide timer

### Technical Detail

```text
iframe prompt flow:
  → runtime emits INFERENCE_START
  → ShellContext handler: setShellState("post-welcome"), overlayTrigger++
  → Index.tsx useEffect fires (overlayTrigger changed)
  → setOverlayVisible(true), scheduleHide() (4s timer)
  → PromptBox renders visible
  → runtime emits INFERENCE_COMPLETE
  → overlayTrigger++ again → overlay re-shows with fresh timer
```

No changes needed to `shell-messages.ts` or `iframe-origin.ts` — those are already correct from the previous edit.

