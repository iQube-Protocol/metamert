## Goal

Replace the static **Be** label under the SmartMenu Be icon with the user's active persona handle, sourced from the platform's `GET /api/wallet/active-persona` endpoint per the v1 Active Persona Integration Contract. Fall back to `Be` when the user is unauthenticated, the endpoint 401s, or no handle is resolvable.

## Render rule

```
label = surface.displayLabel ?? surface.ownFioHandle ?? "Be"
```

(The contract suggests `(persona)` as anonymous fallback — we explicitly use `Be` to preserve current UX.)

## Architecture

The shell never calls `dev-beta.aigentz.me` directly from the browser (CSP + custom-domain origin issues + project rule "all external comms via edge functions"). We add a new **`active-persona`** action to the existing `aa-proxy` edge function that proxies the contract endpoint and forwards the bearer token.

```text
SmartMenu (Be label)
   ↑ personaState.activeHandle
ShellContext.fetchActivePersona()
   ↓ supabase.functions.invoke("aa-proxy", { action: "active-persona", token, env })
aa-proxy (Deno)
   ↓ GET https://{iframeOrigin}/api/wallet/active-persona  Authorization: Bearer <token>
Platform → ActivePersonaSurface JSON | 401
```

## Steps

### 1. Edge function — `supabase/functions/aa-proxy/index.ts`
- Add a new `active-persona` action.
- Builds URL from the env-resolved iframe origin: `${BASES_BY_ENV[env].iframeOrigin}/api/wallet/active-persona`.
- Forwards `Authorization: Bearer <token>` if present.
- On 200: returns the surface JSON unchanged.
- On 401 / network error: returns `{ unauthenticated: true }` with HTTP 200 so the shell handles it cleanly.
- Strips `personaSessionToken` before returning to the browser (defence-in-depth — the shell never needs it).

### 2. AA client — `src/lib/aa-client.ts`
- Add `ActivePersonaSurface` type matching the contract (minus `personaSessionToken`).
- Add `fetchActivePersona(): Promise<ActivePersonaSurface | null>` that invokes the proxy with the `cachedToken` and current env. Returns `null` on `unauthenticated` or any error.

### 3. Shell context — `src/contexts/ShellContext.tsx`
- Extend `PersonaState` (in `src/lib/smart-menu-config.ts`) with optional `activeHandle?: string`.
- After hydrate (and whenever a token becomes available), call `fetchActivePersona()` and set `personaState.activeHandle = surface.displayLabel ?? surface.ownFioHandle ?? undefined`.
- **Persona-change listener**: extend the existing `aa-persona-change-v1` handler so that *in addition to* its current id-mirroring, it triggers `fetchActivePersona()` and updates `activeHandle`. Keep the existing origin filter; do NOT use `personaId` from the payload as anything other than a refetch trigger (per contract §5).
- Schedule a refresh `(sessionExpiresAt - 60s)` using `setTimeout` (cleared on unmount / re-fetch).

### 4. SmartMenu — `src/components/SmartMenu.tsx`
- In `NavButton`, when `item.id === "be"`, render the dynamic label:
  ```tsx
  const beLabel = personaState.activeHandle ?? "Be";
  ```
  Pass it down (or compute locally via `useShell()`).
- Add `truncate max-w-[3.75rem]` to the label `<span>` so longer handles like `aigentz@aigent` don't break layout. Title attribute carries the full handle for hover.

### 5. Memory
- Update `mem://features/persona-system` to record the Be-label binding.
- Add `mem://integration/active-persona-surface` describing the v1 contract, endpoint, render fallback chain, and the proxy action.

## Privacy & safety

- Proxy strips `personaSessionToken` before returning to the browser.
- Shell never persists `ownFioHandle` beyond React state.
- Event-origin check on `aa-persona-change-v1` continues to pin to the env-resolved iframe origin.
- `personaId` from the postMessage envelope is treated as a refetch trigger only; it is not stored or rendered.

## Out of scope

- Identifiability tone/colour on the Be icon (contract §1 fallback chain mentions it; we keep current accent rules and can layer this in later).
- Auth provisioning of a Supabase JWT to the shell — we forward whatever bearer we have; if none, label stays `Be`.

## Files touched

- `supabase/functions/aa-proxy/index.ts`
- `src/lib/aa-client.ts`
- `src/lib/smart-menu-config.ts`
- `src/contexts/ShellContext.tsx`
- `src/components/SmartMenu.tsx`
- `mem://features/persona-system`, `mem://integration/active-persona-surface`, `mem://index.md`
