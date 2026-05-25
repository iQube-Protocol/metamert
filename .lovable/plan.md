# Update aa-proxy fallback to match aigentMe trinity

Railway upstream is back up; while it was down, the shell exposed a stale `Aigent Z / Q / M` list with red trust scores. The platform has renamed the user-facing agent to **aigentMe** (canonical id `aigent-me`, with `aigent-z` / `aigent-c` as aliases) and added Kn0w1, MoneyPenny, Nakamoto, Marketa. We need the fallback in `supabase/functions/aa-proxy/index.ts` to mirror the real upstream list so a future outage degrades gracefully instead of showing the old labels in alarming red.

## Changes

### 1. `supabase/functions/aa-proxy/index.ts` — `DEFAULT_SHELL_CONFIG`

**Replace the agent selector** options + default:

```ts
selectors: {
  aigent: {
    current: "aigent-me",
    options: [
      { id: "aigent-me",        label: "aigentMe",   icon: "user",   color: "#3b82f6", tooltip: "Your personal aigentMe — draws from your metaMe cartridge" },
      { id: "aigent-kn0w1",     label: "Kn0w1",      icon: "brain",  color: "#a855f7", tooltip: "Knowledge agent" },
      { id: "aigent-moneypenny",label: "MoneyPenny", icon: "coins",  color: "#22c55e", tooltip: "Payments & treasury agent" },
      { id: "aigent-nakamoto",  label: "Nakamoto",   icon: "shield", color: "#f59e0b", tooltip: "Crypto / chain agent" },
      { id: "aigent-marketa",   label: "Marketa",    icon: "store",  color: "#ec4899", tooltip: "Market & growth agent" },
    ],
  },
  llm: { /* unchanged */ },
},
```

**Replace the trust block** with healthier defaults so the fallback no longer renders red:

```ts
trust: {
  level: "warning",
  signals: [
    { key: "trust",       label: "Trust 7.2/10",       state: "warn" },
    { key: "reliability", label: "Reliability 7.0/10", state: "warn" },
  ],
  scores: { trust: 7.2, reliability: 7.0 },
},
```

(Note: existing `trust.signals` were `string[]`; the new shape uses objects with `key/label/state`. The `normalizeShellConfig` step already coerces signal objects to strings for downstream consumers — leave that normalisation intact; it only runs on upstream payloads, not on the fallback we return directly. If the shell's `ShellConfig` type strictly requires `string[]`, fall back to `["Trust 7.2/10", "Reliability 7.0/10"]` instead.)

### 2. No other files

- `aigent-z` → `aigent-me` aliasing is handled server-side. Persisted user selection logic stays as-is.
- Chat body (`aigentId`, `personaId`) is unchanged — `personaId` is already forwarded via the `x-persona-id` work from the previous loop.
- Provider score table, persona persistence, header tinting — untouched.

## Verification

1. Force the fallback path (temporarily point `RAILWAY` to a bad host, or just read the response shape) and confirm the shell renders **aigentMe** in slot 1 with amber/warn trust pills, not red.
2. Revert the probe, hit the real upstream, and confirm normalised upstream values still pass through unchanged (the change only touches `DEFAULT_SHELL_CONFIG`, not the upstream branch).
3. Run `src/test/persona-flow.test.ts` to make sure the canonical id map and persona-pill behaviour are unaffected.

## Risks

- If the shell's `ShellConfig` TypeScript type narrows `trust.signals` to `string[]`, the object-form signals will fail to typecheck on the fallback path. Mitigation: use the `string[]` form shown above as a fallback.
- The new agent ids (`aigent-kn0w1`, etc.) must match what the runtime iframe expects in `SELECTOR_CHANGE` envelopes — confirmed against the handoff note, but worth a quick smoke test after deploy.
