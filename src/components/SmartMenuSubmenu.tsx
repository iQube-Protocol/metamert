/**
 * SmartMenuSubmenu — floating submenu layer above the prompt bar.
 * Cycles between: quickActions | cartridgeSelector | codexSelector | browserSelector
 * NEVER more than one floating layer (strict 2-layer rule).
 */
import { useState, useRef, useCallback, useEffect } from "react";
import { useShell } from "@/contexts/ShellContext";
import { useBrowserOptional } from "@/contexts/BrowserContext";
import { MODE_CONFIGS, type QuickActionDef, type SmartMenuMode } from "@/lib/smart-menu-config";
import { resolveIcon } from "@/lib/icon-utils";
import { SMART_MENU_ICON_DEFAULTS } from "@/lib/smart-menu-icons";
import { Check, Globe, ArrowRight, Loader2 } from "lucide-react";
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

/**
 * Inline feedback badge — visible whenever a runtime-bound command (drawer
 * open or cartridge launch) is queued waiting for the runtime handshake.
 * Replaces the previous "click does nothing" silent wait.
 */
function PendingRuntimeBadge() {
  const { pendingRuntimeCommandCount, iframeReadiness } = useShell();
  if (pendingRuntimeCommandCount <= 0) return null;
  const label =
    iframeReadiness === "ready"
      ? "Opening…"
      : iframeReadiness === "loaded-unconfirmed"
        ? "Launching…"
        : "Connecting runtime…";
  return (
    <div
      className="flex items-center gap-1.5 px-2 py-1 text-[10px] animate-in fade-in"
      style={{ color: 'var(--mm-ink-muted)' }}
    >
      <Loader2 className="h-3 w-3 animate-spin" />
      <span className="whitespace-nowrap">{label}</span>
    </div>
  );
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
  if (submenuType === "browserSelector") {
    return <BrowserSelector />;
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
    sendIframeAction,
    setSubmenuType,
    pauseIdleTimer,
    resetIdleTimer,
    runtimeContext,
    setRuntimeContext,
    openPersonaIQube,
    openIdentityIQube,
    pulseInference,
  } = useShell();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activatedId, setActivatedId] = useState<string | null>(null);

  const effectiveMode = overrideMode ?? activeMode;
  const modeConfig = effectiveMode ? MODE_CONFIGS[effectiveMode] : null;
  const accent = modeConfig?.accentHex;

  const handleAction = useCallback((action: QuickActionDef) => {
    if (!effectiveMode) return;
    setActivatedId(action.id);
    pauseIdleTimer();

    // ---- System-only actions: drawer opens / submenu transitions ----
    // These MUST NOT pulse inference, submit prompts, or fall through to
    // handleMenuAction. They are pure shell-owned UI/iframe-bridge actions.
    if (action.id === "cartridge") {
      setSubmenuType("cartridgeSelector");
      return;
    }

    if (action.id === "persona") {
      // Show the persona selector sub-sub menu — pills (Qripto, KNYT) appear
      // above the prompt bar; clicking a pill opens that persona's iQube drawer.
      setSubmenuType("personaSelector");
      return;
    }

    if (action.id === "identity") {
      // Identity has no sub-sub menu — open the IdentityIQubeDrawer in the
      // runtime directly (single drawer, no variants). We dispatch BEFORE
      // any timer/state churn so the postMessage cannot be raced by hover
      // collapse or submenu reset. No inference pulse, no prompt submit.
      openIdentityIQube();
      // Restart idle timer only after dispatch is on the wire.
      resetIdleTimer("quickAction");
      return;
    }

    if (action.id === "browse") {
      setSubmenuType("browserSelector");
      return;
    }

    // ---- Regular quick actions: now we can pulse inference ----
    pulseInference();

    if (overrideMode && overrideMode !== activeMode) {
      activateMode(overrideMode);
    }

    if (action.id === "browse") {
      setSubmenuType("browserSelector");
      return;
    }

    // Runtime context toggle (metaMe ↔ KNYT) lives on the play menu's central slot.
    if (action.id === "knyt" && effectiveMode === "play") {
      const next = runtimeContext === "knyt" ? "metame" : "knyt";
      setRuntimeContext(next);
      resetIdleTimer("quickAction");
      return;
    }

    if (action.prompt) {
      if (action.apiAction) {
        void handleMenuAction(action.apiAction);
      } else if (action.iframeAction) {
        sendIframeAction(action.iframeAction);
      }
      submitPrompt(action.prompt);
      resetIdleTimer("quickAction");
      return;
    }

    if (viewState === "quickActionOnly" && action.triggersInference) {
      activateMode(effectiveMode);
    }

    handleMenuAction(action.id);
  }, [handleMenuAction, submitPrompt, setSubmenuType, pauseIdleTimer, overrideMode, activeMode, activateMode, viewState, effectiveMode, runtimeContext, setRuntimeContext, openPersonaIQube, openIdentityIQube, resetIdleTimer, sendIframeAction, pulseInference]);

  const foldIds = modeConfig?.mobileVisibleFold ?? [];
  const firstFoldIndex = modeConfig
    ? modeConfig.quickActions.findIndex(a => foldIds.includes(a.id))
    : -1;
  const totalActions = modeConfig?.quickActions.length ?? 0;

  // Center the default centered quick action (e.g., KNYT in Play mode)
  const centeredActionId = modeConfig?.defaultCenteredQuickActionId;
  const centeredIndex = centeredActionId
    ? modeConfig.quickActions.findIndex(a => a.id === centeredActionId)
    : -1;

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || totalActions === 0) return;
    const itemWidth = el.scrollWidth / totalActions;
    
    // Priority: center the default centered action if it exists
    if (centeredIndex >= 0) {
      const containerWidth = el.clientWidth;
      el.scrollLeft = (centeredIndex * itemWidth) - (containerWidth / 2) + (itemWidth / 2);
    } else if (firstFoldIndex > 0) {
      el.scrollLeft = firstFoldIndex * itemWidth;
    }
  }, [centeredIndex, firstFoldIndex, totalActions]);

  if (!effectiveMode || !modeConfig) return null;

  // Resolve the dynamic context-toggle quick action (id "knyt" in PLAY_ACTIONS).
  // It always shows the *opposite* context — when the runtime is in metaMe
  // mode the button reads "KNYT" (tap to switch to KNYT), and vice versa.
  const renderedActions = modeConfig.quickActions.map(a => {
    if (effectiveMode === "play" && a.id === "knyt") {
      const isKnyt = runtimeContext === "knyt";
      return { ...a, label: isKnyt ? "metaMe" : "KNYT" };
    }
    return a;
  });

  return (
    <div
      className="glass-float relative shadow-mm-low animate-in fade-in slide-in-from-bottom-2"
      style={{ animationDuration: '350ms', borderRadius: 'var(--mm-radius-sm)' }}
      onPointerEnter={pauseIdleTimer}
    >
      <PendingRuntimeBadge />
      <div
        ref={scrollRef}
        className="flex items-center overflow-x-auto px-0 py-1.5 scrollbar-hide"
        style={{ scrollSnapType: "x mandatory", scrollBehavior: "auto" }}
      >
        {renderedActions.map((action) => {
          const Icon = resolveSmartIcon(action.icon, action.id);
          return (
            <QuickActionButton
              key={action.id}
              action={action}
              accent={accent}
              Icon={Icon}
              isActivated={activatedId === action.id}
              onAction={handleAction}
            />
          );
        })}
      </div>
      {/* Edge fade indicators — parchment tinted */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-4"
        style={{
          background: 'linear-gradient(to right, var(--mm-surface-1), transparent)',
          borderRadius: 'var(--mm-radius-sm) 0 0 var(--mm-radius-sm)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-4"
        style={{
          background: 'linear-gradient(to left, var(--mm-surface-1), transparent)',
          borderRadius: '0 var(--mm-radius-sm) var(--mm-radius-sm) 0',
        }}
      />
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
  isActivated,
  onAction,
}: {
  action: QuickActionDef;
  accent: string;
  Icon: LucideIcon | undefined;
  isActivated: boolean;
  onAction: (a: QuickActionDef) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const color = hovered || isActivated ? accent : undefined;

  // Guarded pointer handler — fires on pointerup with stopPropagation so the
  // dispatch happens before any hover-collapse / idle reset can interfere.
  // We also keep onClick as a keyboard/Enter fallback (with a dedupe ref).
  const dispatchedRef = useRef(false);
  const dispatch = (e: React.SyntheticEvent) => {
    e.stopPropagation();
    if (dispatchedRef.current) return;
    dispatchedRef.current = true;
    onAction(action);
    // Reset on next tick so the same button can be re-clicked later.
    setTimeout(() => { dispatchedRef.current = false; }, 50);
  };

  return (
    <button
      type="button"
      onPointerUp={dispatch}
      onClick={dispatch}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      className="flex flex-col items-center justify-center gap-0.5 py-1.5 transition-all duration-150 active:scale-95 shrink-0"
      style={{
        scrollSnapAlign: "center",
        width: "20%",
        borderRadius: 'var(--mm-radius-xs)',
        color: color ?? 'var(--mm-ink-muted)',
      }}
      title={action.label}
    >
      {Icon ? (
        <Icon
          className="h-5 w-5"
          style={{ color: color ?? 'var(--mm-ink-muted)' }}
        />
      ) : (
        <span className="text-sm font-medium">{action.label.charAt(0)}</span>
      )}
      <span className="text-[10px] leading-tight whitespace-nowrap">{action.label}</span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Cartridge Selector
// ---------------------------------------------------------------------------

function CartridgeSelector() {
  const { activeMode, cartridgeState, selectCartridge, setSubmenuType, pauseIdleTimer, resumeIdleTimer } = useShell();

  return (
    <div
      className="glass-float shadow-mm-low animate-in fade-in slide-in-from-bottom-2 p-2"
      style={{ animationDuration: '350ms', borderRadius: 'var(--mm-radius-sm)' }}
      onPointerEnter={pauseIdleTimer}
      onPointerLeave={resumeIdleTimer}
    >
      <div className="flex items-center gap-1 mb-1.5 px-1">
        <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--mm-ink-muted)' }}>Cartridge</span>
        <PendingRuntimeBadge />
        <button
          onClick={() => setSubmenuType("quickActions")}
          className="ml-auto text-[10px] transition-colors"
          style={{ color: 'var(--mm-ink-muted)' }}
        >
          ← Back
        </button>
      </div>
      <div className="flex gap-1.5 justify-end">
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
  const { activeMode, cartridgeState, selectCodex, setSubmenuType, pauseIdleTimer, resumeIdleTimer } = useShell();
  const accent = activeMode ? MODE_CONFIGS[activeMode].accentHex : undefined;

  const activeCart = cartridgeState.available.find(c => c.id === cartridgeState.activeCartridgeId);
  const codexes = activeCart?.codexes ?? [];

  return (
    <div
      className="glass-float shadow-mm-low animate-in fade-in slide-in-from-bottom-2 p-2"
      style={{ animationDuration: '350ms', borderRadius: 'var(--mm-radius-sm)' }}
      onPointerEnter={pauseIdleTimer}
      onPointerLeave={resumeIdleTimer}
    >
      <div className="flex items-center gap-1 mb-1.5 px-1">
        <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--mm-ink-muted)' }}>
          Codex · {activeCart?.label ?? "—"}
        </span>
        <button
          onClick={() => setSubmenuType("quickActions")}
          className="ml-auto text-[10px] transition-colors"
          style={{ color: 'var(--mm-ink-muted)' }}
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
  const { personaState, selectPersona, setSubmenuType, pauseIdleTimer, resumeIdleTimer } = useShell();
  const visible = personaState.available;

  return (
    <div
      className="glass-float shadow-mm-low animate-in fade-in slide-in-from-bottom-2 p-2"
      style={{ animationDuration: '350ms', borderRadius: 'var(--mm-radius-sm)' }}
      onPointerEnter={pauseIdleTimer}
      onPointerLeave={resumeIdleTimer}
    >
      <div className="flex items-center gap-1 mb-1.5 px-1">
        <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--mm-ink-muted)' }}>Persona</span>
        <PendingRuntimeBadge />
        <button
          onClick={() => setSubmenuType("quickActions")}
          className="ml-auto text-[10px] transition-colors"
          style={{ color: 'var(--mm-ink-muted)' }}
        >
          ← Back
        </button>
      </div>
      {visible.length === 0 ? (
        <div className="px-2 py-1 text-[11px]" style={{ color: 'var(--mm-ink-muted)' }}>
          No personas available
        </div>
      ) : (
        <div className="flex gap-1.5 justify-start">
          {visible.map(persona => {
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
      )}
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

  // Guarded pointer dispatch (mirrors QuickActionButton) so the action
  // fires before any parent hover-collapse / idle reset can interfere.
  const dispatchedRef = useRef(false);
  const dispatch = (e: React.SyntheticEvent) => {
    e.stopPropagation();
    if (dispatchedRef.current) return;
    dispatchedRef.current = true;
    onClick();
    setTimeout(() => { dispatchedRef.current = false; }, 50);
  };

  return (
    <button
      type="button"
      onPointerUp={dispatch}
      onClick={dispatch}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      className="flex items-center gap-1 px-3 py-1.5 text-xs transition-all duration-150 active:scale-95"
      style={{
        borderRadius: 'var(--mm-radius-xs)',
        color: color ?? 'var(--mm-ink-muted)',
      }}
    >
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Browser Selector — tertiary submenu for browser actions
// ---------------------------------------------------------------------------

function BrowserSelector() {
  const { setSubmenuType, pauseIdleTimer, resumeIdleTimer, activeMode, activateMode } = useShell();
  const browser = useBrowserOptional();
  const accent = activeMode ? MODE_CONFIGS[activeMode].accentHex : "#4F8C98";

  const handleOpenBrowser = useCallback(() => {
    if (!browser) return;
    if (activeMode) activateMode(activeMode);
    browser.requestOpen();
  }, [browser, activeMode, activateMode]);

  const handleOpenWithIntent = useCallback((intent: string) => {
    if (!browser) return;
    if (activeMode) activateMode(activeMode);
    browser.requestOpen(intent);
  }, [browser, activeMode, activateMode]);

  const isActive = browser && browser.surfaceState !== "collapsed";

  return (
    <div
      className="glass-float shadow-mm-low animate-in fade-in slide-in-from-bottom-2 p-2"
      style={{ animationDuration: '350ms', borderRadius: 'var(--mm-radius-sm)' }}
      onPointerEnter={pauseIdleTimer}
      onPointerLeave={resumeIdleTimer}
    >
      <div className="flex items-center gap-1 mb-1.5 px-1">
        <Globe className="h-3 w-3" style={{ color: 'var(--mm-ink-muted)' }} />
        <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--mm-ink-muted)' }}>Browse</span>
        <button
          onClick={() => setSubmenuType("quickActions")}
          className="ml-auto text-[10px] transition-colors"
          style={{ color: 'var(--mm-ink-muted)' }}
        >
          ← Back
        </button>
      </div>
      <div className="flex gap-1.5 justify-center flex-wrap">
        <CartridgePill
          isActive={!!isActive}
          accent={accent}
          onClick={handleOpenBrowser}
        >
          <div className="flex items-center gap-1">
            <Globe className="h-3.5 w-3.5" />
            <span className="font-medium whitespace-nowrap">
              {isActive ? "Show Browser" : "Open Browser"}
            </span>
            <ArrowRight className="h-3 w-3" />
          </div>
        </CartridgePill>
        <CartridgePill
          isActive={false}
          accent={accent}
          onClick={() => handleOpenWithIntent("search")}
        >
          <span className="font-medium whitespace-nowrap">Search Web</span>
        </CartridgePill>
        <CartridgePill
          isActive={false}
          accent={accent}
          onClick={() => handleOpenWithIntent("research")}
        >
          <span className="font-medium whitespace-nowrap">Research</span>
        </CartridgePill>
      </div>
    </div>
  );
}
