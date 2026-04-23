

# Restoration manifest — what to surgically re-apply after reverting to build `53ee4b0b`

Build `53ee4b0b` ("Fixed persona dispatch bug", 2026-04-22 03:48) is the last build where the Persona/Cartridge selectors rendered and persisted. After the revert, the following non-debugging features must be re-applied. Each item lists the file(s), the change, and the source-of-truth message in the chat history.

## Group A — Be submenu reordering & labels (msg #739, #740)

**File:** `src/lib/smart-menu-config.ts`
- Reorder `BE_ACTIONS` to: **Persona | Memories | Identity | Connections | Settings**
- Rename `memory` action label from "Memory" to **"Memories"**
- Update `mobileVisibleFold` for Be to match the new order

(Note: the previous Persona↔Settings swap from msg #727/#728 is superseded by this newer order — apply the newer order only.)

## Group B — Identity quick link (msg #737, #738)

**Files:**
- **New file:** `src/lib/identity-messages.ts` — `postIdentityIQubeOpen(iframe, origin)` triple-dispatch helper (canonical envelope, hybrid with msg_id/timestamp/source, bare flat). No `iqube_type`. Already preserved in current tree — verify it survived the revert; if not, re-create from the version pasted in this conversation.
- `src/contexts/ShellContext.tsx` — add `openIdentityIQube()` method on the shell context that calls `postIdentityIQubeOpen(iframeRef.current, getIframeOrigin(config))`. No `apiAction`, no `iframeAction`, no `submitPrompt` — drawer-open only.
- `src/components/SmartMenuSubmenu.tsx` — `handleAction` Identity branch: call `openIdentityIQube()` directly and return.
- **New test:** `src/test/identity-flow.test.ts` (already in tree — preserve).

## Group C — Earn submenu refactor + wallet deep-link tabs (msg #753, #754)

**File:** `src/lib/smart-menu-config.ts`
- Replace `EARN_ACTIONS` with: **Goal | Task | Wallet | Reward | Offer**
- `task`, `reward`, `offer` deep-link to the corresponding Wallet tabs (use the existing wallet-tab field on the action def — value matches the runtime's tab id).
- Remove the older Earn entries that are not in the above five.

**File:** `src/components/SmartMenuSubmenu.tsx`
- Optimistic "Opening…" pending feedback for Earn deep-link actions while the runtime mounts. Implementation: the existing `PendingRuntimeBadge` + activation-id state pattern.

## Group D — SmartMenu activation zones (msg #755, #756, #761, #762)

**File:** `src/components/SmartMenu.tsx`
- Left and right "bridge" containers between center cluster (Make/Play/Earn) and edge buttons (Be/Share) split **50/50**: outer half belongs to Be/Share hover zone, inner half is Play activation gap.
- Edge buttons (`Be`, `Share`) get `expandedHitArea` (min-width `5rem`, px-2) so their tap+hover zone is ~3× the center buttons.
- Play "gap intent" pointer-enter uses a 220ms hover-intent timer before activating; pointer-leave cancels it.
- `handleNavAreaPointerUp` activates Play quick actions on touch in empty nav area.
- `navRestoredAt` / `modeActivatedAt` 400ms phantom-hover guards survive the revert as-is — reapply if missing.

This is exactly the layout already in the file pasted in this conversation; treat that file as the canonical post-revert version.

## Group E — Command queueing & pending UI (msg #761, #762)

**File:** `src/contexts/ShellContext.tsx`
- `stageRuntimeCommand(dispatchFn, label)` helper that queues a runtime command, fires it immediately if iframe is ready, otherwise replays on `RUNTIME_READY`.
- `inferCtrl` start/complete pattern for optimistic in-flight UI on Persona/Cartridge launches.
- `submitPromptRef` for queued prompt submission via `queueMicrotask`.

These were used by `selectPersona` and `launchCartridge` after the revert point.

## Group F — Persona dispatch (build 53ee4b0b baseline + ONE simplification we want to keep)

The reverted build's `selectPersona` already does the right thing. The only change worth keeping from post-revert work is the **single-message dispatch** (no triple-dispatch). After revert:

**File:** `src/contexts/ShellContext.tsx` — `selectPersona`
- Send ONE message identical to Cartridge:
  ```ts
  postToIframe(iframeRef.current, {
    type: "OPEN_PERSONA_IQUBE",
    payload: { iqube_type: iqubeType },
  }, origin);
  ```
- Delete `src/lib/persona-messages.ts` if the revert restored it.
- Update `src/test/persona-flow.test.ts` to assert single-message dispatch.

This is the only post-revert behavioural change to retain in this group; it does not affect rendering — selectors will work because we are NOT re-applying the `setSubmenuType` idle-timer mistake.

## Group G — Memory updates to re-apply

After revert, restore these memory entries:
- `mem://integration/persona-iqube-contract.md` — single OPEN_PERSONA_IQUBE dispatch
- `mem://integration/identity-iqube-contract.md` — direct openIdentityIQube, no apiAction
- `mem://integration/launch-cartridge-contract.md` — payload-nested cartridge_id
- `mem://features/persona-system.md` — append: "Selectors must not arm idle timer in `setSubmenuType`."

## What we are explicitly NOT re-applying

These were the failed debugging attempts and must stay reverted:
- The `startIdleTimerRef` / `queueMicrotask(startIdleTimerRef.current)` block inside `setSubmenuType` (the cause of the regression)
- The `submenuTypeRef` guard inside the 5s `idleTimerRef` (no longer needed once `setSubmenuType` doesn't arm the timer)
- The `isSelectorOpen` gate in `SmartMenu.tsx` `showSubmenu` (harmless, but can be omitted)
- Triple-dispatch envelope helpers for Persona/Identity (single-message dispatch is preferred per Group F; identity helper stays single-purpose)

## Execution order after revert

1. Verify `Be → Persona → KNYT/Qripto` selector renders and persists in the reverted build (sanity check the baseline).
2. Apply Group A (Be order + Memories label).
3. Apply Group B (Identity).
4. Apply Group C (Earn refactor).
5. Apply Group D (activation zones).
6. Apply Group E (command queue + pending UI).
7. Apply Group F (single-message persona dispatch).
8. Apply Group G (memory).
9. Run `vitest` — persona-flow + identity-flow tests should pass.
10. Manual verify: Be→Persona, Be→Identity, Play→Cartridge, Earn→Task/Reward/Offer deep-link.

## How to revert

Use the History tab or the revert button under the build `53ee4b0b` message in chat to restore that snapshot, then proceed with steps 2–10.

<lov-actions>
  <lov-open-history>View History</lov-open-history>
</lov-actions>

