
# Lovable Sprint Plan — metaMe Runtime Thin Client Shell

## Ownership Boundary

Lovable owns ONLY the thin-client shell:
- Smart menu system (mode switching, quick-action sets, idle/dismiss behavior)
- Agent header (trust score display, Aigent/LLM selectors, cartridge icon)
- Shell-level layout/parity (spacing, radii, breakpoints, typography rhythm)
- Thin-client wrappers around the runtime iframe (EmbedFrame, RuntimeFrame)
- Shell ↔ iframe postMessage bridge (shell-messages.ts, inference lifecycle)

Lovable does NOT own:
- Studio Experience tab UI
- Parity modal
- Pipeline visualization
- Runtime experience cards / analysis cards
- Goals / matrix / NBE rendering
- End-user journey cards
- Active guide / handoff cards
- Codex/admin CRM-linked experience views

All non-shell UI is rendered inside the iframe / Next.js app and owned by Codex or Claude.

## Agent Division

- **Lovable** = shell
- **Codex** = application surfaces (inside iframe / Next.js)
- **Claude** = harness, plumbing, policy/hooks/integration scaffolding

---

## Sprint 1 — Stabilize shell control plane

Goal: Harden the shell so it can cleanly host journey-aware runtime behavior without absorbing app logic.

### LOV-101 — Shell architecture contract
- Document shell vs iframe state ownership
- Document message vocabulary crossing the boundary
- Deliverable: `docs/SHELL_CONTRACT.md`

### LOV-102 — Harden smart menu state model
- Audit state transitions for determinism (defaultNav ↔ quickActionOnly ↔ promptMode)
- Verify idle timer behavior, collapse guards, prompt-has-text protection
- Fix any overlapping or broken menu states

### LOV-103 — Harden agent header contract
- Verify trust score rendering (R/T dots, color thresholds, animation sync)
- Verify selector state (Aigent, LLM, cartridge icon)
- Ensure header reflects state cleanly across breakpoints

### LOV-104 — Refine iframe wrapper behavior
- Verify EmbedFrame loading/error/blocked states
- Verify resize and breakpoint behavior
- Ensure RuntimeFrame handshake sequence is robust
- Verify inference lifecycle listener (start/complete/safety timeout)

### LOV-105 — Shell parity checklist
- Document shell-only parity rules (spacing, radii, typography, container behavior)
- Validate header/menu behavior across mobile/tablet/desktop

---

## Sprint 2 — Smart menu as journey-aware orchestration surface

### LOV-201 — Align menu modes to runtime triggers
- Map Be/Earn/Play/Make/Share to shell-supported runtime entry states
- Ensure each mode can frame a distinct runtime context without rendering runtime UI

### LOV-202 — Refine quick-action set behavior
- Quick actions remain shell-native, launch/frame runtime contexts
- Selection hands off cleanly to iframe state via MENU_ACTION/PROMPT_SUBMIT

### LOV-203 — Shell event interface for runtime coordination
- Define clean event vocabulary: mode changed, quick action selected, prompt submitted, shell reset
- Ensure Codex/runtime team can consume these events

### LOV-204 — Trust-score-aware header behavior
- Support trust score rendering and future score changes
- Shell-safe visual treatment for trust state shifts

### LOV-205 — Shell QA across breakpoints
- Validate mobile, tablet, desktop
- Iframe wrapper integrity, menu/header parity

---

## Sprint 3 — Stable shell integration for runtime-driven states

### LOV-301 — Shell placeholders for runtime-driven states
- Shell awareness of: active guide, focus mode, deep-link, handoff
- Only as shell context, not shell content

### LOV-302 — Iframe transition polish
- Smoother transitions for cartridge/codex change, handoff, prompt-driven context
- No shell/content visual conflict

### LOV-303 — Shell loading/fallback states
- Shell remains useful when iframe is loading/unavailable
- Menu/header stay stable, fallback copy is shell-safe

---

## Sprint 4 — KNYT proving flows

### LOV-401 — Validate shell during KNYT onboarding/progression
### LOV-402 — Tune quick actions for KNYT entry points
### LOV-403 — Tune header trust display for live flows

---

## Sprint 5–6 — Hardening & polish

- Performance polish
- Shell parity refinement
- Trust/header refinements
- Iframe wrapper resilience
- Shell analytics hooks if needed
- Regression testing

---

## Definition of Done

- Smart menu works cleanly as shell orchestrator
- Agent header with trust scores is stable
- Iframe wrapper is reliable and parity-safe
- Shell can launch and frame runtime states without owning runtime UI
- No Studio or runtime feature UI has leaked into Lovable scope
