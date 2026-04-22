# Shell Architecture Contract

> LOV-101 deliverable — defines the boundary between the thin-client shell (Lovable) and the runtime iframe (Codex/Next.js).

## 1. State Ownership

### Shell owns (client-side React state)

| State | Location | Purpose |
|-------|----------|---------|
| `shellState` | ShellContext | `"welcome"` / `"post-welcome"` lifecycle |
| `viewState` | ShellContext | `"defaultNav"` / `"quickActionOnly"` / `"promptMode"` |
| `activeMode` | ShellContext | Current SmartMenu mode (`be`/`earn`/`play`/`make`/`share` or `null`) |
| `submenuType` | ShellContext | `"quickActions"` / `"cartridgeSelector"` / `"codexSelector"` / `"personaSelector"` / `null` |
| `submenuVisibility` | ShellContext | Auto-show/hide/user-toggle state |
| `inferring` | ShellContext | Whether R/T dots animate (driven by iframe lifecycle signals) |
| `cartridgeState` | ShellContext | Active cartridge/codex selection |
| `personaState` | ShellContext | Active persona selection |
| `config` | ShellContext | Shell hydration payload from AA-API (`/runtime/shell-config`) |
| `trust` | Inside `config` | Trust level, signals, scores (R/T dots) |
| `selectors` | Inside `config` | Aigent/LLM selector options and current selections |
| Browser state | BrowserContext | Browser session management (mount/unmount/takeover) |

### Iframe owns (Next.js app internal state)

| State | Purpose |
|-------|---------|
| Conversation/chat history | LLM inference context |
| Active experience card | Which card/guide/journey is displayed |
| Welcome flow progress | Onboarding state |
| Codex panel open/closed | Tier-3 codex layer management |
| Studio experience surfaces | Experience model, matrix, pipeline |
| NBE/goals/analysis rendering | Runtime feature UI |

## 2. Message Vocabulary

### Shell → Iframe (outbound)

| Type | When | Payload |
|------|------|---------|
| `SHELL_READY` | Iframe loads | `{ hide_chrome: true }` |
| `HANDOFF` | After SHELL_READY | `{ handoff_token, aa_api_base_url, aa_api_token, context }` |
| `MENU_ACTION` | Quick action or menu tap | `{ action_id, prompt?, menu_event?, cartridge_id?, codex_id?, mode? }` |
| `PROMPT_SUBMIT` | User submits prompt text | `{ text, cartridge_id?, codex_id?, mode? }` |
| `SELECTOR_CHANGE` | User changes selector | `{ selector_type, id, iqube_id? }` |
| `LAUNCH_CARTRIDGE` | Open a cartridge overlay in runtime | `{ cartridge_id, codex_id?, tab? }` (must be nested under `payload`) |
| `OPEN_PERSONA_IQUBE` | Open a persona iQube drawer in runtime | `{ iqube_type: "knyt" \| "qripto" }` (nested under `payload`) |
| `MODE_CHANGED` | Shell mode activated/deactivated | `{ mode, view_state, cartridge_id?, codex_id? }` |
| `CONTEXT_UPDATE` | Arbitrary context push | `{ payload }` |
| `RESET_WELCOME` | Shell reset action | `{}` |
| `DEVICE_CONTEXT_UPDATE` | Viewport resize (debounced 250ms) | `{ context: { device, viewport } }` |
| `browser.*` | Browser bridge events | Various payloads |

All outbound messages are wrapped in a bridge envelope: `{ type, msg_id, timestamp, source: "shell", payload }`.

### Iframe → Shell (inbound)

| Type | Purpose | Shell response |
|------|---------|----------------|
| `RUNTIME_READY` | Iframe loaded and ready | Triggers `onReady` (sends SHELL_READY + HANDOFF) |
| `INFERENCE_START` / `PROCESSING_START` / `RENDER_START` | Inference began | `inferring = true`, R/T dots animate |
| `INFERENCE_COMPLETE` / `RENDER_COMPLETE` | Inference done | 2s grace → `inferring = false` |
| `STATE_SYNC` | Runtime state update | Evaluated for processing flags; welcome_inference_completed triggers post-welcome; runtime hints extracted (active_guide, focus_mode, deep_link, handoff) |
| `WELCOME_COMPLETE` | Welcome flow finished | `shellState = "post-welcome"` |
| `TRUST_UPDATE` | Trust scores changed | Updates `config.trust`; header flash |
| `RUNTIME_HINT` | Discrete runtime hint | Updates `runtimeHints` (active_guide, focus_mode, deep_link, handoff) |
| `NAVIGATE` | Runtime requests navigation | Logged; `close_codex` action forwarded back |
| `TOAST` | Runtime wants toast | Suppressed (shell policy) |
| `OPEN_CAPSULE` | Runtime opens capsule | Logged |
| `REQUEST_TRUST_REFRESH` | Trust refresh needed | Logged |
| `PROMPT_SUBMIT` / `PROMPT_RESPONSE` / `RESPONSE` / `CHAT_RESPONSE` / `RESULT` / `OUTPUT` | Inference lifecycle signals | Triggers post-welcome + inference complete |
| `METAME_CODEX_CLOSE_LAYER` | Codex close diagnostic | Logged only |
| `browser.*` | Browser bridge events | Routed to BrowserContext |

Inbound messages are normalized via `normalizeInbound()` which handles:
- Direct: `{ type, field1, field2 }`
- Envelope: `{ type, payload: { field1, field2 } }`
- Stringified JSON
- Type-inside-payload: `{ payload: { type, ... } }`

## 3. Inference Lifecycle

```
iframe sends INFERENCE_START ──→ shell sets inferring=true, starts 30s safety timeout
  ... processing ...
iframe sends INFERENCE_COMPLETE ──→ shell clears safety timer, starts 2s grace
  ... 2s grace ...
  shell sets inferring=false
```

Shell-owned triggers also start inference: `submitPrompt()`, `handleMenuAction()`.

## 4. Shell Layout Contract

```
┌─────────────────────────────┐
│ RuntimeHeader               │  ← Trust dots, selectors, cartridge icon
├─────────────────────────────┤
│                             │
│  RuntimeFrame (iframe)      │  ← All app UI renders here
│  BrowserSurfaceHost (z-50)  │  ← Browser overlay when active
│                             │
├─────────────────────────────┤
│ BrowserSessionPanel         │  ← Browser session controls
│ BrowserHistoryDrawer        │  ← Browser history
├─────────────────────────────┤
│ SmartMenu                   │  ← Submenu + prompt bar or nav bar
└─────────────────────────────┘
  BrowserMinimizedPill (fixed)  ← Floating pill when browser minimized
```

Tap-outside overlay (z-40) covers the runtime area when menu is active.

## 5. What Shell Must NOT Do

- Render experience cards, analysis cards, journey cards, or any feature UI
- Own Studio experience tab, parity modal, or pipeline visualization
- Manage conversation history or LLM context
- Render goals, matrix, or NBE content
- Own active guide or handoff card rendering

These are all iframe/Codex responsibilities.
