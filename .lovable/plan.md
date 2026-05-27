## Goal

Stop runtime fallbacks from clobbering the live `shell_config` when an upstream AA endpoint (other than `shell-config` itself) is unavailable. Today, tapping "Be" (or any menu item) when `/aa/v1/runtime/menu-action` is down causes `aa-proxy` to return its hard-coded fallback `shell_config`, which the Shell merges in — overwriting the good agent list, trust pills, and cartridges with stale fallback values.

## Changes — `supabase/functions/aa-proxy/index.ts`

### 1. `menu-action` fallback
- Remove the `shell_config` block from the fallback response.
- Keep `menu_event` and `iframe_event` so the tap still feels responsive (intent routed, iframe nudged), but the Shell's existing config stays intact.

### 2. `prompt-action` fallback
- Same treatment: drop `shell_config` from the fallback; keep `iframe_event` only.

### 3. `selectors` fallback
- Drop `shell_config` from the fallback. A failed selector change should leave the current config untouched rather than silently rewriting agents/LLM lists. The client will surface the error via the existing error path.

### 4. Leave `shell-config` alone
- `shell-config` is the *only* action that legitimately produces a full config. Its existing `DEFAULT_SHELL_CONFIG` fallback (with the aigentMe roster + warning trust) stays as-is — that's the correct degraded experience on cold start when upstream is fully down.

## Non-goals

- No client-side changes. `menuAction()` / `promptAction()` / `updateSelector()` already treat `shell_config` as optional; omitting it is a no-op for callers.
- No change to the `aigent-z → aigent-me` alias mapping in `normalizeShellConfig`.
- No change to upstream contract; this only hardens the proxy's local fallbacks.

## Verification

1. With Railway up, tap Be/Earn/Play/Make/Share — header agent dropdown, trust pills, and cartridge state should remain stable (no flicker to fallback values).
2. Temporarily break the `menu-action` upstream path — taps should still feel responsive, and the Shell must keep the live config from the prior `shell-config` hydration (no red trust, no stale "Aigent Z" labels).
3. Cold-load with upstream fully down — `shell-config` fallback still kicks in and renders aigentMe + amber trust (unchanged behavior).
4. `src/test/persona-flow.test.ts` should still pass — no client paths touched.

## Risk

Low. We're narrowing fallback payloads, not widening them. Worst case: a future client somewhere actually depended on the fallback `shell_config` from `menu-action` — none exist today (`menuAction` callers only read `menu_event`/`iframe_event`).
