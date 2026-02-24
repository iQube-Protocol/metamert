

## Fix: Normalize Upstream API Response in aa-proxy

The shell code is correct and all previous edits are intact. The problem is that the upstream AA-API is now reachable and returning a response with a different shape than the shell expects. The proxy needs to normalize the upstream response before returning it to the browser.

### Root Cause

The `aa-proxy` edge function tries the upstream first. When the upstream was down, the fallback `DEFAULT_SHELL_CONFIG` was used (which matched the shell's types). Now the upstream responds successfully, but its shape differs from what `ShellConfig` expects.

### Upstream vs Shell Shape Mismatches

| Field | Upstream returns | Shell expects |
|-------|-----------------|---------------|
| `selectors.aigent.current` | Object `{id, label, color, ...}` | String `"aigent-z"` |
| `selectors.llm.current` | Object `{id, label, ...}` | String `"gpt-4o"` |
| `selectors.llm.options[].provider_id` | `"openai"` | Field named `provider` |
| Trust data location | `session.trust_level`, `session.scores` | `trust.level`, `trust.scores` |
| Trust signals | `session.trust_signals` (array of objects) | `trust.signals` (array of strings) |
| `menu.edge_items` | Not present (items have `edge: true` flag) | Separate array expected |
| Quick links | 4 items (Watch, Listen, Read, Find) | 6 items (+ Refresh, Reset) |
| iframe URL | `http://localhost:3000/...` | Should use env var or fallback |

### Changes

#### 1. `supabase/functions/aa-proxy/index.ts` -- Add normalization layer

After receiving a successful upstream response for `shell-config`, normalize it before returning:

- Extract `current` as string: if `selectors.aigent.current` is an object, use `.id`
- Rename `provider_id` to `provider` in LLM options
- Map `session.trust_level` / `session.scores` / `session.trust_signals` into the `trust` block
- Append Refresh and Reset to `quick_links` if missing
- Override `iframe.url` with env var `VITE_RUNTIME_IFRAME_URL` or keep the upstream URL but only if it's not localhost
- Keep `DEFAULT_SHELL_CONFIG` as the final fallback

This is a single new function `normalizeShellConfig(raw)` added to the proxy, called on the upstream response before returning it.

#### 2. `src/lib/aa-client.ts` -- Defensive type handling

Add a client-side safety check in `fetchShellConfig` so that if `selectors.*.current` arrives as an object, it extracts `.id`. This is belt-and-suspenders defense.

#### 3. No other files change

SmartMenu, QuickLinksBar, PromptBox, RuntimeHeader, Index -- all stay as-is. The visual code is correct; it just needs correctly shaped data.

### Technical Detail: normalizeShellConfig function

```text
function normalizeShellConfig(raw: any): object {
  // 1. Flatten current selectors from object to string ID
  if (raw.selectors?.aigent?.current?.id)
    raw.selectors.aigent.current = raw.selectors.aigent.current.id;
  if (raw.selectors?.llm?.current?.id)
    raw.selectors.llm.current = raw.selectors.llm.current.id;

  // 2. Rename provider_id -> provider in LLM options
  for (const opt of raw.selectors?.llm?.options ?? [])
    if (opt.provider_id && !opt.provider) opt.provider = opt.provider_id;

  // 3. Map session -> trust block
  if (raw.session && !raw.trust) {
    raw.trust = {
      level: raw.session.trust_level ?? "unverified",
      signals: (raw.session.trust_signals ?? []).map(s => s.label),
      scores: raw.session.scores ?? {},
    };
  }

  // 4. Ensure quick_links includes Refresh + Reset
  const ql = raw.menu?.policy?.quick_links ?? [];
  const hasRefresh = ql.some(q => q.id === "ql-refresh" || q.action === "refresh");
  if (!hasRefresh) {
    ql.push({ id: "ql-refresh", label: "Refresh", icon: "refresh-cw", action: "refresh" });
    ql.push({ id: "ql-reset", label: "Reset", icon: "rotate-ccw", action: "reset" });
  }
  if (raw.menu?.policy) raw.menu.policy.quick_links = ql;

  // 5. Fix localhost iframe URL
  if (raw.iframe?.url?.startsWith("http://localhost"))
    raw.iframe.url = DEFAULT_SHELL_CONFIG.iframe.url;

  // 6. Ensure menu.edge_items exists (empty array if not)
  if (!raw.menu?.edge_items) raw.menu = { ...raw.menu, edge_items: [] };

  return raw;
}
```

This function is called in the `shell-config` action handler right after a successful upstream fetch, before returning the JSON to the browser.

### Why it looked like changes reverted

The shell was rendering correctly when the upstream was down (using the fallback config). Once the upstream came online and started responding, the mismatched data shape caused selectors not to highlight, trust dots to disappear, and the iframe to fail loading (`localhost` URL). This made the UI look like it had gone back to a broken state -- but the code was always correct.

