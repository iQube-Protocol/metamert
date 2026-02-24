

# Fix: Upstream Runtime Rendering Duplicate Chrome in Embed Mode

## Problem

The iframe at `https://dev-beta.aigentz.me/metame/runtime?embed=1` is rendering its own header (selectors, trust dots), prompt box, and bottom navigation (Be/Earn/Play/Make/Share) -- duplicating the shell's UI elements. The `embed=1` query parameter should signal the upstream runtime to strip its chrome, but the Amplify-deployed runtime is ignoring this flag.

**Visual evidence**: The screenshot shows two sets of selectors, two sets of trust indicators, two bottom menus, and two prompt boxes -- one from the shell and one from the iframe content.

## Root Cause

This is an **upstream issue**, not a shell bug. The shell is working correctly:
- It passes `embed=1` in the iframe URL
- It renders its own header, SmartMenu, QuickLinksBar, and PromptBox as designed
- The aa-proxy normalizer correctly builds the URL with `embed=1`

The upstream Next.js runtime (deployed on Amplify) is not checking the `embed` query parameter to conditionally hide its layout chrome.

## Plan

### 1. Notify upstream via QubeTalk

Send a QubeTalk message to the `metame-runtime-thinclient` channel on the `#ui-shell` thread requesting that the Amplify runtime respect `embed=1` by hiding its own header, bottom nav, and prompt box when embedded.

### 2. Add CSS-based iframe chrome suppression (interim workaround)

While waiting for the upstream fix, inject a `postMessage` to the iframe requesting it hide its chrome. If the upstream does not support this message, use a CSS-based approach:

- After the iframe loads and transitions to `ready`, send a `SHELL_READY` message that includes a `{ hide_chrome: true }` flag
- Update `shell-messages.ts` to include `hide_chrome` in the `SHELL_READY` payload

### 3. Alternative: hide shell chrome and defer to iframe (NOT recommended)

This would break the thin-client architecture. The shell owns the chrome; the iframe should be content-only. This approach is documented here only to confirm it was considered and rejected.

## Technical Details

### Changes to `src/lib/shell-messages.ts`

Extend the `SHELL_READY` outbound message type to include an optional `hide_chrome` flag:

```text
{ type: "SHELL_READY"; hide_chrome?: boolean }
```

### Changes to `src/components/RuntimeFrame.tsx`

Update `handleReady` to send `hide_chrome: true` in the `SHELL_READY` message:

```text
postToIframe(iframeRef.current, { type: "SHELL_READY", hide_chrome: true }, origin);
```

### QubeTalk notification

Post to channel `metame-runtime-thinclient`, thread `#ui-shell`:

> "The upstream runtime at /metame/runtime?embed=1 is rendering its own header, bottom nav, and prompt box, duplicating the shell chrome. The runtime must check for the `embed=1` query param (or listen for `SHELL_READY` with `hide_chrome: true`) and suppress its own layout chrome when embedded. The shell owns all chrome: header (selectors + trust), SmartMenu, QuickLinksBar, and PromptBox."

### Files to modify

- `src/lib/shell-messages.ts` -- add `hide_chrome` to SHELL_READY type
- `src/components/RuntimeFrame.tsx` -- send `hide_chrome: true` in SHELL_READY
- QubeTalk message via `send-qubetalk` edge function

## Expected Outcome

Once the upstream runtime respects `embed=1` or the `hide_chrome` flag, the iframe will render only its content area (capsules, surfaces, welcome screen) without any navigation chrome, eliminating the duplicate UI.
