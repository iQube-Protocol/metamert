/**
 * SmartMenuSubmenu — floating submenu layer above the prompt bar.
 * Cycles between: quickActions | cartridgeSelector | codexSelector
 * NEVER more than one floating layer (strict 2-layer rule).
 */
import { useState, useRef, useCallback, useEffect } from "react";
import { useShell } from "@/contexts/ShellContext";
import { MODE_CONFIGS, type QuickActionDef, type SmartMenuMode } from "@/lib/smart-menu-config";
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

interface SmartMenuSubmenuProps {
  /** When set, renders quick actions for this mode as a hover preview (no cartridge/codex selectors) */
  previewMode?: SmartMenuMode;
}

export default function SmartMenuSubmenu({ previewMode }: SmartMenuSubmenuProps = {}) {
  const {
    activeMode,
    submenuType,
    setSubmenuType,
    handleMenuAction,
    resetIdleTimer,
    cartridgeState,
    selectCartridge,
    selectCodex,
    personaState,
    selectPersona,
  } = useShell();

  // Hover preview mode: always show quick actions for the given mode
  if (previewMode) {
    return <QuickActionsCarousel overrideMode={previewMode} />;
  }

  // All hooks above — conditional rendering below
  if (!activeMode || !submenuType) return null;

  if (submenuType === "cartridgeSelector") {
    return <CartridgeSelector />;
  }
  if (submenuType === "codexSelector") {
    return <CodexSelector />;
  }
  if (submenuType === "personaSelector") {
    return <PersonaSelector />;
  }

  return <QuickActionsCarousel />;
}

// ---------------------------------------------------------------------------
// Quick Actions Carousel
// ---------------------------------------------------------------------------

function QuickActionsCarousel({ overrideMode }: { overrideMode?: SmartMenuMode } = {}) {
  const {
    activeMode,
    viewState,
    activateMode,
    handleMenuAction,
    submitPrompt,
    setSubmenuType,
    pauseIdleTimer,
  } = useShell();
  const scrollRef = useRef<HTMLDivElement>(null);

  const effectiveMode = overrideMode ?? activeMode;
  if (!effectiveMode) return null;
  const modeConfig = MODE_CONFIGS[effectiveMode];
  const accent = modeConfig.accentHex;

  const handleAction = useCallback((action: QuickActionDef) => {
    pauseIdleTimer();

    // If in hover preview, activate the mode first so prompt mode engages
    if (overrideMode && overrideMode !== activeMode) {
      activateMode(overrideMode);
    }

    if (action.id === "cartridge") {
      setSubmenuType("cartridgeSelector");
      return;
    }

    if (action.id === "persona") {
      setSubmenuType("personaSelector");
      return;
    }

    // Rich contextual prompt: send directly, then start 4s idle countdown
    if (action.prompt) {
      submitPrompt(action.prompt);
      resetIdleTimer("quickAction");
      return;
    }

    // Only transition to promptMode for non-prompt actions that need complex input
    if (viewState === "quickActionOnly" && action.triggersInference) {
      activateMode(effectiveMode);
    }

    handleMenuAction(action.id);
  }, [handleMenuAction, submitPrompt, setSubmenuType, pauseIdleTimer, overrideMode, activeMode, activateMode, viewState, effectiveMode]);

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
      className="glass-float relative rounded-xl shadow-lg animate-in fade-in slide-in-from-bottom-2"
      style={{ animationDuration: '350ms' }}
      onPointerEnter={pauseIdleTimer}
    >
      <div
        ref={scrollRef}
        className="flex items-center overflow-x-auto px-0 py-1.5 scrollbar-hide"
        style={{ scrollSnapType: "x mandatory", scrollBehavior: "auto" }}
      >
        {modeConfig.quickActions.map((action) => {
          const Icon = resolveSmartIcon(action.icon, action.id);
          return (
            <QuickActionButton
              key={action.id}
              action={action}
              accent={accent}
              Icon={Icon}
              onAction={handleAction}
            />
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
// Quick Action Button (grey passive, mode-accent on hover/active)
// ---------------------------------------------------------------------------

function QuickActionButton({
  action,
  accent,
  Icon,
  onAction,
}: {
  action: QuickActionDef;
  accent: string;
  Icon: LucideIcon | undefined;
  onAction: (a: QuickActionDef) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [activated, setActivated] = useState(false);
  const color = hovered || activated ? accent : undefined;

  const handleClick = () => {
    setActivated(true);
    onAction(action);
  };

  return (
    <button
      onClick={handleClick}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      className="flex flex-col items-center justify-center gap-0.5 rounded-lg py-1.5 text-muted-foreground transition-all duration-150 active:scale-95 shrink-0"
      style={{
        scrollSnapAlign: "center",
        width: "20%",
        ...(color ? { color } : {}),
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
}

// ---------------------------------------------------------------------------
// Cartridge Selector
// ---------------------------------------------------------------------------

function CartridgeSelector() {
  const { activeMode, cartridgeState, selectCartridge, setSubmenuType, pauseIdleTimer } = useShell();

  return (
    <div
      className="glass-float rounded-xl shadow-lg animate-in fade-in slide-in-from-bottom-2 p-2"
      style={{ animationDuration: '350ms' }}
      onPointerEnter={pauseIdleTimer}
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
      <div className="flex gap-1.5 justify-center">
        {cartridgeState.available.map(cart => {
          const isActive = cart.id === cartridgeState.activeCartridgeId;
          const Icon = resolveSmartIcon(cart.icon, cart.id);
          const cartAccent = cart.accentHex;
          return (
            <CartridgePill
              key={cart.id}
              isActive={isActive}
              accent={cartAccent}
              onClick={() => selectCartridge(cart.id)}
            >
              <div className="flex items-center gap-1">
                {Icon && <Icon className="h-3.5 w-3.5" />}
                <span className="font-medium whitespace-nowrap">{cart.label}</span>
                {isActive && <Check className="h-3 w-3" />}
              </div>
            </CartridgePill>
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
  const { activeMode, cartridgeState, selectCodex, setSubmenuType, pauseIdleTimer } = useShell();
  const accent = activeMode ? MODE_CONFIGS[activeMode].accentHex : undefined;

  const activeCart = cartridgeState.available.find(c => c.id === cartridgeState.activeCartridgeId);
  const codexes = activeCart?.codexes ?? [];

  return (
    <div
      className="glass-float rounded-xl shadow-lg animate-in fade-in slide-in-from-bottom-2 p-2"
      style={{ animationDuration: '350ms' }}
      onPointerEnter={pauseIdleTimer}
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
      <div className="flex gap-1.5 justify-center">
        {codexes.map(cdx => {
          const isActive = cdx.id === cartridgeState.activeCodexId;
          return (
            <CartridgePill
              key={cdx.id}
              isActive={isActive}
              accent={accent}
              onClick={() => selectCodex(cdx.id)}
            >
              <span className="font-medium whitespace-nowrap">{cdx.label}</span>
              {isActive && <Check className="h-3 w-3" />}
            </CartridgePill>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Persona Selector
// ---------------------------------------------------------------------------

function PersonaSelector() {
  const { personaState, selectPersona, setSubmenuType, pauseIdleTimer } = useShell();

  return (
    <div
      className="glass-float rounded-xl shadow-lg animate-in fade-in slide-in-from-bottom-2 p-2"
      style={{ animationDuration: '350ms' }}
      onPointerEnter={pauseIdleTimer}
    >
      <div className="flex items-center gap-1 mb-1.5 px-1">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Persona</span>
        <button
          onClick={() => setSubmenuType("quickActions")}
          className="ml-auto text-[10px] text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back
        </button>
      </div>
      <div className="flex gap-1.5 justify-center">
        {personaState.available.map(persona => {
          const isActive = persona.id === personaState.activePersonaId;
          const Icon = resolveSmartIcon(persona.icon, persona.id);
          return (
            <CartridgePill
              key={persona.id}
              isActive={isActive}
              accent={persona.accentHex}
              onClick={() => selectPersona(persona.id)}
            >
              <div className="flex items-center gap-1">
                {Icon && <Icon className="h-3.5 w-3.5" />}
                <span className="font-medium whitespace-nowrap">{persona.label}</span>
                {isActive && <Check className="h-3 w-3" />}
              </div>
            </CartridgePill>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shared pill button for cartridge/codex selectors
// ---------------------------------------------------------------------------

function CartridgePill({
  isActive,
  accent,
  onClick,
  children,
}: {
  isActive: boolean;
  accent?: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  const [hovered, setHovered] = useState(false);
  const color = isActive ? accent : hovered ? accent : undefined;

  return (
    <button
      onClick={onClick}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs transition-all duration-150 active:scale-95
        ${isActive ? "" : "text-muted-foreground"}
      `}
      style={color ? { color } : undefined}
    >
      {children}
    </button>
  );
}
