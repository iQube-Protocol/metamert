# Welcome Guide / Visitor Tour — Revised Plan (v3)

Incorporates Claude's deep-link spec: canonical `MENU_ACTION { action_id, deep_link }` envelope, Offer → Payments swap, six wired dispatches.

## Part 1 — Menu changes (ship first)

### 1a. Earn submenu: replace `offer` with `payments`, add `signin`

In `src/lib/smart-menu-config.ts`:

```ts
const EARN_ACTIONS: QuickActionDef[] = [
  { id: "goal",     label: "Goal",     icon: "target",       kind: "system-only", triggersInference: false },
  { id: "task",     label: "Task",     icon: "check-square", kind: "system-only", triggersInference: false },
  { id: "wallet",   label: "Wallet",   icon: "wallet",       kind: "system-only", triggersInference: false },
  { id: "reward",   label: "Reward",   icon: "star",         kind: "system-only", triggersInference: false },
  { id: "payments", label: "Payments", icon: "credit-card",  kind: "system-only", triggersInference: false },
  { id: "signin",   label: "Sign In",  icon: "log-in",       kind: "system-only", triggersInference: false },
];
```

- `mobileVisibleFold`: `["goal", "task", "wallet", "reward", "payments", "signin"]`
- Remove `"offer"` from `DRAWER_ONLY_ACTION_IDS`; add `"payments"`, `"signin"`, and `"persona-create"`.
- Icon map (`icon-utils.ts` + `smart-menu-icons.ts`): add `payments → CreditCard`, `signin → LogIn`, `persona-create → UserPlus`. Remove `offer` defaults (or leave — harmless).

### 1b. Persona sub-sub-menu: trailing "+" pill

`SmartMenuSubmenu.tsx` (`submenuType === "personaSelector"` branch) renders an extra non-persona pill after the Qripto/KNYT pills:

- Label: "+" (or `UserPlus` icon).
- Click handler dispatches the canonical `MENU_ACTION` (see 1c) with `action_id: "persona"` and the create-wizard deep link.
- Pill is not part of `personaState.available`; it's rendered locally in the submenu component.

### 1c. Deep-link dispatch wiring (the contract)

All six items use the existing `MENU_ACTION` shell→iframe message, extended with an optional `deep_link` envelope. The runtime side is already live on Amplify (`MetaMeRuntimeClient.tsx` reads `payload.deep_link` and routes `walletInitialTab`; unknown tabs fall back to `"wallet"`).

Envelope:

```ts
{
  type: "MENU_ACTION",
  payload: {
    action_id: "wallet" | "persona",
    deep_link?: {
      module: "wallet" | "persona";
      tab?:   "wallet" | "tasks" | "reputation" | "rewards" | "library" | "payments";
      intent?: "signin" | "signup";
      flow?:  "create-wizard" | "quick-add";
    }
  }
}
```

Per-item dispatch table:

| Menu item        | action_id   | deep_link                                                            |
|------------------|-------------|----------------------------------------------------------------------|
| Sign In (Earn)   | `wallet`    | `{ module: "wallet", tab: "wallet", intent: "signin" }`              |
| Rewards (Earn)   | `wallet`    | `{ module: "wallet", tab: "rewards" }`                               |
| Tasks (Earn)     | `wallet`    | `{ module: "wallet", tab: "tasks" }`                                 |
| Payments (Earn)  | `wallet`    | `{ module: "wallet", tab: "payments" }`                              |
| Reputation       | `wallet`    | `{ module: "wallet", tab: "reputation" }`                            |
| + Create persona | `persona`   | `{ module: "persona", flow: "create-wizard" }`                       |

Implementation:

- Add a `deep_link` field to the `MENU_ACTION` payload type in `src/lib/shell-messages.ts` (or wherever the bridge types live).
- In `SmartMenu.tsx` (and `SmartMenuSubmenu.tsx` for the "+" pill), build the deep_link from a small lookup keyed by quick-action id, then send via the existing `sendIframeAction` / `MENU_ACTION` path. No new outbound message type required.
- The current `openIdentityIQube()` / direct persona pill paths are unchanged — they remain the source of truth for the Identity quick action and persona-switch pills, which do not require deep links.
- Document the new `deep_link` field in `docs/SHELL_CONTRACT.md` (mirrors `packages/iframe-bridge/README.md` on the runtime side).

**Reputation note:** "Reputation" is in the spec table but does not exist today as a Smart Menu item. We keep its dispatch wired in the lookup so the tour (or a future menu add) can fire it, but we do not add a Reputation tile in this ticket. Confirm with Claude/operator whether Reputation should land as a 7th Earn item or a Be item before adding it visually.

### 1d. Persona/Identity unification — backlog (unchanged)

Harmonize Be-menu `personaState.activePersonaId` with the wallet's authoritative persona, and Identity drawer with the wallet's identity record. Out of scope for this ticket.

## Part 2 — Visitor Tour MVP

Library: React Joyride.

### New files

- `src/components/tour/VisitorTour.tsx`
- `src/components/tour/WelcomeModal.tsx`
- `src/components/tour/TourHelpButton.tsx`
- `src/hooks/use-tour-state.ts` (localStorage: `metame.tour.visitor.completed` / `.skipped`)

### Edited files

- `src/lib/smart-menu-config.ts` — Part 1a swap.
- `src/lib/icon-utils.ts`, `src/lib/smart-menu-icons.ts` — `payments`, `signin`, `persona-create`.
- `src/lib/shell-messages.ts` — add `deep_link?` to `MENU_ACTION` payload type.
- `src/components/SmartMenu.tsx` — deep-link lookup; dispatch on click for `signin`, `payments`, `reward`, `task` (deep-linked variants), and on persona "+" pill.
- `src/components/SmartMenuSubmenu.tsx` — render trailing "+" pill in persona selector; dispatch persona create.
- `src/components/RuntimeHeader.tsx` — `data-tour` attributes; mount `TourHelpButton`.
- `src/components/CartridgeIndicator.tsx` — `data-tour="cartridge-indicator"`.
- `src/pages/Index.tsx` — mount `<WelcomeModal />` and `<VisitorTour />` in `ShellLayout`.
- `docs/SHELL_CONTRACT.md` — document `deep_link` envelope.

### Tour steps (10)

1. **Welcome** — runtime area. "Explore freely. Create a persona to act. Add an ExperienceGuide when you want aigentMe to personalize your Runtime."
2. **Smart Menu** — nav bar (Be / Earn / Play / Make / Share).
3. **Cartridges** — cartridge indicator; CTA → `launchCartridge({ cartridge_id: "knyt-codex" })`.
4. **Co-pilot prompt** — prompt bar.
5. **Persona pill** — header persona pill; CTA → `openPersonaIQube({ iqube_type: "knyt" })`.
6. **Create persona (on-ramp #1)** — open Be → Persona submenu, highlight "+"; CTA dispatches `MENU_ACTION { action_id: "persona", deep_link: { module: "persona", flow: "create-wizard" } }`.
7. **Sign in (on-ramp #2)** — open Earn submenu, highlight Sign In; CTA dispatches `MENU_ACTION { action_id: "wallet", deep_link: { module: "wallet", tab: "wallet", intent: "signin" } }`.
8. **Settings — agent boundaries** — open Be submenu, highlight Settings; CTA opens existing Settings drawer. Copy: "Set the boundaries of what your runtime agent can do on your behalf."
9. **Trust dots** — R/T strip. Passive glance indicator.
10. **Restart** — `?` help button.

Steps 6/7 open iframe-rendered drawers; the tour pauses briefly after dispatch and advances (cannot anchor Joyride tooltips inside the iframe — that needs the future `TOUR_HIGHLIGHT` handshake). Drawer is idempotent: re-dispatching with a different tab updates `initialTab` without close/reopen, so a future tour can step through multiple wallet tabs cleanly.

### State machine

- On mount, once shell is hydrated: if `!completed && !skipped` → show `WelcomeModal`.
- "Start guide" → run Joyride.
- "Explore on my own" → set `skipped`; help button still available.
- End/skip during run → set `completed`.
- Help button always restarts.

### Styling

Joyride themed with `--mm-*` tokens. No new color tokens. Preserves KNYT Glass dark-mode integrity.

## Out of scope

- Persona Tour, ExperienceGuide Tour (need iframe `TOUR_HIGHLIGHT` handshake).
- `data-tour` attributes inside the runtime iframe.
- Highlighting Remix / Buy / Vote / Publish / aigentMe.
- Adding a visible "Reputation" menu item (wiring exists; placement TBD).
- Server-side tour persistence.
- Persona ↔ wallet unification (backlog).
- Runtime-side fast-follows owned by Claude: `authIntent` prop for forced Sign Up, `initialPersonaFlow` prop to auto-launch PersonaSetupWizard / PersonaQuickAddModal.

## What Claude can close on their side

- Confirm whether Reputation should be added as a visible Earn (or Be) tile, and at which slot.
- Pick up backlog items #1 (`authIntent`) and #2 (`initialPersonaFlow`) once this shell PR lands — current spec ships Sign In landing on the wallet tab's default sign-in form, and Create persona landing on the KNYT/Qripto picker (not the full wizard auto-launched).
