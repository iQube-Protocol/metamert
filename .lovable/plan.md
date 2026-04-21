

# Real fix: point the shell at the runtime that actually handles `LAUNCH_CARTRIDGE`

## Why nothing launches (the real cause)

The shell sends `LAUNCH_CARTRIDGE` correctly with the right cartridge IDs. The seed `PROMPT_SUBMIT` arrives and runs (which is why you see the metaMe / Qriptopian / KNYT intro replies). The launch message itself is fine.

The problem: **the iframe loaded by the shell isn't the runtime that handles `LAUNCH_CARTRIDGE`.**

The shell is currently loading the legacy URL:

```
https://dev-beta.aigentz.me/metame/runtime?embed=1&shell=thin
```

(hardcoded as the default + normalized into in `supabase/functions/aa-proxy/index.ts` lines 150 and 197–206)

But you told me in your last message that the runtime that owns `LAUNCH_CARTRIDGE` (the one with `MetaMeRuntimeClient` + the z-axis cartridge overlay + the `CARTRIDGE_OVERLAY_ACTIVE` reply) lives at:

```
https://agentiz.com/triad/embed/codex/<slug>?theme=dark&closable=0
```

The legacy `/metame/runtime` page does not implement `LAUNCH_CARTRIDGE`. It silently drops it (same way it logs `Unknown message type: RESET_BLANK_CHECK` for other unknown types). It DOES implement `PROMPT_SUBMIT`, which is why the seed prompts visibly run while no cartridge ever mounts. That exactly matches what you're seeing.

This is also why "it was working before" — earlier the runtime page being loaded did include the cartridge launcher code path. The agentiz-triad migration moved that handler to the new embed route, and the shell config never got repointed.

## Fix

Repoint the iframe to the agentiz triad embed in `supabase/functions/aa-proxy/index.ts`.

### 1. Replace the default iframe URL

In the `DEFAULT_SHELL_CONFIG` block (line 149–153):

- `url`: `https://agentiz.com/triad/embed/codex/metame?theme=dark&closable=0&embed=1&shell=thin`
- `origin`: `https://agentiz.com`
- (`handoff_token` left as is)

### 2. Replace the localhost-fallback assignment

Line 195 currently rewrites broken upstream iframe URLs to the legacy URL. Change that fallback to the same agentiz triad embed URL so any upstream config that returns a localhost / missing URL also gets the new runtime.

### 3. Update the path-normalization block (lines 197–206)

The existing block assumes the legacy `/metame/runtime` shape. Replace it with one that:

- If the upstream URL has host `dev-beta.aigentz.me` AND path `/metame/runtime` (or `/`, or `/runtime`) → rewrite host to `agentiz.com` and path to `/triad/embed/codex/metame`.
- Always ensure `theme=dark`, `closable=0`, `embed=1`, `shell=thin` query params are set (preserve any existing `tab=` param the upstream sends).
- Leave URLs that are already on `agentiz.com/triad/embed/codex/...` untouched apart from ensuring those query params.

### 4. Re-derive origin & postMessageOrigin

Existing lines 217–224 already derive origin from the URL — they will pick up `https://agentiz.com` automatically once the URL changes. No structural change needed there.

### What this changes for the shell

Nothing. `launchCartridge()` in `src/contexts/ShellContext.tsx` already sends the canonical `LAUNCH_CARTRIDGE { cartridge_id, codex_id }` envelope with the IDs you specified (`metame`, `qripto`, `knyt-codex`) plus the seed `PROMPT_SUBMIT`. The optimistic header overlay (floppy + ✕), the 4s trust/reliability pulse, and all local cartridge state already work. They just need a runtime on the other side that actually handles `LAUNCH_CARTRIDGE`.

The agentiz triad runtime will receive `LAUNCH_CARTRIDGE`, mount the z-axis cartridge overlay against the right codex slug, and reply with `CARTRIDGE_OVERLAY_ACTIVE` — which the shell already listens for in `ShellContext.tsx` (lines 621–629) to keep the header overlay in sync.

## Result

| Cartridge link | Before (legacy iframe) | After (agentiz triad iframe) |
|---|---|---|
| metaMe | Seed prompt runs, no overlay | metaMe codex overlay mounts |
| Qriptopian | Seed prompt runs, no overlay | qripto codex overlay mounts |
| KNYT | Seed prompt runs, no overlay | knyt-codex overlay mounts |

Header floppy + ✕ continues to appear immediately on click via the existing optimistic path, and is then confirmed by the runtime's `CARTRIDGE_OVERLAY_ACTIVE` reply.

## Files touched

- `supabase/functions/aa-proxy/index.ts` — change default iframe URL/origin and the path-normalization block to target `https://agentiz.com/triad/embed/codex/<slug>`.

## Files NOT touched

- `src/contexts/ShellContext.tsx` — `launchCartridge` is already correct.
- `src/lib/smart-menu-config.ts` — cartridge IDs are already aligned with the runtime spec (`metame`, `qripto`, `knyt-codex`).
- `src/lib/shell-messages.ts` — `LAUNCH_CARTRIDGE` already typed.
- `src/components/SmartMenuSubmenu.tsx` — already routes through `selectCartridge` → `launchCartridge`.

## One open decision

The default URL above uses `metame` as the path slug (the metaMe cartridge embed). When the user picks Qriptopian or KNYT from the menu, the shell does not navigate the iframe — it sends `LAUNCH_CARTRIDGE`, and the runtime swaps the codex overlay internally. So the iframe path slug only matters for the *initial* page load. Defaulting it to `metame` keeps the boot experience consistent with the current "metaMe Runtime" branding.

If you'd rather the iframe boot directly into a different default (e.g. KNYT), say which one and that becomes the default slug in the URL above. Otherwise we proceed with `metame` as the boot slug.

