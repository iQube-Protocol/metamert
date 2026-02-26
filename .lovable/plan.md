

## Problem

The prompt box visibility is controlled by `shellState`:
- In `"welcome"` state: `show_prompt` defaults to `false` (line 104-105 of Index.tsx)
- In `"post-welcome"` state: `show_prompt` defaults to `true`

The transition from `"welcome"` → `"post-welcome"` only happens in two places in `ShellContext.tsx`:
1. Shell-owned actions (`submitPrompt`, `handleMenuAction`) — these explicitly call `setShellState("post-welcome")`
2. The iframe message listener — but only when `isInferenceStart()` or `isInferenceComplete()` matches

The iframe during its welcome flow likely doesn't send explicit `INFERENCE_START` or `STATE_SYNC { busy: true }` signals. It may send `WELCOME_COMPLETE` or other messages, but those are logged in `RuntimeFrame.tsx` without triggering any state transition. So the shell stays in `"welcome"` and the prompt box never appears.

## Fix

**File: `src/contexts/ShellContext.tsx`** — In the iframe message listener (around line 120-150), also transition to `"post-welcome"` when receiving `WELCOME_COMPLETE`. This message explicitly indicates the iframe's welcome sequence is done and the shell should take over prompt ownership.

Additionally, treat `PROMPT_SUBMIT` coming FROM the iframe (if the runtime echoes it) and any unrecognized activity-like signals as potential transition triggers.

**File: `src/components/RuntimeFrame.tsx`** — In the `WELCOME_COMPLETE` case handler, call a shell context method to trigger the state transition (or move the transition logic entirely into `ShellContext.tsx`'s listener which already runs).

### Implementation steps

1. **`src/contexts/ShellContext.tsx`** — In the inference lifecycle `useEffect` handler, add a branch after the inference start/complete checks:
   - If `msg.type === "WELCOME_COMPLETE"`: transition `shellState` to `"post-welcome"` and call `inferCtrl.complete()` (inference is done at this point)
   - If `msg.type === "RUNTIME_READY"`: no state change (keep as-is, it's just a lifecycle signal)

2. **`src/lib/shell-messages.ts`** — No changes needed. The `normalizeInbound` function already handles `WELCOME_COMPLETE` correctly.

3. **No changes** to layout, menu, overlay persistence, animation, or any other component.

### Why this works
The iframe sends `WELCOME_COMPLETE` when its internal welcome prompt flow finishes. Currently the shell logs it but does nothing. By treating it as a state transition trigger, the shell moves to `"post-welcome"`, which causes `showPrompt` to become `true`, and the prompt box appears — exactly as intended.

