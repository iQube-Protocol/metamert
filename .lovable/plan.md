## Why KNYT is loading as the default

Two things are going on, and the instructions you pasted are for a different repo than this one.

1. **The instructions target the Next.js platform repo, not this Lovable thin client.**
   The file path in those instructions — `apps/metame-runtime-shell/app/page.tsx` — does not exist here. This Lovable project is a Vite/React thin client whose equivalent state lives in `src/contexts/ShellContext.tsx`. In this repo the initial value is already `"metame"`:
   ```
   src/contexts/ShellContext.tsx:264
   const [runtimeContext, setRuntimeContextState] = useState<RuntimeContext>("metame");
   ```
   So nothing in this codebase is hardcoded to KNYT.

2. **The KNYT default you're seeing is being pushed in by the iframe runtime.**
   The runtime now reads `GET https://dev-beta.aigentz.me/api/runtime/settings/context` on mount and, when it resolves to `"knyt"`, broadcasts `RUNTIME_LEAD_CHANGE` to the shell. The shell already honors that and flips `runtimeContext` (see `applyRuntimeContextFromRuntime`, `ShellContext.tsx:509-519`, log line `[Shell] RUNTIME_LEAD_CHANGE → applying runtimeContext: knyt`).
   In other words: the platform's shared server-side setting is currently `"knyt"`, so every surface that reads it — including this shell, via the iframe — comes up KNYT.

Also worth flagging: the instructions literally say to change the Next.js default from `useState<...>("metame")` to `useState<...>("knyt")`. If those were applied verbatim, that alone would make KNYT the new default in the platform shell — independent of the server fetch.

## What to do

Pick one — I'll implement whichever you want when you switch me to build mode.

### Option A — Flip the server setting back to metaMe (no code change)
Fastest fix. From the platform admin tab (or via curl) set the singleton to `metame`:
```
PUT https://dev-beta.aigentz.me/api/runtime/settings/context
{ "context": "metame" }
```
Reload — the iframe will read `metame`, no `RUNTIME_LEAD_CHANGE` fires, shell stays on its own `"metame"` default.

### Option B — Make this thin client a first-class participant in the server-persisted toggle
Mirror the behavior the instructions describe for the Next.js shell, adapted to this codebase:

1. In `ShellContext.tsx`, on provider mount, `fetch` `GET https://dev-beta.aigentz.me/api/runtime/settings/context` and seed `runtimeContextState` from the response (only overrides the `"metame"` default if the server returns a valid value). Uses a cancel flag like the snippet you pasted.
2. In `setRuntimeContext` (line 496), after the existing `sendRuntimeMessage("RUNTIME_CONTEXT_CHANGE", …)`, fire `PUT https://dev-beta.aigentz.me/api/runtime/settings/context` with `{ context: next }` (fire-and-forget, swallow errors — matches the platform contract: no auth, cross-origin OK).
3. Do **not** call PUT from `applyRuntimeContextFromRuntime` — that path is the iframe telling us its already-persisted state; echoing PUT would race.
4. Extract the base URL to an env var: add `VITE_PLATFORM_BASE_URL` (defaulting to `https://dev-beta.aigentz.me`) and read it via `import.meta.env.VITE_PLATFORM_BASE_URL`. Add the var to `.env`, `.env.development`, `.env.staging`, `.env.production`.
5. No changes to `RuntimeHeader.tsx` or `SmartMenu.tsx` — they already call `setRuntimeContext`, which becomes the single write path.

### Option C — Both
Flip the server to `metame` now (Option A) so the current session looks right, and also wire the shell to the endpoint (Option B) so future toggles from this surface persist back.

## Technical notes

- The CORS caveat in your instructions applies here too: this preview runs on `*.lovable.app` / `metame.live`, so the PUT to `dev-beta.aigentz.me` is cross-origin. If the platform route doesn't return permissive CORS headers, the PUT will fail silently in the browser console — we'd then need the platform side to add `Access-Control-Allow-Origin` for our shell origins. I'd verify in the browser network panel after wiring.
- `RuntimeContext` type already matches the endpoint's `'metame' | 'knyt'` contract, so no type changes needed.
- No changes to the iframe protocol (`RUNTIME_CONTEXT_CHANGE` / `RUNTIME_LEAD_CHANGE`) — the server endpoint sits alongside, not in place of, the existing message bus.

Which option do you want?
