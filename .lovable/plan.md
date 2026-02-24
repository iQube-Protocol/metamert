

## Implement Windsurf Runtime Brief: Header/Menu Parity + Full API Wiring

### Summary

Windsurf has deployed the AA-API runtime endpoints (`GET /runtime/shell-config`, `POST /runtime/selectors`, `POST /runtime/menu-action`) and sent a detailed behavior brief. The upstream isn't reachable from the edge function yet (still returning fallback), but we need to implement the full enriched payload schema so when it goes live, everything works automatically.

This plan covers: expanding the `ShellConfig` type to match the enriched payload, making header/menu fully payload-driven (icons, tooltips, policy, trust dots), wiring menu actions to forward `menu_event` to iframe, and adding welcome vs post-welcome state support.

---

### Changes Overview

**1. Expand `ShellConfig` type and default config** (`src/lib/aa-client.ts`, `supabase/functions/aa-proxy/index.ts`)

Add the new fields from the Windsurf brief to the TypeScript interface and the proxy's fallback config:

- `selectors.*.options[].icon` and `tooltip` fields
- `session.trust_level`, `session.scores.trust`, `session.scores.reliability` (mapped into `trust`)
- `menu.policy` object: `collapse_to_metame_button`, `center_group_ids`, `triad_cluster_gap`, `quick_links[]`, `floating_quick_links[]`, `prompt_box`, `state_behavior`
- `menu.mode` field (`"expanded" | "collapsed"`)
- `iframe.bootstrap.context` passthrough

Update `menuAction()` to return the `menu_event` payload (prompt, intent, `surface_plan_instruction`, `copilot_instruction`) so the shell can forward it to the iframe.

**2. Payload-driven RuntimeHeader** (`src/components/RuntimeHeader.tsx`)

- Render selector icons from payload `icon` field using lucide dynamic icon lookup (fallback to current behavior when absent)
- Render selector tooltips from payload
- Drive trust dots from `trust.scores.trust` and `trust.scores.reliability` (numeric 0-5) when present, fall back to level-based coloring
- Support `trust.signals` display on hover/tooltip

**3. Payload-driven SmartMenu** (`src/components/SmartMenu.tsx`)

- Remove hardcoded `menuItems` array; build from `config.menu.items` + `config.menu.edge_items` merged in order: `[be, ...items, share]`
- Use payload `icon` field for icons (lucide dynamic lookup, fallback defaults)
- Implement collapsed mode: when `menu.mode === "collapsed"`, show Be (left), single "metaMe" button (center, opens triad), Share (right)
- Respect `menu.policy.triad_cluster_gap` for desktop spacing
- Render quick links above menu in welcome state

**4. Wire menu actions to return + forward `menu_event`** (`src/contexts/ShellContext.tsx`, `src/lib/shell-messages.ts`)

- Update `menuAction()` in `aa-client.ts` to return the full response (including `menu_event` with `prompt`, `intent`, `surface_plan_instruction`)
- In `ShellContext.handleMenuAction()`: after the API call, forward `MENU_ACTION` with the `menu_event` payload to the iframe via `postToIframe()`
- Re-hydrate config from the returned `shell_config` if present in response

**5. Wire selector changes to iframe** (`src/contexts/ShellContext.tsx`)

- After `updateSelector()` call, send `SELECTOR_CHANGE` postMessage to iframe
- Re-hydrate config from returned `shell_config` if present

**6. Welcome vs Post-Welcome state** (`src/contexts/ShellContext.tsx`, `src/pages/Index.tsx`)

- Add `shellState: "welcome" | "post-welcome"` to ShellContext
- Welcome: show centered prompt box + quick links, menu visible
- Post-welcome: triggered when first menu action occurs; hide prompt box, keep menu as action rail
- Driven by `menu.policy.state_behavior.welcome` and `state_behavior.post_welcome`

**7. Update proxy default config** (`supabase/functions/aa-proxy/index.ts`)

- Expand `DEFAULT_SHELL_CONFIG` with the new fields (policy, icons, prompt_box) so the fallback mirrors the enriched schema

**8. Send QubeTalk acknowledgment**

- Post a status message to `#ui-shell` confirming implementation of the brief

---

### Technical Details

#### Expanded ShellConfig interface

```typescript
export interface SelectorOption {
  id: string;
  label: string;
  icon?: string;    // lucide icon name
  tooltip?: string;
}

export interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  tooltip?: string;
  enabled: boolean;
  color?: string;
}

export interface MenuPolicy {
  collapse_to_metame_button?: boolean;
  center_group_ids?: string[];
  triad_cluster_gap?: string;
  edge_items_when_needed?: boolean;
  quick_links?: { id: string; label: string; icon?: string; action?: string }[];
  floating_quick_links?: { id: string; label: string; action: string }[];
  prompt_box?: { placeholder: string; visible: boolean };
  state_behavior?: {
    welcome?: { show_prompt: boolean; show_quick_links: boolean };
    post_welcome?: { show_prompt: boolean; collapse_quick_links: boolean };
  };
}

export interface ShellConfig {
  trust: {
    level: "verified" | "unverified" | "warning";
    signals: string[];
    scores?: { trust?: number; reliability?: number };
  };
  selectors: {
    aigent: { current: string; options: SelectorOption[] };
    llm: { current: string; options: SelectorOption[] };
  };
  menu: {
    mode?: "expanded" | "collapsed";
    items: MenuItem[];
    edge_items: { id: string; label: string; icon?: string; visible: boolean }[];
    collapse_mobile: boolean;
    policy?: MenuPolicy;
  };
  iframe: {
    url: string;
    handoff_token?: string;
    origin?: string;
    bootstrap?: { context?: Record<string, unknown> };
  };
}
```

#### Menu action return type

```typescript
export interface MenuActionResult {
  menu_event?: {
    action_id: string;
    prompt?: string;
    intent?: string;
    surface_plan_instruction?: string;
    copilot_instruction?: string;
  };
  shell_config?: ShellConfig;
}
```

#### Dynamic icon lookup

A small utility using lucide-react's icon registry to map payload icon names to components, with fallback defaults per menu item ID.

#### File change list

| File | Change |
|------|--------|
| `src/lib/aa-client.ts` | Expand `ShellConfig` type, `menuAction` returns `MenuActionResult`, `updateSelector` returns optional `shell_config` |
| `supabase/functions/aa-proxy/index.ts` | Expand `DEFAULT_SHELL_CONFIG` with policy/icons/prompt fields |
| `src/lib/shell-messages.ts` | Add `menu_event` payload to `MENU_ACTION` outbound type |
| `src/components/RuntimeHeader.tsx` | Payload-driven icons, tooltips, trust score dots |
| `src/components/SmartMenu.tsx` | Fully payload-driven, collapsed mode, quick links |
| `src/contexts/ShellContext.tsx` | Forward menu/selector events to iframe, welcome/post-welcome state, re-hydrate from responses |
| `src/pages/Index.tsx` | Welcome state prompt box + quick links rendering |
| `src/lib/icon-utils.ts` | New: dynamic lucide icon lookup utility |

