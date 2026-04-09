

## metaMe Light Mode — Parchment Intelligence Shell Theme

### Alignment Status
Claude Code's brief confirms full alignment on tokens, ownership, and rules. Key additions from Claude's brief vs our original plan:
- **Glassmorphism DISABLED in light mode** — no `backdrop-blur` anywhere on shell surfaces. The current `glass-float` class must be replaced with opaque parchment surfaces.
- **`--mm-border-active`** added: `1px solid rgba(79, 140, 152, 0.28)` for active state borders.
- **Texture spec refined**: SVG fine grain at ~3% opacity + soft radial tonal cloud at ~4%.
- **Active prompt accent rule**: ONE restrained cue only (left-edge accent line OR inner ring OR wash). Never flood-fill.

### Execution — 4 phases, no animation changes

**Phase 1: Token Foundation** (2 files)

`src/index.css`:
- Add all `--mm-*` CSS custom properties under `:root`
- Remap existing shadcn variables to parchment values (e.g., `--background` → `216 30% 93%` mapped from `#F1EBDD`, `--foreground` → from `#2E2923`, `--card` → from `#F7F2E8`, `--border` → warm hairline)
- Add subtle parchment texture on `body` using CSS (fine-grain SVG noise at 3% + radial tonal cloud at 4%) — no heavy imagery
- Replace `.glass-float` with opaque parchment surface (no `backdrop-filter` in light mode): `background: var(--mm-surface-3)`, warm border, warm shadow

`tailwind.config.ts`:
- Add `mm` namespace: `mm.canvas.{base,variant,deep}`, `mm.surface.{1,2,3,4}`, `mm.ink.{primary,secondary,muted,faint,inverse}`, `mm.line.{subtle,soft,medium,strong}`, `mm.accent.{runtime,codex,make,earn,share,alert}`
- Add `borderRadius`: `mm-xs` (10px), `mm-sm` (14px), `mm-md` (18px), `mm-lg` (22px)
- Add `boxShadow`: `mm-low`, `mm-mid`, `mm-panel`

**Phase 2: Shell Surface Updates** (5 files)

`RuntimeHeader.tsx`:
- `bg-card` → `bg-mm-surface-1`
- `border-border` → `border-mm-line-subtle` (hairline)
- Trust dot container: `bg-muted/20` → `bg-mm-canvas-variant`
- `text-muted-foreground` → `text-mm-ink-muted`
- Popover backgrounds → `bg-mm-surface-2`
- Update `MODE_ACCENT` map to use `--mm-accent-*` values

`SmartMenu.tsx`:
- Nav bar: `bg-card` → `bg-mm-surface-1`, `border-t` → `border-mm-line-soft`
- Update `MODE_ACCENT` to parchment accent palette: `be → --mm-accent-share`, `earn → --mm-accent-earn`, `play → --mm-accent-runtime`, `make → --mm-accent-make`, `share → --mm-accent-share`
- Nav labels: `text-muted-foreground` → `text-mm-ink-muted`
- Radii: `rounded-md` → `rounded-mm-xs`

`SmartMenuPromptBar.tsx`:
- Bar: `bg-card` → `bg-mm-surface-2`
- `borderTop` accent stays (one restrained cue — matches Claude's rule)
- Input: `text-white` → `text-mm-ink-primary`
- Placeholder: → `text-mm-ink-muted`
- Controls: → `text-mm-ink-muted`

`SmartMenuSubmenu.tsx`:
- Replace all `glass-float` with `bg-mm-surface-3 border border-mm-line-soft shadow-mm-low` (opaque parchment, no blur)
- Edge fade gradients: `from-card/80` → `from-mm-surface-1/80`
- Quick action buttons: → `text-mm-ink-muted`
- Radii: `rounded-xl` → `rounded-mm-sm`
- CartridgePill: `rounded-lg` → `rounded-mm-xs`

`QuickLinksBar.tsx`:
- Replace `glass-float` with same opaque parchment surface treatment
- Hover: `hover:bg-accent` → `hover:bg-mm-canvas-variant`
- Labels: → `text-mm-ink-muted`

**Phase 3: Layout & Wrapper Continuity** (3 files)

`src/pages/Index.tsx`:
- Shell container: `bg-background` → `bg-mm-canvas-base`
- Loading state: match canvas

`src/components/RuntimeFrame.tsx`:
- Wrapper div background: ensure `bg-mm-canvas-base` so iframe boundary is invisible

`src/components/browser/BrowserSurfaceChrome.tsx`:
- Chrome bar: `bg-card` → `bg-mm-surface-1`, `border-border` → `border-mm-line-subtle`
- Badge text: → `text-mm-ink-secondary`

**Phase 4: QubeTalk Confirmation**

- Create `docs/qubetalk-bridge/outbox/lovable-metame-light-mode-alignment.json` confirming token adoption, listing files touched, and requesting runtime-side parity check

### Animation Backlog (NOT implemented now)
- Structure-first reveal sequencing
- Ease curves to `--mm-ease-standard` / `--mm-ease-soft`
- Duration alignment to `--mm-dur-*` tokens
- Replace `slide-in-from-bottom-2` with calmer reveal

### Files Touched Summary
| File | Change |
|------|--------|
| `src/index.css` | Token layer, texture, glass-float rework |
| `tailwind.config.ts` | Semantic mm namespace |
| `src/components/RuntimeHeader.tsx` | Parchment surfaces, ink colors |
| `src/components/SmartMenu.tsx` | Parchment nav rail, accent remap |
| `src/components/SmartMenuPromptBar.tsx` | Parchment prompt surface |
| `src/components/SmartMenuSubmenu.tsx` | Opaque parchment submenus |
| `src/components/QuickLinksBar.tsx` | Parchment quick links |
| `src/pages/Index.tsx` | Canvas base |
| `src/components/RuntimeFrame.tsx` | Wrapper continuity |
| `src/components/browser/BrowserSurfaceChrome.tsx` | Browser chrome |
| `docs/qubetalk-bridge/outbox/...` | Alignment confirmation |

