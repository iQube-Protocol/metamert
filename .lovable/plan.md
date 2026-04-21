

# Fix: wrap `LAUNCH_CARTRIDGE` in a `payload` envelope + use canonical `-codex` IDs

## Root cause (confirmed by runtime owner)

The runtime's `MetaMeRuntimeClient.LAUNCH_CARTRIDGE` handler reads `msg.payload.cartridge_id`. Our shell sends it **flat** — `{ type: "LAUNCH_CARTRIDGE", cartridge_id, codex_id }` — so `payload` is `undefined`, the handler no-ops, and only the seed `PROMPT_SUBMIT` (which uses a different, flat shape the runtime accepts) runs. That matches exactly what you're seeing: intro prompt fires, cartridge never mounts.

The iframe URL (`https://dev-beta.aigentz.me/metame/runtime?embed=1&shell=thin`) is **already correct** — the runtime owner confirmed `dev-beta.aigentz.me` is the right domain and that the shell does NOT need to navigate the iframe. `MetaMeRuntimeClient` builds the cartridge embed URL internally from the `cartridge_id`. No proxy or env changes needed.

## Comparison to "what worked at the start of the day"

At the start of the day (message #666, before the agentiz detour), the contract documented in `mem://integration/shell-bridge-vocabulary` was already `LAUNCH_CARTRIDGE { cartridge_id, codex_id? }` — but the runtime owner's spec just clarified the envelope must be **nested under `payload`**. That's the one detail we never had right, which is why the cartridge launch never actually worked end-to-end (the optimistic header overlay made it *look* like it did).

## Fix

### 1. `src/contexts/ShellContext.tsx` — `launchCartridge()` body (lines 386–443)

Two changes:

**a. Wrap the LAUNCH_CARTRIDGE envelope in `payload`:**

```ts
postToIframe(iframeRef.current, {
  type: "LAUNCH_CARTRIDGE",
  payload: { cartridge_id: cartridgeId },
}, origin);
```

(Drop `codex_id` from the launch envelope — runtime derives it from the cartridge_id. Keep `codex_id` on the seed `PROMPT_SUBMIT` since that already works.)

**b. Update the `seedPrompts` map keys to the canonical `-codex` IDs:**

```ts
const seedPrompts: Record<string, string> = {
  "metame-codex": "Open the metaMe cartridge and orient me.",
  "qripto-codex": "Open the Qriptopian cartridge and show me what's available.",
  "knyt-codex":   "Open the KNYT cartridge and walk me through it.",
};
```

### 2. `src/lib/smart-menu-config.ts` — `DEFAULT_CARTRIDGES` IDs (lines 131–162)

Switch cartridge `id` fields to canonical `-codex` form so the IDs sent in the payload match what the runtime expects (and what's in the runtime's `data/codex-configs.ts`):

| label | `id` (was → now) | `default_codex_id` |
|---|---|---|
| metaMe | `metame` → `metame-codex` | `metame-codex` |
| Qriptopian | `qripto` → `qripto-codex` | `qripto-codex` |
| KNYT | `knyt-codex` → `knyt-codex` (unchanged) | `knyt-codex` |

The runtime accepts both forms (it strips `-codex`), so either works — using the canonical form keeps the shell, runtime config, and runtime owner's docs aligned.

### 3. `src/contexts/ShellContext.tsx` — initial `cartridgeState` default

Update the `activeCartridgeId` default (currently `"qripto"`) to `"qripto-codex"` so it matches the new canonical IDs.

## What stays the same

- `supabase/functions/aa-proxy/index.ts` — iframe URL (`dev-beta.aigentz.me/metame/runtime?embed=1&shell=thin`) is already correct. **No proxy changes.**
- `src/lib/shell-messages.ts` — `LAUNCH_CARTRIDGE` type already declared.
- `RuntimeHeader.tsx` — header floppy + ✕ overlay logic unchanged.
- `CARTRIDGE_OVERLAY_ACTIVE` / `CARTRIDGE_OVERLAY_CLOSE` listener wiring unchanged.
- The header lightning bolt color — still driven by `runtimeContext`, fully decoupled from cartridge launching.
- All seed-prompt behavior, optimistic overlay, 4s trust/reliability pulse — unchanged.

## Files touched

- `src/contexts/ShellContext.tsx` — wrap `LAUNCH_CARTRIDGE` payload, update seed prompt keys, update default `activeCartridgeId`.
- `src/lib/smart-menu-config.ts` — switch cartridge IDs to canonical `-codex` form.

## Result

| Cartridge link | Before | After |
|---|---|---|
| metaMe | Seed prompt runs, no overlay | `metame-codex` overlay mounts via runtime |
| Qriptopian | Seed prompt runs, no overlay | `qripto-codex` overlay mounts via runtime |
| KNYT | Seed prompt runs, no overlay | `knyt-codex` overlay mounts via runtime |

Header floppy + ✕ continues to appear immediately on click (optimistic), then confirmed by `CARTRIDGE_OVERLAY_ACTIVE`.

