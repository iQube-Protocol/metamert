

# metaMe Smart Menu — Lovable Parity Artifacts

## Summary

Generate the complete file set as downloadable artifacts in `/mnt/documents/` so Claude Code can consume them directly in the Next.js runtime app. These files will bring the runtime's menu and header system into alignment with the thin client shell's SmartMenu patterns.

## What I Can and Cannot Do

**Can do:** Generate all the files listed in the brief as standalone TypeScript/TSX artifacts, using the thin client's proven patterns (token system, icon resolution, quick action configs, mode configs, prompt bar, carousel, selectors, glass-float styling).

**Cannot do:** Test these inside the Next.js app or verify integration with `MetaMeRuntimeClient.tsx` — that's Claude Code's domain.

## File Set to Generate

### 1. Type definitions (ground truth)
- `types/smartMenu.ts` — MenuItem, MenuSection, SmartMenuConfig, MenuState, MenuContext — aligned with thin client's `smart-menu-config.ts` patterns
- `types/smartDrawer.ts` — DrawerSet, Drawer, DrawerTab, DrawerSlot, DrawerSession, VisibilityRules
- `ui/smartLayout/types.ts` — DrawerSize (6 variants), MenuMode (4 modes), SmartMenuBehavior

### 2. Layout shell components
- `ui/smartLayout/SmartDrawerShell.tsx` — unified drawer container with 6 size variants, using `--mm-*` tokens
- `ui/smartLayout/SmartMenuRail.tsx` — vertical menu rail mirroring the thin client's nav buttons (Be/Make/Play/Earn/Share), mode accent colors, hover previews
- `ui/smartLayout/drawerStyles.ts` — CSS class generator per DrawerSize
- `ui/smartLayout/index.ts` — barrel export

### 3. Service layer
- `services/menu/menuService.ts` — visibility filtering, state management, drawer toggle logic
- `services/menu/fixtures/menuFixtures.ts` — metaKnyts / Qriptopian / MoneyPenny configs (derived from thin client's `DEFAULT_CARTRIDGES` and `MODE_CONFIGS`)
- `services/drawer/drawerService.ts` — CRUD, validation, session management
- `services/drawer/fixtures/drawerSetFixtures.ts` — 3 complete drawer configurations
- `services/drawer/visibilityEvaluator.ts` — persona/device/reputation filtering
- `services/drawer/slotDataResolver.ts` — content/wallet/DeFi data resolution stubs
- `services/drawer/cardVariantRegistry.ts` — card variant catalog
- `services/drawer/modalSelectionService.ts` — AI-driven variant selection stub
- `services/drawer/smartTriadAdapter.ts` — Smart Triad integration stub
- `services/drawer/index.ts` — barrel export

### 4. Drawer rendering components
- `components/drawer/SmartDrawerRenderer.tsx` — universal drawer renderer using `--mm-*` tokens, glass-float patterns
- `components/drawer/DrawerTabBar.tsx` — tab bar with icon mapping via `resolveIcon` pattern
- `components/drawer/SlotRenderer.tsx` — slot content renderer
- `components/drawer/AgentPanelRenderer.tsx` — copilot/agent panel per tab

### 5. Smart drawer editor (Studio)
- `components/smartDrawer/DrawerMenuList.tsx`
- `components/smartDrawer/DrawerDetailEditor.tsx`
- `components/smartDrawer/LivePreviewPanel.tsx`
- `components/smartDrawer/DynamicModeSelector.tsx`
- `components/smartDrawer/CopilotBar.tsx`
- `components/smartDrawer/ResizableLayout.tsx`

### 6. API routes
- `app/api/menu/route.ts` — GET menu config
- `app/api/drawer/resolve/route.ts` — POST visibility filter + slot resolution
- `app/api/drawer/sets/route.ts` — GET/POST drawer set CRUD
- `app/api/drawer/sets/[id]/route.ts`
- `app/api/drawer/variants/route.ts` — card variant registry
- `app/api/drawer/modal-select/route.ts` — AI variant selection
- `app/(shell)/copilot/actions/smartmenu.ts` — Phase 1 stubs

## Key Design Decisions

1. **Token alignment**: All components use `--mm-*` CSS custom properties from the thin client's token system
2. **Icon resolution**: Reuse the `resolveIcon()` pattern with the same DEFAULTS map
3. **Mode configs**: SmartMenuRail uses the same 5-mode system (Be/Make/Play/Earn/Share) with identical accent colors
4. **MENU_ACTION contract preserved**: `{ type: "MENU_ACTION", payload: { action_id?, item_id?, intent?, action? } }` — DRAWER_ACTION_HANDLERS keys "wallet" and "settings" untouched
5. **Quick action definitions**: Identical `QuickActionDef` shape with `kind`, `triggersInference`, `prompt`, `iframeAction`, `apiAction`
6. **Glass-float styling**: Submenu/drawer surfaces use the same backdrop-blur + surface tokens

## Output

All files written to `/mnt/documents/smart-menu-parity/` preserving the directory structure from the brief. A manifest file at the root will list all files with their purpose.

## Technical Notes

- Files are Next.js/React compatible (TSX with `"use client"` directives where needed)
- API routes use Next.js App Router conventions (`route.ts` with `GET`/`POST` exports)
- Service layer is framework-agnostic TypeScript
- Studio editor components are React client components

