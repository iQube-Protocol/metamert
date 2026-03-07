/**
 * SmartMenuSubmenu — floating submenu layer above the prompt bar.
 * Cycles between: quickActions | cartridgeSelector | codexSelector
 * NEVER more than one floating layer (strict 2-layer rule).
 */
import { useRef, useCallback, useEffect } from "react";
import { useShell } from "@/contexts/ShellContext";
import { MODE_CONFIGS, type QuickActionDef } from "@/lib/smart-menu-config";
import { resolveIcon } from "@/lib/icon-utils";
import { SMART_MENU_ICON_DEFAULTS } from "@/lib/smart-menu-icons";
import { Check } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/** Resolve icon from smart menu defaults or lucide fallback */
function resolveSmartIcon(iconName?: string, id?: string): LucideIcon | undefined {
  const standard = resolveIcon(iconName, id);
  if (standard) return standard;
  if (id && SMART_MENU_ICON_DEFAULTS[id]) return SMART_MENU_ICON_DEFAULTS[id];
  return undefined;
}

export default function SmartMenuSubmenu() {
  const {
    activeMode,
    submenuType,
    setSubmenuType,
    handleMenuAction,
    resetIdleTimer,
    cartridgeState,
    selectCartridge,
    selectCodex,
  } = useShell();

  // All hooks above — conditional rendering below
  if (!activeMode || !submenuType) return null;

  if (submenuType === "cartridgeSelector") {
    return <CartridgeSelector />;
  }
  if (submenuType === "codexSelector") {
    return <CodexSelector />;
  }

  return <QuickActionsCarousel />;
}

// ---------------------------------------------------------------------------
// Quick Actions Carousel
// ---------------------------------------------------------------------------

function QuickActionsCarousel() {
  const {
    activeMode,
    handleMenuAction,
    setSubmenuType,
    pauseIdleTimer,
  } = useShell();
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!activeMode) return null;
  const modeConfig = MODE_CONFIGS[activeMode];
  const accent = modeConfig.accentHex;

  const handleAction = useCallback((action: QuickActionDef) => {
    pauseIdleTimer();

    if (action.id === "cartridge") {
      setSubmenuType("cartridgeSelector");
      return;
    }

    handleMenuAction(action.id);
  }, [handleMenuAction, setSubmenuType, pauseIdleTimer]);

  const foldIds = modeConfig.mobileVisibleFold;
  // Find the first fold item's index to auto-scroll there on mount
  const firstFoldIndex = modeConfig.quickActions.findIndex(a => foldIds.includes(a.id));

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || firstFoldIndex <= 0) return;
    // Each item has a fixed width; scroll so fold items are in view
    const itemWidth = el.scrollWidth / modeConfig.quickActions.length;
    el.scrollLeft = firstFoldIndex * itemWidth;
  }, [firstFoldIndex, modeConfig.quickActions.length]);

  return (
    <div
      className="glass-float relative rounded-xl shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-200"
      onPointerEnter={pauseIdleTimer}
    >
      <div
        ref={scrollRef}
        className="flex items-center overflow-x-auto px-0 py-1.5 scrollbar-hide"
        style={{ scrollSnapType: "x mandatory", scrollBehavior: "auto" }}
      >
        {modeConfig.quickActions.map((action) => {
          const Icon = resolveSmartIcon(action.icon, action.id);
          const isFocal = action.id === modeConfig.defaultCenteredQuickActionId;

          return (
            <button
              key={action.id}
              onClick={() => handleAction(action)}
              className="flex flex-col items-center justify-center gap-0.5 rounded-lg py-1.5 text-muted-foreground transition-all duration-150 hover:bg-accent hover:text-accent-foreground active:scale-95 shrink-0"
              style={{
                scrollSnapAlign: "center",
                width: "20%", // 5 items visible = 20% each
                ...(isFocal ? { color: accent } : {}),
              }}
              title={action.label}
            >
              {Icon ? (
                <Icon className="h-4 w-4" />
              ) : (
                <span className="text-xs font-medium">{action.label.charAt(0)}</span>
              )}
              <span className="text-[9px] leading-tight whitespace-nowrap">{action.label}</span>
            </button>
          );
        })}
      </div>
      {/* Edge fade indicators */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-card/80 to-transparent rounded-l-xl" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-4 bg-gradient-to-l from-card/80 to-transparent rounded-r-xl" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Cartridge Selector
// ---------------------------------------------------------------------------

function CartridgeSelector() {
  const { cartridgeState, selectCartridge, setSubmenuType, resetIdleTimer } = useShell();

  return (
    <div
      className="glass-float rounded-xl shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-200 p-2"
      onPointerEnter={() => resetIdleTimer("hover")}
    >
      <div className="flex items-center gap-1 mb-1.5 px-1">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Cartridge</span>
        <button
          onClick={() => setSubmenuType("quickActions")}
          className="ml-auto text-[10px] text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back
        </button>
      </div>
      <div className="flex gap-1.5">
        {cartridgeState.available.map(cart => {
          const isActive = cart.id === cartridgeState.activeCartridgeId;
          const Icon = resolveSmartIcon(cart.icon, cart.id);
          return (
            <button
              key={cart.id}
              onClick={() => selectCartridge(cart.id)}
              className={`flex flex-col items-center gap-1 rounded-lg px-3 py-2 text-xs transition-all duration-150 active:scale-95
                ${isActive ? "bg-primary/15 text-primary ring-1 ring-primary/30" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"}
              `}
            >
              <div className="flex items-center gap-1">
                {Icon && <Icon className="h-3.5 w-3.5" />}
                <span className="font-medium whitespace-nowrap">{cart.label}</span>
              </div>
              {isActive && <Check className="h-3 w-3" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Codex Selector (cartridge-scoped)
// ---------------------------------------------------------------------------

function CodexSelector() {
  const { cartridgeState, selectCodex, setSubmenuType, resetIdleTimer } = useShell();

  const activeCart = cartridgeState.available.find(c => c.id === cartridgeState.activeCartridgeId);
  const codexes = activeCart?.codexes ?? [];

  return (
    <div
      className="glass-float rounded-xl shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-200 p-2"
      onPointerEnter={() => resetIdleTimer("hover")}
    >
      <div className="flex items-center gap-1 mb-1.5 px-1">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Codex · {activeCart?.label ?? "—"}
        </span>
        <button
          onClick={() => setSubmenuType("quickActions")}
          className="ml-auto text-[10px] text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back
        </button>
      </div>
      <div className="flex gap-1.5">
        {codexes.map(cdx => {
          const isActive = cdx.id === cartridgeState.activeCodexId;
          return (
            <button
              key={cdx.id}
              onClick={() => selectCodex(cdx.id)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs transition-all duration-150 active:scale-95
                ${isActive ? "bg-primary/15 text-primary ring-1 ring-primary/30" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"}
              `}
            >
              <span className="font-medium whitespace-nowrap">{cdx.label}</span>
              {isActive && <Check className="h-3 w-3" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
