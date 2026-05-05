# Shell Domain → Platform Env Contract

Shell domains are **persistent doorways** to platform tiers. They never change targets.

| Shell domain          | Platform env | Iframe host                  | AA-API                                  |
|-----------------------|--------------|------------------------------|-----------------------------------------|
| `metame.dev`          | dev          | `dev-beta.aigentz.me`        | `aa.dev-beta.aigentz.me` → Railway      |
| `runtime.metame.com`  | staging      | `staging-beta.aigentz.me`    | Railway                                 |
| `metame.live`         | production   | `beta.aigentz.me`            | Railway                                 |
| `*.lovable.app`, `localhost` | dev   | `dev-beta.aigentz.me`        | `aa.dev-beta.aigentz.me` → Railway      |

## Promotion flow (decoupled from shell deploys)

The shell production build always deploys first to `metame.dev` (dev doorway).
Operators manually promote the same build to `runtime.metame.com` (staging) and then
`metame.live` (production) once each platform tier has been validated.

This means: **a shell deploy does not change which platform tier any user sees.**
Production users on `metame.live` keep hitting `beta.aigentz.me` regardless of what
just shipped to `metame.dev`.

## Resolution precedence (`src/lib/runtime-env.ts`)

1. `?env=` query param (persisted to `localStorage`)
2. `localStorage["mm_runtime_env"]` (set via DevDiagnostics override)
3. **Hostname** (the doorway — authoritative for end users)
4. `VITE_RUNTIME_ENV` build-time hint (fallback only)
5. Default `dev`

Hostname sits above `VITE_RUNTIME_ENV` so the same build artifact behaves
correctly across all three doorways without per-domain rebuilds.
