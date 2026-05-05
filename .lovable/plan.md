## Goal

Map the shell to **dev / staging / production** versions of the metaMe platform (iframe host + AA-API base) without code edits per deploy, with a runtime override for QA.

## Confirmed environment matrix

| Env        | Iframe / App host              | AA-API primary                      | AA-API fallback                                  | Shell domain          |
|------------|--------------------------------|-------------------------------------|--------------------------------------------------|-----------------------|
| dev        | `dev-beta.aigentz.me`          | `https://aa.dev-beta.aigentz.me/aa/v1` | `https://aigentzbeta-production.up.railway.app/aa/v1` | `metame.dev`          |
| staging    | `staging-beta.aigentz.me`      | Railway (no `aa.` subdomain yet)    | Railway                                           | `runtime.metame.com`  |
| production | `beta.aigentz.me`              | Railway (no `aa.` subdomain yet)    | Railway                                           | `metame.live`         |

Iframe URL pattern: `https://<host>/metame/runtime?embed=1&shell=thin` (preserves existing `/metame/runtime` path — required by LAUNCH_CARTRIDGE memory rule).

## Design

### 1. New env resolver — `src/lib/runtime-env.ts`
- `type RuntimeEnv = "dev" | "staging" | "production"`
- `ENV_CONFIG: Record<RuntimeEnv, { iframeHost, iframeUrl, iframeOrigin, aaPrimary, aaFallback }>` populated from the matrix above.
- `resolveEnv()` precedence:
  1. `?env=dev|staging|production` query param → persisted to `localStorage["mm_runtime_env"]`
  2. `localStorage["mm_runtime_env"]`
  3. `import.meta.env.VITE_RUNTIME_ENV`
  4. Hostname heuristic: `metame.live` → production; `runtime.metame.com` → staging; `metame.dev` / `*.lovable.app` previews → dev
  5. Default `dev`
- `getRuntimeEnvConfig()` returns the resolved bundle.

### 2. Frontend wiring
- `src/lib/embed-utils.ts` — replace hardcoded `EMBED_BASES_RAW` with `getRuntimeEnvConfig().iframeOrigin`.
- `src/components/RuntimeFrame.tsx` — replace inline `VITE_AIGENT_Z_AA_BASE || "https://aa.dev-beta..."` with resolver value.
- `src/lib/aa-client.ts` — `aaProxy()` adds `env` field to the body so the edge function knows which tier to hit.

### 3. Edge function — `supabase/functions/aa-proxy/index.ts`
- Replace constants with `BASES_BY_ENV`:
  ```ts
  const BASES_BY_ENV = {
    dev:        { primary: "https://aa.dev-beta.aigentz.me/aa/v1",        fallback: RAILWAY },
    staging:    { primary: RAILWAY,                                       fallback: RAILWAY },
    production: { primary: RAILWAY,                                       fallback: RAILWAY },
  };
  ```
- Pick by `body.env` (default `dev`).
- `DEFAULT_SHELL_CONFIG.iframe.url` built from same map per request.

### 4. Build-time selection
- Add `.env.development`, `.env.staging`, `.env.production` each setting `VITE_RUNTIME_ENV=...`.
- Lovable preview → dev; published custom domains carry their own `VITE_RUNTIME_ENV` via project env.

### 5. Runtime override + visibility
- `?env=staging` switches and persists for the browser.
- Add env switcher + indicator to `src/pages/DevDiagnostics.tsx`.
- Small corner badge ("DEV" / "STG") in `RuntimeHeader` when env ≠ production. Production: no badge.

### 6. Memory + docs
- New `mem://architecture/runtime-environments` describing the matrix, precedence, override.
- Update `mem://integration/launch-cartridge-contract` to note iframe host is env-resolved (path stays `/metame/runtime`).
- Append env matrix section to `docs/SHELL_CONTRACT.md`.

## Files touched

- New: `src/lib/runtime-env.ts`, `.env.development`, `.env.staging`, `.env.production`, `mem://architecture/runtime-environments`
- Edit: `src/lib/embed-utils.ts`, `src/lib/aa-client.ts`, `src/components/RuntimeFrame.tsx`, `src/components/RuntimeHeader.tsx`, `src/pages/DevDiagnostics.tsx`, `supabase/functions/aa-proxy/index.ts`, `docs/SHELL_CONTRACT.md`, `mem://index.md`, `mem://integration/launch-cartridge-contract`

Approve and I'll implement.
