## Why the tour jumps from "Smart Menu" to "Trust & Reliability"

Joyride silently skips any step whose `target` selector is not in the DOM at the moment the step is rendered. Steps 2–8 all target elements that are only conditionally mounted:

- `[data-tour="cartridge-indicator"]` — in the header (should exist, but see below)
- `[data-tour="smart-menu-prompt"]` — only rendered when `viewState === "promptMode"`
- `[data-tour="quick-action-wallet"]` and `[data-tour="quick-action-settings"]` — only rendered inside `SmartMenuSubmenu`, which mounts when a submenu (be/earn/play/…) is active

The current step effect runs on Joyride's `STEP_BEFORE` event and calls `clearShellSurfaces()` followed by `activateMode("earn")` / `activateMode("be")`. React schedules those state updates asynchronously, so when Joyride immediately measures the target it finds nothing — and rolls forward step by step until it lands on `trust-dots` (step 9), which is always in the DOM.

The "loader animations" and "Replay welcome guide tooltip" churn visible in the replay between step 1 and step 9 are the side effects of those rapid mode toggles firing while Joyride fast-forwards.

## Fix

Make the tour **wait for its anchor to be mounted** before showing each step, by switching `VisitorTour` to a controlled `stepIndex` and gating advancement on DOM readiness.

### Steps

1. **Controlled Joyride index in `src/components/tour/VisitorTour.tsx`**
   - Track `stepIndex` in local state; pass it to `<Joyride stepIndex={stepIndex} />`.
   - Handle `ACTIONS.NEXT` / `ACTIONS.PREV` (on `EVENTS.STEP_AFTER`) ourselves instead of letting Joyride auto-advance.

2. **Pre-stage surfaces, then wait for the target**
   - When advancing to step N: first run `runStepEffect(steps[N].data.action)` (clears shell surfaces and opens the correct drawer/submenu).
   - Then `await waitForElement(steps[N].target, { timeout: 1500, interval: 50 })` — a small polling helper using `document.querySelector`.
   - Only after the element resolves do we set `stepIndex = N`, so Joyride renders with a valid anchor.
   - If the element never appears within the timeout, fall back to skipping that single step (advance to N+1) instead of cascading through every later step.

3. **Reset state on restart**
   - When `run` flips from false→true (or `runKey` changes), reset `stepIndex` to 0 and immediately run the pre-stage flow for step 0.

4. **No changes needed to step definitions, anchors, or `DEEP_LINK_DISPATCH`** — the existing targets are correct; only the timing is broken.

### Technical details

- `react-joyride` exposes `ACTIONS`, `EVENTS`, and `STATUS`. We listen for `EVENTS.STEP_AFTER` + `ACTIONS.NEXT`/`ACTIONS.PREV` and for `ACTIONS.CLOSE`/`STATUS.FINISHED`/`STATUS.SKIPPED` to call `onFinish`.
- `waitForElement` is a 20-line helper local to `VisitorTour.tsx`:

```text
waitForElement(selector, { timeout, interval }):
  loop until found or timeout:
    el = document.querySelector(selector)
    if el and el.offsetParent !== null: return el
    await sleep(interval)
  return null
```

- We also check `offsetParent !== null` so we don't anchor onto a hidden node.
- `pauseIdleTimer()` continues to be called once per transition so the SmartMenu doesn't auto-collapse mid-tour.

### Out of scope

- No design changes (cards, colors, arrows stay as they are).
- No changes to `ShellContext`, the wallet deep-link contract, or any runtime postMessage payloads.
- No changes to memory/index.md.
