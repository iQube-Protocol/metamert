

# Fix Three QuickLink Issues

## Problems Identified

1. **Same inference re-rendered**: `submitPrompt("Watch")` sends the identical string each time. The `submitPrompt` function calls `promptAction(text)` on the AA-API, but the runtime may be caching results for identical prompt text. Need to append a cache-bust (timestamp or "reshuffle" keyword) so repeated taps produce fresh inference.

2. **Carousel not scrolling until tapped**: The `pauseIdleTimer` on `onPointerEnter` in `QuickActionsCarousel` (line 129) is likely intercepting touch events on the glass-float container, preventing the inner scroll div from receiving scroll gestures. The `touch-action` CSS property may need to be explicitly set to allow horizontal panning.

3. **QuickLinks menu not collapsing after tap**: In the `handleAction` callback (lines 105-107), after `submitPrompt` is called, there is no call to `resetIdleTimer()` or `resumeIdleTimer()` to restart the countdown. The `pauseIdleTimer()` at line 84 pauses the timer, and nothing restarts it after the prompt fires.

## Plan

### File: `src/components/SmartMenuSubmenu.tsx`

**Fix 1 — Force fresh inference on repeated quicklink taps:**
- In the `handleAction` callback, instead of `submitPrompt(action.label)`, append a short randomizer or use a richer prompt like `submitPrompt(action.label)` but with a timestamp suffix stripped by the runtime, OR better: call `submitPrompt` with a reshuffle indicator. Simplest approach: append a non-visible cache-bust e.g. `submitPrompt(\`${action.label} #${Date.now()}\`)` — but this leaks into the prompt text. Better: the real fix is to NOT call `pauseIdleTimer()` before the quicklink path, and to ensure `submitPrompt` always sends to the iframe regardless of identical text. Looking at `submitPrompt` (line 585-606 in ShellContext), it calls `promptAction(text)` which hits the API — the API should return different results. The issue is more likely that `promptAction` returns the same cached response OR the runtime deduplicates. We should ensure uniqueness by wrapping the label in a natural-language reshuffle prompt like `"Show me ${action.label} content"` and vary it slightly, or simply pass a unique prompt each time.

Actually, the simplest reliable fix: use `handleMenuAction(action.id)` instead of `submitPrompt(action.label)` for quicklink taps. `handleMenuAction` sends a `MENU_ACTION` to the iframe which the runtime treats as a new action trigger. This was the original behavior before the change. But the user wants it to act as a prompt to the LLM. Let me re-read the requirement: "send a prompt to the LLM to surface watch content." So `submitPrompt` is correct but needs to produce unique prompts. We'll prefix with the mode context and add a reshuffle signal.

**Fix 2 — Carousel scroll on touch:**
- Add `touch-action: pan-x` to the scroll container div to ensure touch scrolling works without being blocked.

**Fix 3 — Restart idle timer after quicklink tap:**
- After `submitPrompt()` in the quicklink path, call `resetIdleTimer()` (not `pauseIdleTimer`) so the normal 4s/5s countdown begins. Remove the `pauseIdleTimer()` call that fires before the quicklink branch, or move it to only fire for non-quicklink actions.

### Specific Changes

**`src/components/SmartMenuSubmenu.tsx` — `handleAction` callback (lines 83-111):**
- Restructure so `pauseIdleTimer()` is NOT called for quicklink direct-fire path
- Change `submitPrompt(action.label)` to `submitPrompt(action.label)` followed by `resetIdleTimer()` to start the collapse countdown
- Actually: call `resumeIdleTimer()` after submit to restart the countdown

**`src/components/SmartMenuSubmenu.tsx` — scroll container (line 133):**
- Add `touchAction: "pan-x"` style to the scroll div

**`src/contexts/ShellContext.tsx` — `submitPrompt` (lines 585-606):**
- No change needed to the function itself. The issue is that identical text might produce identical API responses. We'll handle this at the call site by appending a timestamp-based suffix that the runtime strips or ignores.

### Revised approach for Fix 1:
Send the prompt as `"${action.label}"` but append a unique nonce that won't affect LLM interpretation: e.g., wrap as `submitPrompt(action.label)` and ensure we always send `PROMPT_SUBMIT` to the iframe even if the API fails (which it already does in the catch block). The real issue may be simpler: `submitPrompt` has `if (!text.trim()) return;` — the text IS non-empty. Let me check if the runtime is deduplicating. Since we can't control the runtime, the safest fix is to vary the prompt text slightly each call. We'll do: `submitPrompt(\`${action.label} content\`)` on first tap, and on repeated taps naturally the API should return different results. But to be safe, append a minimal variation.

Final approach: Keep it simple. Use the mode label for context: `submitPrompt(\`Show me ${action.label.toLowerCase()} content\`)`. This is natural language, always hits the LLM fresh, and provides better context than just "Watch".

