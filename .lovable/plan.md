

## Fix Blank Screen + QubeTalk Display Issues

Two separate bugs are crashing the shell and preventing QubeTalk messages from displaying.

---

### Issue 1: Blank Screen (Two Crashes)

The upstream AA-API is now live and returning shell-config data, but its response shape differs slightly from the DEFAULT_SHELL_CONFIG. The components assume all nested properties exist without null-checking.

**Crash A: `RuntimeHeader.tsx` line 26**
```
TypeError: can't access property "scores", config.trust is undefined
```
The upstream API may return a config where `trust` is missing or structured differently. Line 26 does `config.trust.scores` without checking if `trust` exists.

**Fix**: Add defensive defaults at the top of RuntimeHeader:
```typescript
const trust = config.trust ?? { level: "unverified", signals: [], scores: {} };
const trustScores = trust.scores ?? {};
```

**Crash B: `SmartMenu.tsx` line 16**
```
TypeError: can't access property "find", edge_items is undefined
```
The upstream API may return `menu` without an `edge_items` array. Line 16 destructures `edge_items` from `config.menu`, then line 19 calls `.find()` on it.

**Fix**: Add defensive defaults:
```typescript
const items = config.menu?.items ?? [];
const edge_items = config.menu?.edge_items ?? [];
const mode = config.menu?.mode ?? "expanded";
```

**Also fix `QuickLinksBar.tsx`** -- it likely reads `config.menu.policy.quick_links` which could also be undefined from upstream.

---

### Issue 2: QubeTalk Messages Not Showing on /dev

The network requests show successful 200 responses with message data. The messages ARE being fetched. The problem is in `mapRow()` in `qubetalk-client.ts`:

```typescript
from_agent: typeof row.from_agent === "string" ? JSON.parse(row.from_agent) : row.from_agent,
```

The upstream messages have `from_agent` as objects like `{"id":"windsurf","name":"Windsurf","role":"executor"}` -- they have `name`, not `label`. But `QubeTalkMessage.from_agent` expects `{ id: string; label: string }`.

The DevDiagnostics component renders: `msg.from_agent?.label ?? msg.from_agent?.id ?? "unknown"`.

This won't crash (it falls back to `id`), so messages should still render. The more likely cause is that the `mapRow` function may throw for some rows (e.g., if `from_agent` is a plain string like `"lovable-metame"` and `JSON.parse` returns a string, not an object), causing the entire history fetch to fail silently.

**Fix**: Make `mapRow` robust by normalizing `from_agent` to always produce `{ id, label }`:
```typescript
function mapRow(row: any): QubeTalkMessage {
  let agent = row.from_agent;
  if (typeof agent === "string") {
    try { agent = JSON.parse(agent); } catch { agent = { id: agent, label: agent }; }
  }
  if (typeof agent === "string") agent = { id: agent, label: agent };
  if (!agent?.id) agent = { id: "unknown", label: "unknown" };
  // map "name" to "label" for compatibility
  if (agent.name && !agent.label) agent.label = agent.name;
  ...
}
```

---

### Files to Change

| File | Change |
|------|--------|
| `src/components/RuntimeHeader.tsx` | Add null-safe defaults for `config.trust`, `trust.scores`, `trust.signals` |
| `src/components/SmartMenu.tsx` | Add null-safe defaults for `config.menu.items`, `edge_items`, `mode` |
| `src/components/QuickLinksBar.tsx` | Add null-safe defaults for `config.menu.policy.quick_links` |
| `src/lib/qubetalk-client.ts` | Make `mapRow` robust: handle string agents, map `name` to `label` |

---

### Root Cause Summary

The upstream AA-API shell-config response has a slightly different shape than the hardcoded DEFAULT_SHELL_CONFIG (e.g., missing `trust`, `edge_items`, or `scores` fields). When the upstream returns 200, the proxy passes that response through without merging with defaults. The fix is to make the UI components resilient to missing/partial data.

