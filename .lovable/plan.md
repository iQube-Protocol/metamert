

## Root Cause: QuickLink Actions Missing Trigger Metadata

When a quicklink like "Watch" (id: `watch`) is tapped, `handleMenuAction("watch")` fires. Here's the chain:

1. **API call**: `menuAction("watch")` hits aa-proxy with `item_id: "watch"`
2. **Upstream unavailable**: aa-proxy returns a bare fallback:
   ```json
   {
     "iframe_event": { "type": "MENU_ACTION", "item_id": "watch", "intent": "watch" },
     "menu_event": { "action_id": "watch", "intent": "watch", "prompt": "Launching watch…" }
   }
   ```
3. **ShellContext line 560**: `result.iframe_event` exists, so `postRawToIframe` sends the raw event — which has **no prompt, no surface_plan_instruction, no copilot_instruction**
4. **Runtime receives**: `{ type: "MENU_ACTION", payload: { item_id: "watch", intent: "watch" } }` — too bare for the runtime to trigger content inference

The fallback `iframe_event` takes priority over `menu_event` (line 560 vs 562), so the slightly richer `menu_event` path never fires. But even that path only has `"Launching watch…"` as the prompt — not the real trigger data.

Meanwhile, the **shell-config** has the real trigger data on the parent menu item `play`:
```json
{
  "id": "play",
  "trigger": {
    "prompt": "I'd like to play experiences.",
    "intent": "play",
    "surface_plan_instruction": "prioritize play/watch modules and interactive capsules",
    "copilot_instruction": "set intent to play and surface interactive experiences first"
  }
}
```

And the quick_links in policy have per-action prompts:
```json
{ "id": "quick-watch", "prompt": "I'd like to watch experiences." }
```

But `handleMenuAction("watch")` looks up neither — it only checks `config.menu.items` for an exact id match (`"watch"` !== `"play"`).

## Fix

**File: `src/contexts/ShellContext.tsx` — `handleMenuAction` (lines 557-582)**

Enrich the message sent to the runtime by looking up trigger data from multiple sources when the API fallback lacks it:

1. **In the success path (line 560-568)**: When `result.iframe_event` exists but lacks `surface_plan_instruction`, enrich it with trigger data from the shell-config before sending. Specifically:
   - Look up `config.menu.policy.quick_links` for a matching quicklink (map `"watch"` → `"quick-watch"`) to get the proper `prompt`
   - Look up the parent mode's menu item (e.g., `"play"`) to get `surface_plan_instruction` and `copilot_instruction`
   - Merge this into the iframe_event before posting

2. **In the catch path (lines 569-582)**: Same enrichment — when `menuItem` is not found by exact id, also search quick_links and derive the parent mode's trigger.

The lookup logic:
```typescript
// Find quicklink prompt
const qlPrefix = `quick-${itemId}`;
const quickLink = config?.menu?.policy?.quick_links?.find(
  (ql: any) => ql.id === qlPrefix || ql.id === itemId
);

// Find parent mode's trigger (activeMode maps to a menu item)
const parentItem = activeMode 
  ? config?.menu?.items?.find((i: any) => i.id === activeMode) 
  : null;
const parentTrigger = (parentItem as any)?.trigger;

// Build enriched menu event
const prompt = quickLink?.prompt ?? parentTrigger?.prompt ?? `Launching ${itemId}…`;
const intent = parentTrigger?.intent ?? itemId;
const surface_plan_instruction = parentTrigger?.surface_plan_instruction;
const copilot_instruction = parentTrigger?.copilot_instruction;
```

Then always send via `postToIframe` with the full structured envelope instead of `postRawToIframe` when we detect the event lacks rich metadata.

**Single file change**: `src/contexts/ShellContext.tsx`, modifying the try/catch block of `handleMenuAction` (~lines 557-582). Add `activeMode` to the dependency array of the `useCallback`.

