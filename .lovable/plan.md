## Why the tour cards don't open anything

The tour dispatches `MENU_ACTION` envelopes with the new `deep_link` payload (correctly — console logs confirm they are sent to `dev-beta.aigentz.me`). But the runtime opens the Wallet/Persona drawers via **dedicated envelopes**, not `MENU_ACTION`:

- Persona drawer → `OPEN_PERSONA_IQUBE { iqube_type }`
- Identity / Sign-in drawer → `OPEN_IDENTITY_IQUBE`

The `deep_link` contract from Claude's spec is **new and not yet wired on the runtime side**. Until the runtime team ships its half of the deep-link handler, sending `MENU_ACTION { action_id: "wallet", deep_link: {...} }` is a no-op on the iframe. That's why the tour cards fire messages but nothing opens.

The shell already has working primitives (`openPersonaIQube`, `openIdentityIQube`) used by the live menus today. The tour should call those, and *also* keep emitting the `deep_link` MENU_ACTION so it lights up automatically once the runtime adds support.

Separately, several "tell" steps (Smart Menu, Cartridges, Co-pilot prompt, Your persona) only point at a target but never open the thing they're describing — so the user sees a tooltip on an empty menu.

## Plan

### 1. Fix tour actions (open drawers + submenus for real)

Edit `src/components/tour/VisitorTour.tsx` to drive shell state directly via `useShell()` instead of relying solely on the deep-link envelope:

| Step | New behavior |
|---|---|
| 2 — Smart Menu | call `activateMode("earn")` (or similar) on step enter so the Earn submenu is visible behind the card |
| 3 — Cartridges | no shell-side open available; leave as informational (the indicator is already in the header) |
| 4 — Co-pilot prompt | call `activateMode(currentMode)` to surface the prompt bar |
| 5 — Your persona | call `setSubmenuType("persona")` so the Qripto/KNYT/+ pills are visible |
| 6 — Create persona | call `openPersonaIQube("qripto")` (opens the drawer today) **and** still emit the `persona` + `create-wizard` deep-link so the runtime can route to the wizard once support lands |
| 7 — Sign in | call `openIdentityIQube()` **and** still emit the `wallet` + `signin` deep-link |

Add a small "step enter" hook using `EVENTS.STEP_BEFORE` so the side-effect fires before the tooltip renders.

Add the relevant context methods (`activateMode`, `setSubmenuType`, `openPersonaIQube`, `openIdentityIQube`) to the `useShell()` destructure in `VisitorTour`.

When tour finishes/skips, call `deactivateMode()` and `setSubmenuType(null)` to clean up.

### 2. Lighter, translucent tour card styling

Replace the current Joyride `options` block (note: it's actually `styles`, not `options` — the current `options` prop is being ignored, which is part of why the cards look like the default dark theme) with a proper `styles` config:

```ts
styles={{
  options: {
    primaryColor: "hsl(var(--primary))",
    textColor: "hsl(var(--foreground))",
    backgroundColor: "hsl(var(--background) / 0.72)",
    arrowColor: "hsl(var(--background) / 0.72)",
    overlayColor: "hsla(0, 0%, 0%, 0.35)", // lighter, more translucent
    zIndex: 10000,
  },
  tooltip: {
    backdropFilter: "blur(14px) saturate(140%)",
    background: "hsl(var(--card) / 0.78)",
    border: "1px solid hsl(var(--border) / 0.6)",
    borderRadius: "var(--mm-radius-md)",
    boxShadow: "var(--mm-shadow-panel)",
    color: "hsl(var(--foreground))",
  },
  tooltipTitle: { color: "hsl(var(--foreground))" },
  tooltipContent: { color: "hsl(var(--foreground) / 0.85)" },
  buttonNext: { background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" },
  buttonBack: { color: "hsl(var(--foreground) / 0.7)" },
  buttonSkip: { color: "hsl(var(--foreground) / 0.6)" },
}}
```

Uses semantic tokens (per design system) — no raw hex/rgb. Works in both light and dark themes because everything is HSL with alpha on top of theme-driven `--background` / `--card`.

### 3. No coordination needed for this step

This fix is entirely shell-side. The deep-link MENU_ACTION envelopes already match Claude's spec and stay in place — they'll start working "for free" once the runtime team ships their half. The Claude loop can continue in parallel; nothing about this change blocks them.

## Files touched

- `src/components/tour/VisitorTour.tsx` — rewire step side-effects + replace `options` prop with `styles`

No other files change.
