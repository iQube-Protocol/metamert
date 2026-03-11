

## Investigation: QuickLink Prompt vs. Menu Action — What Changed

### Root Cause

The recent quicklink change switched from `handleMenuAction(action.id)` (which sends a **MENU_ACTION** message to the iframe) to `submitPrompt("Show me watch content")` (which sends a **PROMPT_SUBMIT** message).

These two paths produce fundamentally different runtime behavior:

**Before (working — MENU_ACTION path):**
The shell sent a structured `MENU_ACTION` envelope to the iframe containing the full trigger data from the API config:
```json
{
  "type": "MENU_ACTION",
  "action_id": "watch",
  "prompt": "I'd like to watch experiences.",
  "menu_event": {
    "action_id": "watch",
    "intent": "play",
    "surface_plan_instruction": "prioritize play/watch modules and interactive capsules",
    "copilot_instruction": "set intent to play and surface interactive experiences first"
  }
}
```
The runtime used `intent`, `surface_plan_instruction`, and `copilot_instruction` to route the request to the correct content surfaces — videos, carousels, "Explore Further" recommendations, etc.

**Now (broken — PROMPT_SUBMIT path):**
The shell sends a bare text prompt:
```json
{ "type": "PROMPT_SUBMIT", "text": "Show me watch content" }
```
The upstream `prompt-action` endpoint is unavailable, so the aa-proxy fallback echoes the text back as-is. The runtime treats this as a generic user query — no intent, no surface plan, no copilot instruction — so the active codex (metaKnyts) responds with its default greeting instead of surfacing rich content.

### Why "Explore Further" and rich inference are gone

The `PROMPT_SUBMIT` path bypasses the entire intent/surface-plan routing system. The runtime has no structured metadata to work with, so it falls back to the codex's generic welcome response. Repeated taps produce the same greeting because the codex sees each as a new unstructured text query.

### Fix

Revert the quicklink direct-fire path to use `handleMenuAction(action.id)` instead of `submitPrompt(...)`. This restores the structured MENU_ACTION envelope with trigger metadata. `handleMenuAction` already supports the reshuffle use case — each call sends a fresh MENU_ACTION to the runtime, which triggers a new inference cycle with the proper intent routing.

**File: `src/components/SmartMenuSubmenu.tsx` — lines 107-111**

Change:
```typescript
if (viewState === "quickActionOnly" && action.kind === "llm+menu") {
  submitPrompt(`Show me ${action.label.toLowerCase()} content`);
  resumeIdleTimer();
  return;
}
```

To:
```typescript
if (viewState === "quickActionOnly" && action.kind === "llm+menu") {
  handleMenuAction(action.id);
  resumeIdleTimer();
  return;
}
```

This is a single-line change — `submitPrompt(...)` → `handleMenuAction(action.id)`. Everything else in the menu logic stays exactly as-is. The idle timer resume and the two-tap flow (first tap → quicklinks, second tap → prompt bar) remain unchanged.

