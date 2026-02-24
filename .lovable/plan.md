

# Fix iframe rendering: API response normalization

## Problems identified

There are three mismatches between what the upstream API returns and what the shell code expects:

### 1. `postMessageOrigin` not mapped to `origin`
The API returns `iframe.postMessageOrigin: "http://localhost:3000"` but `ShellConfig` expects `iframe.origin`. The normalizer in aa-proxy never maps this field, so `config.iframe.origin` is always `undefined`. This breaks the postMessage handshake origin filtering and means the EmbedFrame ignores origin checks entirely.

### 2. `handoff_token` is nested inside `bootstrap`, not at top level
The API returns `iframe.bootstrap.handoff_token: "rt_000..."` but the shell reads `config.iframe.handoff_token` (top level). So the HANDOFF message is never sent because `config.iframe.handoff_token` is always undefined.

### 3. Localhost `postMessageOrigin` not overridden
Even once mapped, the origin is `http://localhost:3000` which is wrong for production. The normalizer already fixes localhost in `iframe.url` but not in the origin/postMessageOrigin field.

## Solution

Update the `normalizeShellConfig` function in `supabase/functions/aa-proxy/index.ts` to handle these three cases:

### Changes to `supabase/functions/aa-proxy/index.ts`

Add three normalization steps to `normalizeShellConfig()`:

1. **Map `postMessageOrigin` to `origin`**: If `iframe.postMessageOrigin` exists, copy it to `iframe.origin` and delete the old key.

2. **Fix localhost origin**: If `iframe.origin` starts with `http://localhost`, replace it with the origin derived from `iframe.url` (e.g., `https://dev-beta.aigentz.me`).

3. **Hoist `bootstrap.handoff_token`**: If `iframe.bootstrap.handoff_token` exists and `iframe.handoff_token` does not, copy it up to `iframe.handoff_token`.

### Technical detail

```text
// In normalizeShellConfig(), add after the existing localhost URL fix:

// 7. Map postMessageOrigin -> origin
if (raw.iframe?.postMessageOrigin && !raw.iframe.origin)
  raw.iframe.origin = raw.iframe.postMessageOrigin;

// 8. Fix localhost origin
if (raw.iframe?.origin?.startsWith("http://localhost"))
  raw.iframe.origin = new URL(raw.iframe.url).origin;

// 9. Hoist bootstrap.handoff_token
if (raw.iframe?.bootstrap?.handoff_token && !raw.iframe.handoff_token)
  raw.iframe.handoff_token = raw.iframe.bootstrap.handoff_token;
```

### File changes

- **`supabase/functions/aa-proxy/index.ts`** -- Add the three normalization steps above inside the existing `normalizeShellConfig` function, after the existing step 5 (Fix localhost iframe URL).

No other files need to change. After deploying the updated edge function, the iframe will receive the correct origin for postMessage filtering and the handoff token for authentication.

## Note on CSP / X-Frame-Options

If after this fix the iframe still shows a blank page, it may be because the upstream server (`dev-beta.aigentz.me`) does not include the Lovable preview domains in its `frame-ancestors` CSP directive. That is a server-side configuration on the AigentiQ side, not something fixable in this shell. The EmbedFrame already handles this gracefully -- it will show the iframe content after a 5-second timeout even without a RUNTIME_READY handshake, and falls back to an "Open in New Tab" button if blocked.
