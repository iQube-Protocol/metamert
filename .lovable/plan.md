# Drawer quick actions → UI-only overlay (no inference)

## Problem

When the user taps Wallet, Reward, Offer, Task, Goal, Settings, or Connections, the shell currently fires two things:

1. `MENU_ACTION { action_id }` — opens the drawer in the runtime ✅
2. A `PROMPT_SUBMIT` (and for `wallet`, an AA-API `menu-action` roundtrip that returns a `prompt`) — triggers inference and resets runtime state ❌

Per Lovable-side instruction from the runtime team, these actions must be pure UI overlays. Persona / Identity / Memory are already drawer-only via dedicated openers; the rest are not.

## Target action ids

Drawer-only (no inference, no AA roundtrip, no prompt):
`wallet, reward, offer, task, goal, settings, connections, identity, persona, memory`

(`identity`, `persona`, `memory` already correct — keep as-is.)

## Changes

### 1. `src/lib/smart-menu-config.ts`
Convert the following quick actions to `kind: "system-only"`, `triggersInference: false`, and remove `prompt` / `apiAction` fields:

- `EARN_ACTIONS`: `goal`, `task`, `wallet` (drop `apiAction: "wallet"`), `reward`, `offer`
- `BE_ACTIONS`: `connections`, `settings`

Persona/identity/memory already correct.

### 2. `src/components/SmartMenuSubmenu.tsx`
Add an explicit drawer-only branch in `onAction` (before the `action.prompt` block):

```ts
const DRAWER_ONLY_ACTIONS = new Set([
  "wallet","reward","offer","task","goal","settings","connections",
]);
if (DRAWER_ONLY_ACTIONS.has(action.id)) {
  sendIframeAction(action.id);   // postMessage MENU_ACTION { action_id } only
  resetIdleTimer("quickAction");
  return;
}
```

This routes through the existing `sendIframeAction` in `ShellContext` (which already sends `{ type: "MENU_ACTION", action_id }` with no prompt and no AA call).

No changes needed in `ShellContext.handleMenuAction` — we simply stop calling it for these ids.

### 3. `src/test/persona-flow.test.ts` (or new `drawer-actions.test.ts`)
Add a regression test: tapping each drawer-only id results in exactly one outbound `MENU_ACTION` with no `prompt` field, and no `PROMPT_SUBMIT` is dispatched.

### 4. Docs
Update `docs/SHELL_CONTRACT.md` §2 outbound table note: drawer-only `action_id`s are sent without `prompt` and bypass AA `menu-action`.

## Out of scope

- Runtime-side handling (already early-returns for these ids per the instruction).
- Any change to inference-driving actions (`read`, `listen`, `watch`, `create`, etc.).
- Persona/Identity/Memory openers — already drawer-only.
