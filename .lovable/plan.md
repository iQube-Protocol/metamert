

# Browser Surface Host — Lovable Shell Implementation Plan

## Summary

Implement the shell-side Browser Surface Host: a visual container that mounts/unmounts a remote browser Live View iframe above the runtime, controlled entirely by runtime events. The shell owns only rendering, layering, and user interaction relay — zero browser logic.

## Architecture

```text
ShellRoot (Index.tsx)
  RuntimeHeader
  OverlayLayer (relative flex-1)
    RuntimeFrame (existing iframe)
    BrowserSurfaceHost (new — conditional overlay)
      BrowserSurfaceChrome (close/minimize/expand controls + badges)
      BrowserLiveViewFrame (provider iframe — url from mount payload)
      BrowserStatusRail (agent step label during agent_active)
      BrowserTakeoverBanner (during human_takeover)
    BrowserMinimizedPill (when minimized — floating pill at bottom)
  SmartMenu
    BrowserLaunchEntry (new menu item triggering browser.open.request)
```

## Implementation Slices

### Slice 1 — Types, State, and Bridge Events

**New file: `src/lib/browser-types.ts`**
- TypeScript types for `BrowserMountPayload`, `BrowserSurfaceState`, `BrowserStepState`, `BrowserBadgeState`, `SurfaceBounds`
- Shell-to-runtime event types (`browser.open.request`, `browser.close.request`, etc.)
- Runtime-to-shell event types (`browser.mount`, `browser.unmount`, etc.)
- Browser surface UI state enum: `collapsed | mounting | mounted | agent_active | human_takeover | minimized | docked | error`

**Update: `src/lib/shell-messages.ts`**
- Add `browser.*` types to `ShellOutbound` union
- Add `browser.*` types to `IframeInbound` union
- Extend `normalizeInbound` to handle `browser.` prefixed message types

**New file: `src/contexts/BrowserContext.tsx`**
- `BrowserProvider` managing:
  - `surfaceState`: the UI state enum
  - `mountPayload`: current `BrowserMountPayload | null`
  - `stepState`: current agent step info
  - `takeoverActive`: boolean
  - `badges`: runtime-provided badge state
  - `error`: error message if any
- Actions: `requestOpen`, `requestClose`, `requestMinimize`, `requestExpand`, `requestTakeover`, `requestResume`, `reportBounds`, `reportFocus`
- All actions post bridge events to runtime iframe via `postToIframe`
- Separate context from ShellContext to keep concerns isolated

**Update: `src/components/RuntimeFrame.tsx`**
- Add message handler cases for `browser.mount`, `browser.unmount`, `browser.surface.state`, `browser.step.update`, `browser.takeover.state`, `browser.badges.update`, `browser.error`
- Each case calls the corresponding BrowserContext dispatch

### Slice 2 — BrowserSurfaceHost + Chrome

**New file: `src/components/browser/BrowserSurfaceHost.tsx`**
- Renders when `surfaceState !== 'collapsed'`
- Overlay positioning: `absolute inset-0 z-50` above runtime iframe
- During `mounting`: shows a loading spinner
- During `mounted | agent_active | human_takeover`: renders `BrowserLiveViewFrame` + `BrowserSurfaceChrome`
- During `error`: shows error panel with retry/dismiss

**New file: `src/components/browser/BrowserSurfaceChrome.tsx`**
- Top bar with: close button, minimize button, expand/restore toggle, optional dock
- Mirrored badges from runtime: active Aigent label, trust mode pill, privacy mode pill, execution mode pill
- Optional domain/title labels from mount payload
- Focus indicator (border glow when focused)

**New file: `src/components/browser/BrowserLiveViewFrame.tsx`**
- Simple iframe rendering `mountPayload.liveView.url`
- Listens for `browserbase-disconnected` postMessage from the Live View iframe to trigger disconnect handling
- Reports focus/blur to BrowserContext

### Slice 3 — Status Rail + Takeover Banner

**New file: `src/components/browser/BrowserStatusRail.tsx`**
- Shown during `agent_active` state
- Displays: current step label, actor label, status indicator (reading/extracting/navigating/waiting/paused)
- Takeover CTA button
- Light animation on step changes

**New file: `src/components/browser/BrowserTakeoverBanner.tsx`**
- Shown during `human_takeover` state
- Banner text: "You are driving"
- Resume button
- Always visible, suppresses status rail

**New file: `src/components/browser/BrowserMinimizedPill.tsx`**
- Shown when `surfaceState === 'minimized'`
- Fixed position pill at bottom of screen (above SmartMenu)
- Shows session domain/title, tap to restore
- Badge dot for active agent

### Slice 4 — Menu Integration + Responsive

**Update: `src/lib/smart-menu-config.ts`**
- Add a `browser` quick action entry to relevant modes (or as a standalone launch affordance)

**New file: `src/components/browser/BrowserLaunchEntry.tsx`**
- Menu entry component that calls `browserContext.requestOpen()`
- Can be placed in SmartMenu submenu or as a dedicated nav affordance

**Update: `src/pages/Index.tsx`**
- Wrap with `BrowserProvider`
- Add `BrowserSurfaceHost` in the overlay layer
- Add `BrowserMinimizedPill` 

**Responsive behavior:**
- Portrait/mobile: full-width overlay sheet, near full-height, minimize to bottom pill
- Landscape/tablet: support docked right/bottom
- Desktop: floating overlay or docked pane

### Slice 5 — Error Handling + Polish

- Mount failure: inline error panel with retry + dismiss
- Live View disconnect: detect `browserbase-disconnected` message, show reconnect banner or clean close
- Runtime `browser.error`: friendly message, preserve close/minimize
- Debounce `browser.surface.bounds.changed` events
- Ignore stale events for non-active session IDs
- Prevent duplicate mounts

## Key Design Decisions

1. **Separate BrowserContext** — keeps browser state isolated from ShellContext; avoids bloating the already large shell provider
2. **Bridge events use existing `postToIframe`** — browser events flow through the same runtime iframe channel, wrapped in the standard bridge envelope
3. **No browser logic in shell** — shell never calls Browserbase, never decides navigation, never stores history
4. **Mount payload is the rendering contract** — shell renders exactly what runtime tells it to render via `BrowserMountPayload`

## Files Created/Modified

| Action | File |
|--------|------|
| Create | `src/lib/browser-types.ts` |
| Create | `src/contexts/BrowserContext.tsx` |
| Create | `src/components/browser/BrowserSurfaceHost.tsx` |
| Create | `src/components/browser/BrowserSurfaceChrome.tsx` |
| Create | `src/components/browser/BrowserLiveViewFrame.tsx` |
| Create | `src/components/browser/BrowserStatusRail.tsx` |
| Create | `src/components/browser/BrowserTakeoverBanner.tsx` |
| Create | `src/components/browser/BrowserMinimizedPill.tsx` |
| Create | `src/components/browser/BrowserLaunchEntry.tsx` |
| Modify | `src/lib/shell-messages.ts` |
| Modify | `src/components/RuntimeFrame.tsx` |
| Modify | `src/contexts/ShellContext.tsx` (minimal — expose iframeRef to BrowserContext) |
| Modify | `src/pages/Index.tsx` |
| Modify | `src/lib/smart-menu-config.ts` |

## Suggested Build Order

**Sprint 1**: Slices 1 + 2 (types, context, surface host, chrome, basic mount/unmount)
**Sprint 2**: Slice 3 (status rail, takeover banner, minimized pill)
**Sprint 3**: Slices 4 + 5 (menu integration, responsive, error handling, polish)

