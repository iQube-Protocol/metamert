# metaMe Runtime Thin Client — Canonical Reference Document

> **Version:** 1.0 · **Date:** 2026-03-10  
> **Authority:** Lovable Agent (UI Owner) · Channel: `metame-runtime-thinclient`  
> **Stack:** React 18 · Vite · Tailwind CSS · TypeScript · Supabase Edge Functions

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Project Structure](#2-project-structure)
3. [Shell Layout & Visual Design](#3-shell-layout--visual-design)
4. [Smart Menu System](#4-smart-menu-system)
5. [Interaction Model & State Machine](#5-interaction-model--state-machine)
6. [Idle Timer & Auto-Collapse Logic](#6-idle-timer--auto-collapse-logic)
7. [Cartridge & Codex System](#7-cartridge--codex-system)
8. [Persona System](#8-persona-system)
9. [Trust & Reliability Indicators](#9-trust--reliability-indicators)
10. [Header Selectors (Aigent / LLM)](#10-header-selectors-aigent--llm)
11. [iframe Communication Protocol](#11-iframe-communication-protocol)
12. [AA-API Proxy Architecture](#12-aa-api-proxy-architecture)
13. [EmbedFrame & Connectivity](#13-embedframe--connectivity)
14. [Inference Lifecycle](#14-inference-lifecycle)
15. [Runtime Commands & System Actions](#15-runtime-commands--system-actions)
16. [Codex Control Protocol](#16-codex-control-protocol)
17. [QubeTalk Inter-Agent Coordination](#17-qubetalk-inter-agent-coordination)
18. [Smart Triad Synchronization](#18-smart-triad-synchronization)
19. [Environment Variables](#19-environment-variables)
20. [Security & Policy Rules](#20-security--policy-rules)
21. [Color System & Brand Palette](#21-color-system--brand-palette)
22. [Mobile-First Design Rules](#22-mobile-first-design-rules)
23. [Known Constraints & Limitations](#23-known-constraints--limitations)

---

## 1. Architecture Overview

The metaMe Runtime Thin Client is a **pure rendering surface** — it contains zero business logic. All state, configuration, access control, and entitlement data flows from the **AA-API** (Aigent Z Application API) via the `aa-proxy` Supabase edge function.

```
┌──────────────────────────────────────────────────────┐
│                   Thin Client Shell                  │
│  ┌─────────┐  ┌──────────────────┐  ┌────────────┐  │
│  │ Header  │  │  Runtime iframe  │  │ Smart Menu │  │
│  │(selects)│  │  (metaMe Runtime)│  │(nav/prompt)│  │
│  └─────────┘  └──────────────────┘  └────────────┘  │
└──────────┬────────────────┬────────────────┬─────────┘
           │                │                │
     postMessage      aa-proxy         QubeTalk
           │         (edge fn)        (edge fn)
           ▼                │                │
  ┌────────────────┐  ┌─────▼──────┐  ┌──────▼──────┐
  │ metaMe Runtime │  │  AA-API    │  │  QubeBase   │
  │ (tier 2 app)   │  │ (Express)  │  │ (Supabase)  │
  └────────────────┘  └────────────┘  └─────────────┘
```

**Core principle:** The browser NEVER calls the AA-API directly. All external communication is routed through Supabase edge functions (`aa-proxy`, `send-qubetalk`).

---

## 2. Project Structure

```
src/
├── pages/
│   └── Index.tsx              # Entry: ShellProvider → ShellLayout
├── contexts/
│   └── ShellContext.tsx        # Central state provider (~650 lines)
├── components/
│   ├── RuntimeHeader.tsx       # Top bar: selectors + trust dots + cartridge icon
│   ├── SmartMenu.tsx           # Bottom nav: 5-button morphing navigation
│   ├── SmartMenuPromptBar.tsx  # Prompt input bar (replaces nav in promptMode)
│   ├── SmartMenuSubmenu.tsx    # Floating layer: quick actions / selectors
│   ├── RuntimeFrame.tsx        # iframe bridge: handshake + message routing
│   ├── EmbedFrame.tsx          # iframe loader: probe → load → ready lifecycle
│   ├── ProviderIcon.tsx        # LLM provider icon resolver
│   └── NavLink.tsx             # Generic nav link
├── lib/
│   ├── aa-client.ts            # AA-API client (via aa-proxy edge fn)
│   ├── shell-messages.ts       # postMessage protocol types & helpers
│   ├── iframe-origin.ts        # Origin resolution (filters localhost)
│   ├── smart-menu-config.ts    # Mode configs, cartridges, personas, actions
│   ├── smart-menu-icons.ts     # Icon mapping overrides
│   ├── icon-utils.ts           # Lucide icon resolver
│   ├── embed-utils.ts          # URL probing & multi-base fallback
│   └── qubetalk-types.ts       # QubeTalk message schema
│   └── qubetalk-client.ts      # QubeTalk pub/sub client
supabase/functions/
├── aa-proxy/index.ts           # AA-API proxy with normalization + fallbacks
└── send-qubetalk/index.ts      # QubeTalk message relay (service role)
```

---

## 3. Shell Layout & Visual Design

### Three-Layer Hierarchy

| Layer | Component | Behavior |
|-------|-----------|----------|
| **Header** | `RuntimeHeader` | Fixed top bar, always visible |
| **Runtime** | `RuntimeFrame` + `EmbedFrame` | Full-height iframe (`h-dvh` minus header/nav) |
| **Navigation** | `SmartMenu` | Morphing bottom bar |

### Layout Rules

- **Container:** `h-dvh` (dynamic viewport height) flex column
- **Runtime area:** `flex-1 overflow-hidden relative`
- **Nav/Prompt bar height:** Fixed `4.25rem` with `pt-3 pb-2` padding
  - Raises icons from bottom edge to prevent clipping on mobile devices with rounded corners
  - Provides clearance from the top divider
- **Dismiss overlay:** Transparent `z-40` overlay covers the runtime area when menu is active, captures clicks for immediate dismissal

### Header Layout

| Position | Content |
|----------|---------|
| **Left** | Aigent selector (Bot icon + chevron) · LLM selector (Provider icon + chevron) |
| **Center** | Active Cartridge icon — 18px `Box` icon, color-coded by cartridge accent. Tooltip shows codex/cartridge name. Centered with `absolute left-1/2 -translate-x-1/2` |
| **Right** | Trust (T) and Reliability (R) dot indicators in `bg-muted/20` pill |

---

## 4. Smart Menu System

### Navigation Layout

**Button order:** `Be | [gap] | Make | Play | Earn | [gap] | Share`

- **Edge items:** Be (left), Share (right) — muted by default, accent on hover
- **Center triad:** Make, Play, Earn — always shown in accent color
- **Invisible gaps:** Two flex-grow zones between Be/Make and Earn/Share

### Quick Action Sets (per mode)

| Mode | Actions (in order) | Focal Action |
|------|-------------------|--------------|
| **Be** | Vault, Persona, Memory, Policy, Identity, Presence, Share, Reset | Policy |
| **Earn** | Goal, Task, Reward, Offer, Opportunity, Wallet, Share, Reset | Offer |
| **Play** | Be, Find, Listen, Watch, Read, Cartridge, Share, Reset | Watch |
| **Make** | Write, Design, Build, Edit, Remix, Publish, Share, Reset | Build |
| **Share** | Send, Publish, Export, Connect, Collaborate, Deliver, Be, Reset | Connect |

### Action Types

| Kind | `triggersInference` | Behavior |
|------|-------------------|----------|
| `llm+menu` | `true` | Routes through AA-API `menu-action`, forwards to iframe |
| `system-only` | `false` | Handled locally (e.g., Reset, Cartridge selector, Persona selector) |

### Special Quick Actions

- **Cartridge** (Play mode): Opens `cartridgeSelector` submenu
- **Persona** (Be mode): Opens `personaSelector` submenu
- **Reset**: Triggers `__runtime_reset__` — full iframe remount via React key change
- **Share**: Available in every mode for cross-mode sharing

---

## 5. Interaction Model & State Machine

### View States

```
defaultNav ←→ quickActionOnly ←→ promptMode
     ↑                                ↓
     └────────── idle timeout ────────┘
```

| State | Description | Shows |
|-------|-------------|-------|
| `defaultNav` | Resting state, 5-button navigation | Nav bar only |
| `quickActionOnly` | Browse submenus without keyboard (mobile touch) | Nav bar + floating submenu |
| `promptMode` | Full prompt interaction with input focused | Prompt bar + floating submenu |

### Submenu Types

| Type | Trigger | Content |
|------|---------|---------|
| `quickActions` | Default when mode activates | Scrollable carousel of mode-specific actions |
| `cartridgeSelector` | "Cartridge" quick action | Cartridge pill selector with ← Back |
| `codexSelector` | (Reserved) | Codex picker scoped to active cartridge |
| `personaSelector` | "Persona" quick action | Persona pill selector with ← Back |

### Submenu Visibility States

| State | Meaning |
|-------|---------|
| `visibleAuto` | Visible, managed by idle timer |
| `hiddenAutoIdle` | Auto-hidden after 4s idle |
| `hiddenUserToggle` | Manually hidden via chevron toggle |

### Device-Specific Interaction

#### Mobile/Tablet (pointerType === "touch")

1. **First tap** on nav button → `quickActionOnly` (browse without keyboard)
2. **Second tap** on same button → upgrades to `promptMode`
3. **Tap on invisible gap** → activates `promptMode` for Play
4. **Swipe up** on nav bar → enters `promptMode`
5. **Swipe down** on prompt bar → collapses to `defaultNav`
6. **Quick action with `triggersInference`** in `quickActionOnly` → auto-upgrades to `promptMode`

#### Desktop (pointerType === "mouse" / "pen")

1. **Click** on nav button → enters `promptMode` directly
2. **Hover** over nav button → shows quick actions as preview (no prompt bar)
3. **Hover** over invisible gap → activates `promptMode` for Play after **220ms** intent delay
4. **Hover** over submenu → pauses idle timer

### Guard Logic

| Guard | Value | Purpose |
|-------|-------|---------|
| `navRestoredAt` | Timestamp | Blocks phantom hover events for **400ms** after nav restoration |
| `modeActivatedAt` | Timestamp | Blocks phantom `pointerEnter` for **400ms** after mode activation |
| Stale hover clear | On transition | `hoverPreviewMode` set to `null` on every view-state change |

---

## 6. Idle Timer & Auto-Collapse Logic

### Timer Configuration

| Timer | Duration | Action |
|-------|----------|--------|
| **Submenu auto-hide** | 4000ms | Sets `submenuVisibility` to `hiddenAutoIdle` |
| **Full collapse** | 5000ms | Resets to `defaultNav`, clears mode and submenu |

### Reset Conditions

Idle timer **resets** on:
- `typing` — user typing in prompt
- `promptFocus` — prompt input focused
- `hover` — pointer over interactive area
- `micToggle` — microphone button pressed
- `voiceRecordingState` — voice recording state change
- `quickActionOpen` — quick action submenu opened
- `promptNonEmpty` — prompt has text

Idle timer **does NOT reset** on:
- `carouselSwipe` / `carouselDrag` — horizontal scrolling of quick actions

### Special Rules

1. **Prompt has text:** Full collapse is blocked. The prompt bar remains visible indefinitely while text exists.
2. **Manual toggle:** If user manually hid quick actions (`hiddenUserToggle`), the submenu visibility reset is skipped, but the full-collapse timer still runs.
3. **Pointer hover pauses:** Entering the interactive area calls `pauseIdleTimer()`. Leaving calls `resumeIdleTimer()` which restarts the countdown.
4. **Focus holds:** While `promptInputFocused === true`, idle timers are paused.

---

## 7. Cartridge & Codex System

### Data Model

```typescript
interface CartridgeDef {
  id: string;           // e.g., "qriptopian"
  label: string;        // e.g., "Qriptopian"
  icon?: string;        // Lucide icon name
  accentHex?: string;   // Brand color hex
  default_codex_id: string;
  codexes: CodexDef[];
  agents?: string[];    // Associated agent IDs
  rules?: string[];     // Policy rule IDs
  assets?: string[];    // Asset references
}
```

### Default Cartridges

| Cartridge | Accent | Default Codex | Agents |
|-----------|--------|---------------|--------|
| **metaMe** | `#FF6B6B` (Coral) | Runtime Core | metame-agent |
| **Qriptopian** | `#00D5FF` (Cyan) | Qriptopian | moneypenny, know1 |
| **KNYT** | `#F59E0B` (Amber) | KNYT | moneypenny, know1, nakamoto |

### Cartridge Selection Flow

1. User taps "Cartridge" quick action in Play mode
2. `submenuType` changes to `cartridgeSelector`
3. Cartridge pills render with brand colors and check marks
4. On selection:
   - Local state updates (`cartridgeState`)
   - If current codex not in new cartridge → falls back to `default_codex_id`
   - `SELECTOR_CHANGE` message posted to iframe: `{ type: "SELECTOR_CHANGE", selector_type: "cartridge", id }`
   - Submenu returns to `quickActions`

### Codex Selection

Codexes are scoped to the active cartridge. The selector shows only codexes belonging to the current cartridge. Selection posts `SELECTOR_CHANGE` with `selector_type: "codex"`.

---

## 8. Persona System

### Data Model

```typescript
interface PersonaDef {
  id: string;           // e.g., "metame-persona"
  label: string;        // e.g., "metaMe"
  icon?: string;        // Lucide icon name
  accentHex?: string;   // Brand color hex
  iqubeId?: string;     // iQube to load when selected
}
```

### Default Personas

| Order | Persona | Accent | iQube ID |
|-------|---------|--------|----------|
| 1 | **metaMe** | `#FF6B6B` (Coral) | `iqube-metame-persona` |
| 2 | **Qripto** | `#00D5FF` (Cyan) | `iqube-qripto-persona` |
| 3 | **KNYT** | `#F59E0B` (Amber) | `iqube-knyt-persona` |

### Persona Selection Flow

1. User taps "Persona" quick action in Be mode
2. `submenuType` changes to `personaSelector`
3. Persona pills render with brand colors (mirrors cartridge UI)
4. On selection:
   - Local `personaState` updates
   - `SELECTOR_CHANGE` posted to iframe: `{ type: "SELECTOR_CHANGE", selector_type: "persona", id, iqube_id }`
   - Runtime loads the corresponding iQube
   - Submenu returns to `quickActions`

### Future API Integration

Personas will be sourced from the AA-API `shell-config` response. The current defaults are stubs. The API must provide:
- Active persona ID
- Available personas with iQube references
- DiDQube credentials and privileges per persona
- DVN pipeline associations

---

## 9. Trust & Reliability Indicators

### Visual Design

Two dot-indicator groups in the header's right section:

```
R ●●●●○    T ●●●○○
```

- **R** = Reliability (0-5 dots, sourced from 0-10 score)
- **T** = Trust (0-5 dots, sourced from 0-10 score)
- Conversion: `filled = ceil(score / 2)`

### Dot Colors

| Score Range | Trust Color | Reliability Color |
|-------------|------------|-------------------|
| 0-3 | Red (`bg-red-500`) | Red (`bg-red-500`) |
| 4-6 | Yellow (`bg-yellow-500`) | Yellow (`bg-yellow-500`) |
| 7-10 | Green (`bg-green-500`) | Purple (`bg-purple-500`) |

### Score Computation (aa-proxy)

```
trust = clamp(base_score - processing_penalty, 1, 10)
reliability = clamp(base_score + reliability_bonus - processing_penalty, 1, 10)
```

| Provider | Base Score | Reliability Bonus |
|----------|-----------|-------------------|
| OpenAI | 5.0 | 0.0 |
| Anthropic | 5.0 | 0.0 |
| ChainGPT | 7.4 | +0.8 |
| Venice | 7.8 | +0.8 |
| Thirdweb | 7.3 | +0.8 |
| Google | 4.5 | 0.0 |
| Default | 4.5 | 0.0 |

- `processing_penalty`: 0.3 when inference is active, else 0.0

### Inference Animation

During active inference, trust dots animate with `animate-pulse` at `duration-700` with staggered delays (`150ms * index`).

### Trust Updates

The iframe can push trust updates via `TRUST_UPDATE` message:
```json
{ "type": "TRUST_UPDATE", "trust": { "level": "verified", "signals": [...], "scores": { "trust": 7, "reliability": 8 } } }
```

---

## 10. Header Selectors (Aigent / LLM)

### Aigent Selector

- **Trigger:** Bot icon + chevron dropdown
- **Options:** Aigent Z (blue), Aigent Q (purple), Aigent M (green)
- **On select:** Calls `updateSelector("aigent", id)` via aa-proxy, posts `SELECTOR_CHANGE` to iframe

### LLM Selector

- **Trigger:** Provider icon + chevron dropdown
- **Grouped by provider:** OpenAI, Anthropic, Google (with provider headers)
- **On select:** Calls `updateSelector("llm", id)` via aa-proxy, posts `SELECTOR_CHANGE` to iframe
- **Trust update:** Score recalculation triggered based on new provider's base scores

---

## 11. iframe Communication Protocol

### Bridge Envelope Format

All outbound messages are wrapped in a standard envelope:

```json
{
  "type": "SHELL_READY",
  "msg_id": "shell-1710000000000-abc123",
  "timestamp": "2026-03-10T12:00:00.000Z",
  "source": "shell",
  "payload": { "hide_chrome": true }
}
```

### Handshake Sequence

```
Shell                          iframe
  │                              │
  │──── SHELL_READY ────────────▶│  (hide_chrome: true)
  │──── HANDOFF ────────────────▶│  (handoff_token + context)
  │──── DEVICE_CONTEXT_UPDATE ──▶│  (device type + viewport)
  │                              │
  │◀──── RUNTIME_READY ─────────│  (triggers status="ready")
```

### Shell → iframe Messages

| Type | Payload | Trigger |
|------|---------|---------|
| `SHELL_READY` | `{ hide_chrome }` | iframe `onReady` |
| `HANDOFF` | `{ handoff_token, context? }` | After `SHELL_READY` |
| `MENU_ACTION` | `{ action_id, prompt?, menu_event? }` | Quick action or menu tap |
| `SELECTOR_CHANGE` | `{ selector_type, id, iqube_id? }` | Aigent/LLM/Cartridge/Codex/Persona change |
| `CONTEXT_UPDATE` | `{ payload }` | Context updates |
| `PROMPT_SUBMIT` | `{ text }` | User submits prompt |
| `RESET_WELCOME` | `{}` | Refresh action |
| `DEVICE_CONTEXT_UPDATE` | `{ context: { device, viewport } }` | Window resize |

### iframe → Shell Messages

| Type | Payload | Shell Response |
|------|---------|----------------|
| `RUNTIME_READY` | — | Mark iframe as ready |
| `NAVIGATE` | `{ path }` | Log; if `action: "close_codex"` → forward as `MENU_ACTION` |
| `TOAST` | `{ message, variant? }` | Log (suppressed in shell) |
| `OPEN_CAPSULE` | `{ capsule_id }` | Log |
| `REQUEST_TRUST_REFRESH` | — | Log |
| `WELCOME_COMPLETE` | — | Transition to `post-welcome` |
| `STATE_SYNC` | `{ state }` | Check inference flags |
| `TRUST_UPDATE` | `{ trust: { level, signals, scores? } }` | Update trust display |

### Inbound Normalization

The `normalizeInbound()` function handles three formats:
1. **Direct:** `{ type: "NAVIGATE", path: "/foo" }`
2. **Envelope:** `{ type: "NAVIGATE", payload: { path: "/foo" } }`
3. **Stringified JSON:** `'{"type":"NAVIGATE","path":"/foo"}'`
4. **Payload-with-type:** `{ payload: { type: "NAVIGATE", path: "/foo" } }`

Meta fields (`msg_id`, `timestamp`, `source`) are stripped. Top-level fields take precedence over payload fields.

### Origin Enforcement

The `resolveIframeOrigin()` function follows this priority:
1. `config.iframe.postMessageOrigin`
2. `config.iframe.origin`
3. Derived from `config.iframe.url` via `new URL().origin`
4. Fallback: `"*"`

**Critical rule:** Any origin starting with `http://localhost` is **ignored** and the next candidate is tried. This prevents development localhost values from leaking into production communication.

---

## 12. AA-API Proxy Architecture

### Edge Function: `aa-proxy`

**Location:** `supabase/functions/aa-proxy/index.ts`

### Routing

| Action | Upstream Endpoint | Method |
|--------|-------------------|--------|
| `challenge` | `/auth/challenge` | POST |
| `verify` | `/auth/verify` | POST |
| `shell-config` | `/runtime/shell-config` | GET |
| `selectors` | `/runtime/selectors` | POST |
| `menu-action` | `/runtime/menu-action` | POST |
| `prompt-action` | `/runtime/prompt-action` | POST |

### Primary/Fallback URLs

- **Primary:** `https://aa.dev-beta.aigentz.me/aa/v1`
- **Fallback:** `https://aigentzbeta-production.up.railway.app/aa/v1`

If primary returns non-OK or throws, fallback is attempted automatically.

### Normalization Pipeline

The proxy performs these normalizations on upstream `shell-config` responses:

1. **Flatten selectors:** `{ current: { id: "gpt-4o" } }` → `{ current: "gpt-4o" }`
2. **Rename provider_id:** `provider_id` → `provider` in LLM options
3. **Map session → trust:** Converts session-style data to trust block
4. **Inject quick links:** Ensures Refresh + Reset are always present
5. **Fix localhost URLs:** Replaces `http://localhost` iframe URLs with production default
6. **Normalize iframe path:** `/runtime` → `/metame/runtime?embed=1&shell=thin`
7. **Ensure edge_items:** Adds empty array if missing
8. **Hoist postMessageOrigin:** Maps to `origin` field
9. **Fix localhost origins:** Replaces with derived URL origin
10. **Hoist handoff_token:** Moves from `bootstrap.handoff_token` to top-level

### Fallback Configuration

When upstream is unavailable, the proxy returns a complete default `ShellConfig` with:
- Phase-1 dev mode trust level
- Three Aigent options (Z, Q, M)
- Seven LLM options across OpenAI, Anthropic, Google
- Default cartridges (metaMe, Qriptopian, KNYT)
- iframe URL: `https://dev-beta.aigentz.me/metame/runtime?embed=1&shell=thin`

---

## 13. EmbedFrame & Connectivity

### Lifecycle States

```
probing → loading → ready
probing → error
loading → blocked
loading → ready (5s timeout fallback)
```

### Probe Strategy

1. Send `HEAD` request with `mode: "no-cors"` and cache-bust timestamp
2. Opaque response (`res.type === "opaque"`) or `res.ok` = reachable
3. If unreachable → show error state with "Open in New Tab" button

### Block Detection

On iframe `onLoad`:
1. Attempt to access `iframe.contentWindow.location.href`
2. Cross-origin throws are expected (not blocked)
3. If `contentWindow` is `null` → CSP/X-Frame-Options block detected → show "blocked" state

### Ready Fallback

If `RUNTIME_READY` message not received within **5 seconds** after load, iframe is marked as `ready` anyway (graceful degradation).

### Multi-Base Fallback

- Bases defined in `EMBED_BASES_RAW` (comma-separated)
- Last-known-good base stored in `localStorage` key `metame_embed_lkg_base`
- LKG base is tried first on subsequent loads

---

## 14. Inference Lifecycle

### Signals

| Signal | Direction | Meaning |
|--------|-----------|---------|
| `INFERENCE_START` / `RENDER_START` / `PROCESSING_START` | iframe → shell | Inference begins |
| `INFERENCE_COMPLETE` / `RENDER_COMPLETE` | iframe → shell | Inference ends |
| `STATE_SYNC` with `processing: true` | iframe → shell | Implicit start |
| `STATE_SYNC` with `processing: false` | iframe → shell | Implicit completion |
| `WELCOME_COMPLETE` | iframe → shell | Welcome flow finished |

### Controller Behavior

- **Start:** Sets `inferring: true`, starts 30s safety timeout
- **Complete:** After 2s grace period, sets `inferring: false`
- **Safety:** If no completion signal within 30s, auto-clears inference state
- **Grace period:** 2s delay before clearing prevents flicker on rapid state changes

### Shell State Transitions

```
welcome → post-welcome (on any inference signal)
```

The shell never returns to `welcome` automatically — only via explicit `resetToWelcome()` or `__runtime_reset__`.

---

## 15. Runtime Commands & System Actions

### `__runtime_` Prefix Convention

System-level actions use a double-underscore prefix to distinguish from API-routed actions.

| Command | Action |
|---------|--------|
| `refresh` / `__runtime_refresh__` | Post `RESET_WELCOME` to iframe, reset shell state |
| `reset` / `__runtime_reset__` | Full iframe remount via `resetKey` increment, clears all state |

### Reset Behavior

**Refresh (soft):**
- Shell state → `welcome`
- Active menu item → `null`
- Mode deactivated
- `RESET_WELCOME` posted to iframe
- Toast: "Reset to welcome"

**Reset (hard):**
- All of the above, plus:
- Quick links expanded
- `resetKey` incremented → React unmounts and remounts iframe
- Toast: "Reset — iframe remounted"

---

## 16. Codex Control Protocol

### Close Codex Flow

The shell supports bidirectional codex panel management:

1. **Inbound `NAVIGATE` with `action: "close_codex"`:**
   - Intercepted by `ShellContext` message handler
   - Forwarded back to iframe as `MENU_ACTION` with `action_id: "close_codex"`
   - Runtime (tier 2) handles actual codex unmounting internally

2. **Inbound `METAME_CODEX_CLOSE_LAYER`:**
   - Diagnostic listener logs receipt
   - No shell-level action taken (runtime manages internally)
   - Supports both raw string and JSON object formats

### Design Decision

The shell does NOT manage codex panel state. The tier 2 runtime owns codex mounting/unmounting. The shell merely relays close signals.

---

## 17. QubeTalk Inter-Agent Coordination

### Configuration

| Property | Value |
|----------|-------|
| Channel | `metame-runtime-thinclient` |
| Agent ID | `lovable-metame` |
| Agent Label | `Lovable Agent` |
| Edge Function | `send-qubetalk` |

### Threads

| Thread | Lovable Role | Primary Owner |
|--------|-------------|---------------|
| `#spec` | read/write (UI) | ChatGPT (authority) |
| `#api-wiring` | read/write | Aigent Z (owner) |
| `#ui-shell` | **owner** | Lovable |
| `#dev-exec` | read/write | Windsurf (implementation) |
| `#ops` | status | Aigent Z (owner) |

### Message Schema

```typescript
interface QubeTalkPayload {
  type: "task" | "decision" | "question" | "status" | "patch" | "log";
  thread: "spec" | "api-wiring" | "ui-shell" | "dev-exec" | "ops";
  severity: "info" | "warn" | "blocker";
  title: string;
  body: string;
  acceptance: string[];
  refs: { repo: string; paths: string[]; endpoints: string[]; env: string[] };
  control: { id: string; supersedes_id: string | null; depends_on: string[]; assignee: string | null; status: string };
  attestations: { authority: string; signature: string };
}
```

**Database constraint:** The `type` column in `qubetalk_messages` only allows: `text`, `delegation`, `response`, `system`, `receipt`. Rich type metadata is stored in the `metadata` JSON column.

### Constraint

Lovable agents are **request-driven** — they cannot poll or listen to QubeTalk in the background. They interact with the messaging bus only during active user sessions.

---

## 18. Smart Triad Synchronization

### Principle

The **Smart Triad system** (via AA-API `shell-config`) is the **single source of truth** for:

- Active persona and available personas
- DiDQube credentials and privileges
- Access controls and entitlements
- DVN pipeline processing configuration
- Cartridge availability and codex scoping
- Menu function availability

### Synchronization Scope

| Domain | Thin Client Role | API Authority |
|--------|-----------------|---------------|
| Persona selection | Renders selector, posts `SELECTOR_CHANGE` | AA-API provides available personas, validates access |
| Cartridge/Codex | Renders selector, posts `SELECTOR_CHANGE` | AA-API provides available cartridges, enforces entitlements |
| Menu actions | Renders UI, forwards to API | AA-API determines action routing, inference targets |
| Trust scores | Displays dots | AA-API computes based on provider + context |
| Identity/Rights | N/A | DiDQube credentials managed by Smart Triad |

### Implementation Responsibility

| Agent | Scope |
|-------|-------|
| **Lovable** | UI rendering, interaction design, local state management |
| **Windsurf** | API implementation, enforcement, DVN pipeline integration |
| **Aigent Z** | Orchestration authority, state validation |

---

## 19. Environment Variables

### Client-Side (Vite)

| Variable | Value | Usage |
|----------|-------|-------|
| `VITE_SUPABASE_URL` | Supabase project URL | Edge function invocation |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key | Edge function auth |

### Edge Function (Server-Side)

| Variable | Value | Usage |
|----------|-------|-------|
| `QUBEBASE_SERVICE_ROLE_KEY` | Service role key | QubeTalk writes (bypasses RLS) |

### Hardcoded in aa-proxy

| Constant | Value |
|----------|-------|
| `AA_PRIMARY` | `https://aa.dev-beta.aigentz.me/aa/v1` |
| `AA_FALLBACK` | `https://aigentzbeta-production.up.railway.app/aa/v1` |

---

## 20. Security & Policy Rules

### Absolute Rules

1. **No direct API calls from browser.** All external communication through Supabase edge functions.
2. **No service keys in client code.** `QUBEBASE_SERVICE_ROLE_KEY` is server-side only.
3. **No business logic in shell.** All state comes from AA-API.
4. **No direct database writes.** Payments, entitlements, etc. always via AA-API.
5. **No localhost origins in production.** The origin resolver filters any `http://localhost` values.
6. **No role storage on profile/users table.** Roles stored in separate `user_roles` table (if applicable).
7. **No client-side admin checks.** Never use localStorage/sessionStorage for access control.

### iframe Security

- CSP must include: `frame-ancestors 'self' https://qriptopian.lovable.app https://*.lovable.app https://*.lovableproject.com`
- `allow` attribute: `clipboard-write; clipboard-read`
- Cross-origin postMessage targeted to specific origin (never `"*"` unless origin resolution fails)

### Authentication Flow

1. DID challenge-verify via aa-proxy (Phase 1: any non-empty signature accepted)
2. `aa_token` cached in memory (not localStorage)
3. Token attached as Bearer header on all aa-proxy calls

---

## 21. Color System & Brand Palette

### Mode Accent Colors

| Mode | HSL Values | Hex | Usage |
|------|-----------|-----|-------|
| **Be** | `210 70% 55%` | `#4DA3FF` | Nav icon, prompt border, quick action hover |
| **Earn** | `142 71% 45%` | `#22C55E` | Nav icon, prompt border, quick action hover |
| **Play** | `190 100% 50%` | `#00D5FF` | Nav icon, prompt border, quick action hover |
| **Make** | `300 76% 60%` | `#D946EF` | Nav icon, prompt border, quick action hover |
| **Share** | `38 92% 50%` | `#F59E0B` | Nav icon, prompt border, quick action hover |

### Brand Colors (Cartridges & Personas)

| Brand | Hex | CSS Name | Usage |
|-------|-----|----------|-------|
| **metaMe** | `#FF6B6B` | Coral | Cartridge pill, persona pill, header cartridge icon |
| **Qriptopian** | `#00D5FF` | Cyan | Cartridge pill, persona pill, header cartridge icon |
| **KNYT** | `#F59E0B` | Amber/Orange | Cartridge pill, persona pill, header cartridge icon |

### Design System Tokens

All UI elements use Tailwind semantic tokens:
- `bg-background`, `bg-card`, `bg-popover`
- `text-foreground`, `text-muted-foreground`
- `border-border`
- `bg-accent`, `hover:bg-accent/50`
- `bg-muted/20` (trust indicator pill)

**Rule:** Never use raw color classes (`text-white`, `bg-black`) in components. Always use semantic tokens. Accent colors are applied via inline `style` for dynamic theming.

---

## 22. Mobile-First Design Rules

### Viewport Handling

- Root container uses `h-dvh` (dynamic viewport height) to handle mobile browser chrome
- `window.visualViewport` resize listener resets scroll when keyboard closes (height increases by >50px)

### Keyboard Management

- `quickActionOnly` mode exists specifically to avoid triggering the virtual keyboard on touch devices
- Prompt input auto-focuses only in `promptMode`, not `quickActionOnly`
- iOS keyboard handling: `scrollIntoView({ block: "end" })` called with progressive delays (0ms, 300ms, 600ms) to accommodate keyboard animation

### Touch Interactions

- All nav interactions use `PointerEvent.pointerType` for reliable touch detection
- Swipe-up threshold: **40px** on nav bar to enter `promptMode`
- Swipe-down threshold: **40px** on prompt bar to collapse

### CSS Concerns

- Nav bar padding `pt-3 pb-2` raises content from bottom edge (rounded-corner device clearance)
- Fixed height `4.25rem` for both nav and prompt bars ensures consistent layout
- Edge fade indicators on quick action carousel prevent abrupt visual cutoff

---

## 23. Known Constraints & Limitations

### Platform Constraints

1. **React-only:** Built on React 18 + Vite. No SSR, no Next.js, no native mobile.
2. **No backend code:** Cannot run Python, Node.js, etc. Backend via Supabase edge functions only.
3. **Request-driven agent:** Lovable cannot autonomously poll or subscribe to real-time channels.
4. **HMR sensitivity:** Context providers may lose reference during Vite hot module replacement. The `ShellContext` includes HMR boundary comments to aid stability.

### iframe Constraints

1. **Cross-origin:** Cannot access iframe `contentDocument` — all communication via postMessage.
2. **CSP dependency:** Upstream server must whitelist Lovable domains in `frame-ancestors`.
3. **Load detection:** No reliable "blocked" signal — uses contentWindow access attempt + 5s timeout.

### API Constraints

1. **Phase 1 auth:** Any non-empty signature is accepted. Production will require real DID signing.
2. **Fallback data:** When AA-API is unreachable, the proxy returns static defaults. Trust scores, menu items, and selectors may not reflect real state.
3. **No real-time sync:** Shell-config is fetched once on hydration. Live updates only via iframe postMessage signals.

---

## Appendix A: Animation Specifications

| Animation | Duration | Easing | Usage |
|-----------|----------|--------|-------|
| Mode pop | CSS `animate-scale-in` | Default | Mode indicator pill on prompt bar |
| Submenu slide-up | `300ms` | `slide-in-from-bottom-2` | Quick action/submenu appearance |
| Color wash (border) | `300ms` | `transition-all` | Nav border accent changes |
| Calm collapse | `350ms` | `transition-all` | Submenu → nav state change |
| Nav button active | `200ms` | `active:scale-110` | Button press feedback |
| Quick action active | `150ms` | `active:scale-95` | Quick action press feedback |
| Trust dot pulse | `700ms` | `animate-pulse` | During inference, staggered 150ms per dot |

## Appendix B: Prompt Bar Specifications

| Property | Value | Notes |
|----------|-------|-------|
| Font size | `0.9375rem` (15px) | "~1pt larger than text-sm" per spec |
| Text color | `text-white` | "Brilliant white" per spec |
| Placeholder alignment | `text-center` | Center-justified while typing |
| Post-send alignment | `text-left` | Left-justified after message sent |
| Caret color | Mode accent hex | Dynamic per active mode |
| Placeholder text | Mode-specific | e.g., "Ask, explore, watch, listen, read, or switch context…" |

## Appendix C: File Size Guide

| File | Lines | Notes |
|------|-------|-------|
| `ShellContext.tsx` | ~656 | Central provider — consider splitting if >800 |
| `aa-client.ts` | ~213 | API client — consider splitting by domain |
| `smart-menu-config.ts` | ~280 | Config definitions — stable |
| `shell-messages.ts` | ~172 | Protocol types — stable |
| `aa-proxy/index.ts` | ~468 | Edge function — consider splitting actions |

---

*This document is maintained by the Lovable Agent and should be updated whenever design decisions, configurations, or policies change. For API-side specifications, refer to the AA-API documentation maintained by Windsurf and Aigent Z.*
