

## Analysis: Score Indicator Animation Not Triggering During Inference

### Root Cause

Two issues are combining to prevent the animation:

1. **Premature clearing by lifecycle signals**: The iframe sends `RUNTIME_READY` on initial load and `WELCOME_COMPLETE` shortly after. Both of these schedule `setInferring(false)` via a 2-second timeout in `ShellContext.tsx` (lines 105-114). When the user subsequently triggers inference (prompt or menu action), `inferring` is set to `true`, but the iframe often immediately responds with one of these lifecycle signals again, which re-schedules the 2-second clear — killing the animation almost instantly.

2. **`animate-pulse` is nearly invisible on 1.5px dots**: The current code at `RuntimeHeader.tsx:80` uses Tailwind's built-in `animate-pulse` (a subtle opacity fade). On dots that are only `h-1.5 w-1.5`, this is effectively invisible. The design spec calls for a custom "dot-wave" animation with opacity 1.0 → 0.4 and scale 1.0 → 1.4, staggered at 150ms intervals — which was never added to the codebase.

### Plan

**File 1: `tailwind.config.ts`** — Add the custom `dot-wave` keyframe animation:
- Add a `dot-wave` keyframe: `{ "0%, 100%": { opacity: 1, transform: "scale(1)" }, "50%": { opacity: 0.4, transform: "scale(1.4)" } }`
- Register `animate-dot-wave` with `dot-wave 1.2s ease-in-out infinite`

**File 2: `src/contexts/ShellContext.tsx`** — Guard the inferring-clearing logic:
- **Lifecycle signals** (`RUNTIME_READY`, `WELCOME_COMPLETE`): These should NOT clear `inferring`. They are iframe boot/navigation signals, not inference completion signals. Remove the `setInferring(false)` timeout from the `RUNTIME_READY` / `WELCOME_COMPLETE` branch entirely.
- **Completion signals** (`INFERENCE_COMPLETE`, `RENDER_COMPLETE`, `STATE_SYNC`): These correctly indicate inference is done — keep the 2-second grace period timeout for these only.
- The existing 30-second safety timeout in `submitPrompt` and `handleMenuAction` remains as the fallback.

**File 3: `src/components/RuntimeHeader.tsx`** — Switch to the custom animation:
- Replace `animate-pulse transition-all duration-700` with `animate-dot-wave` on the dots when `inferring` is true.
- Keep the staggered `animationDelay: i * 150ms` style for the wave effect.

### Summary of Changes

```text
ShellContext listener logic (before):
  INFERENCE_COMPLETE / RENDER_COMPLETE / STATE_SYNC → clear in 2s ✓
  RUNTIME_READY / WELCOME_COMPLETE → clear in 2s ✗ (kills animation)

ShellContext listener logic (after):
  INFERENCE_COMPLETE / RENDER_COMPLETE / STATE_SYNC → clear in 2s ✓
  RUNTIME_READY / WELCOME_COMPLETE → no-op on inferring ✓
```

