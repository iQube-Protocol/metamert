

# Fix: postMessage Origin Mismatch Blocking All Shell-to-iframe Communication

## Root Cause

The upstream API returns `postMessageOrigin: "http://localhost:3000"` (a dev-only value). The shell's `getIframeOrigin()` function prioritizes `postMessageOrigin` over `origin`, so every `postMessage` call targets `http://localhost:3000`. The iframe is loaded from `https://dev-beta.aigentz.me`. The browser silently drops all messages because the target origin doesn't match the iframe's actual origin. This is why:

- Menu items (Be, Earn, Play, Make, Share) produce no response
- QuickLinks (Watch, Listen, Read, Find) produce no response
- Prompt submissions produce no response
- Selector changes (Aigent/LLM) send messages to the void

## Fix (2 files, 2 changes)

### 1. `supabase/functions/aa-proxy/index.ts` -- Normalize `postMessageOrigin`

Add a step in `normalizeShellConfig` to fix or remove `postMessageOrigin` when it points to localhost, just like the existing fix for `origin`:

```text
// After existing step 8 ("Fix localhost origin"), add:
// 9. Fix localhost postMessageOrigin
if (raw.iframe?.postMessageOrigin?.startsWith("http://localhost"))
  raw.iframe.postMessageOrigin = raw.iframe.origin
    || new URL(raw.iframe.url).origin;
```

### 2. `src/contexts/ShellContext.tsx` -- Defensive `getIframeOrigin`

Update `getIframeOrigin` to skip any localhost origins (belt-and-suspenders in case the proxy normalization is bypassed or cached):

```text
function getIframeOrigin(config: ShellConfig): string {
  const pmo = (config.iframe as any).postMessageOrigin;
  if (pmo && !pmo.startsWith("http://localhost")) return pmo;
  if (config.iframe.origin && !config.iframe.origin.startsWith("http://localhost"))
    return config.iframe.origin;
  return new URL(config.iframe.url).origin;
}
```

## Why This Fixes Everything

- All `postToIframe` calls will now target `https://dev-beta.aigentz.me` instead of `http://localhost:3000`
- The iframe will receive `MENU_ACTION`, `PROMPT_SUBMIT`, `SELECTOR_CHANGE`, `SHELL_READY`, `HANDOFF`, and `DEVICE_CONTEXT_UPDATE` messages
- No other code changes are needed -- the message construction logic from previous fixes is correct; the messages were just being sent to the wrong origin

## Technical Details

- The proxy fix ensures all consumers of shell-config get a correct `postMessageOrigin`
- The client-side fix ensures resilience even if a cached or stale config leaks through
- Both fixes are backward-compatible: if the upstream API starts returning the correct origin, the normalization is a no-op

