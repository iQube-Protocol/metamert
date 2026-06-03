/**
 * SmartMenu — Liquid UI bottom navigation with nav-to-prompt transformation.
 * 
 * Default: Be | Earn | Play | Make | Share
 * Prompt mode: transforms into prompt bar with floating submenu above.
 * Quick-action-only mode: floating submenu without prompt bar (mobile touch).
 * Spec animations: mode pop, color wash, calm collapse.
 */
import { useState, useRef, useCallback, useEffect } from "react";

import { useShell } from "@/contexts/ShellContext";
import { MODE_CONFIGS, type SmartMenuMode } from "@/lib/smart-menu-config";
import { resolveIcon } from "@/lib/icon-utils";
import { SMART_MENU_ICON_DEFAULTS } from "@/lib/smart-menu-icons";
import SmartMenuPromptBar from "@/components/SmartMenuPromptBar";
import SmartMenuSubmenu from "@/components/SmartMenuSubmenu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/** Mode accent colors — rich & vibrant, pulled from MODE_CONFIGS */
const MODE_ACCENT: Record<SmartMenuMode, string> = {
  be: MODE_CONFIGS.be.accentHex,
  earn: MODE_CONFIGS.earn.accentHex,
  play: MODE_CONFIGS.play.accentHex,
  make: MODE_CONFIGS.make.accentHex,
  share: MODE_CONFIGS.share.accentHex,
};

const NAV_ITEMS: { id: SmartMenuMode; label: string; icon: string }[] = [
  { id: "be", label: "Be", icon: "users" },
  { id: "make", label: "Make", icon: "pencil" },
  { id: "play", label: "Play", icon: "play" },
  { id: "earn", label: "Earn", icon: "coins" },
  { id: "share", label: "Share", icon: "share-2" },
];

export default function SmartMenu() {
  const {
    config,
    viewState,
    activeMode,
    activateMode,
    activateQuickActions,
    handleMenuAction,
    sendIframeAction,
    submenuVisibility,
    pauseIdleTimer,
    resumeIdleTimer,
    personaState,
  } = useShell();


  // Active persona accent — drives the Be icon tint when a persona is selected.
  const activePersona = personaState.available.find(p => p.id === personaState.activePersonaId);
  const personaAccent = activePersona?.accentHex;

  // Hover preview: show quick actions on rollover without entering prompt mode
  const [hoverPreviewMode, setHoverPreviewMode] = useState<SmartMenuMode | null>(null);
  const hoverTimeout = useRef<ReturnType<typeof setTimeout>>();

  // Guard: block phantom hover events after nav restoration or mode activation
  const navRestoredAt = useRef<number>(0);
  const modeActivatedAt = useRef<number>(0);
  const prevViewState = useRef(viewState);

  // Clear stale hover state on view-state transitions
  useEffect(() => {
    if (viewState !== prevViewState.current) {
      if (viewState === "promptMode" || viewState === "quickActionOnly") {
        setHoverPreviewMode(null);
        modeActivatedAt.current = Date.now();
      }
      if (viewState === "defaultNav" && prevViewState.current !== "defaultNav") {
        setHoverPreviewMode(null);
        navRestoredAt.current = Date.now();
      }
      prevViewState.current = viewState;
    }
  }, [viewState]);

  const handleNavHoverEnter = useCallback((mode: SmartMenuMode) => {
    if (Date.now() - navRestoredAt.current < 400) return;
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    setHoverPreviewMode(mode);
  }, []);

  const handleNavHoverLeave = useCallback(() => {
    hoverTimeout.current = setTimeout(() => setHoverPreviewMode(null), 150);
  }, []);

  const handlePointerEnter = useCallback(() => {
    if (Date.now() - modeActivatedAt.current < 400) return;
    pauseIdleTimer();
  }, [pauseIdleTimer]);

  // Nav button tap handler using pointerType for reliable touch detection
  const handleNavPointerUp = useCallback((mode: SmartMenuMode, pointerType: string) => {
    if (pointerType === "touch") {
      if (viewState === "quickActionOnly" && activeMode === mode) {
        activateMode(mode);
      } else {
        activateQuickActions(mode);
      }
    } else {
      activateMode(mode);
    }
    // Earn nav also opens the wallet drawer in the runtime (drawer-only, no LLM).
    if (mode === "earn") {
      sendIframeAction("wallet");
    }
  }, [activateMode, activateQuickActions, viewState, activeMode, sendIframeAction]);


  // Empty nav area tap: show Play quick actions (touch only)
  const handleNavAreaPointerUp = useCallback((e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    if (e.pointerType === "touch") {
      activateQuickActions("play");
    }
  }, [activateQuickActions]);

  // Gap trigger handlers with hover-intent delay
  const gapIntentTimer = useRef<ReturnType<typeof setTimeout>>();
  const handleGapPointerEnter = useCallback((e: React.PointerEvent) => {
    if (e.pointerType === "touch") return;
    if (Date.now() - navRestoredAt.current < 400) return;
    if (gapIntentTimer.current) clearTimeout(gapIntentTimer.current);
    gapIntentTimer.current = setTimeout(() => activateMode("play"), 220);
  }, [activateMode]);

  const handleGapPointerLeave = useCallback(() => {
    if (gapIntentTimer.current) clearTimeout(gapIntentTimer.current);
  }, []);

  const handleGapPointerUp = useCallback((e: React.PointerEvent) => {
    e.stopPropagation();
    if (e.pointerType === "touch") {
      activateMode("play");
    }
  }, [activateMode]);

  // Swipe-up on nav bar to enter prompt mode from quickActionOnly
  const touchStartY = useRef<number | null>(null);
  const handleNavTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  }, []);
  const handleNavSwipeEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const dy = touchStartY.current - e.changedTouches[0].clientY;
    if (dy > 40 && activeMode) {
      activateMode(activeMode);
    }
    touchStartY.current = null;
  }, [activeMode, activateMode]);

  if (!config) return null;

  const isPromptMode = viewState === "promptMode" && !!activeMode;
  const isActiveMode = !!activeMode && (viewState === "promptMode" || viewState === "quickActionOnly");

  const showSubmenu =
    (isActiveMode && submenuVisibility === "visibleAuto") ||
    (!isActiveMode && !!hoverPreviewMode);

  const submenuPreviewMode = isActiveMode ? undefined : hoverPreviewMode ?? undefined;

  // Nav border accent when in an active mode with submenu visible
  const navBorderColor = isActiveMode && submenuVisibility === "visibleAuto" && activeMode
    ? MODE_ACCENT[activeMode]
    : 'var(--mm-line-soft)';

  return (
    <TooltipProvider delayDuration={300}>
      <div
        data-tour="smart-menu-shell"
        className="flex flex-col"
        onPointerEnter={isActiveMode ? handlePointerEnter : undefined}
        onPointerLeave={isActiveMode ? resumeIdleTimer : undefined}
        onTouchStart={viewState === "quickActionOnly" ? handleNavTouchStart : undefined}
        onTouchEnd={viewState === "quickActionOnly" ? handleNavSwipeEnd : undefined}
      >
        {/* Submenu — single slot for all states */}
        {showSubmenu && (
          <div
            data-tour="smart-menu-submenu"
            className="pb-1.5 animate-in fade-in slide-in-from-bottom-2"
            style={{ animationDuration: '300ms' }}
            onPointerEnter={hoverPreviewMode ? () => handleNavHoverEnter(hoverPreviewMode) : undefined}
            onPointerLeave={hoverPreviewMode ? handleNavHoverLeave : undefined}
          >
            <SmartMenuSubmenu previewMode={submenuPreviewMode} />
          </div>
        )}

        {/* Prompt bar — always in DOM, hidden via display when not in prompt mode */}
        <div style={{ display: isPromptMode ? 'block' : 'none' }}>
          <SmartMenuPromptBar />
        </div>

        {/* Nav bar — parchment surface with hairline top */}
        <nav
          data-tour="smart-menu"
          className="flex items-stretch px-2 pt-3 pb-2 transition-all"
          style={{
            display: isPromptMode ? 'none' : 'flex',
            height: '4.25rem',
            backgroundColor: 'var(--mm-surface-1)',
            borderTop: `1px solid ${navBorderColor}`,
            transitionDuration: '300ms',
          }}
          onPointerUp={handleNavAreaPointerUp}
        >
          <div className="flex items-stretch" data-tour="persona-nav">
            <NavButton item={NAV_ITEMS[0]} accentOverride={personaAccent} labelOverride={personaState.activeHandle} activeQAMode={isActiveMode ? activeMode : undefined} onPointerTap={handleNavPointerUp} onAction={handleMenuAction} onHoverEnter={handleNavHoverEnter} onHoverLeave={handleNavHoverLeave} />
          </div>
          {/* Left gap: outer half extends Be activation, inner half triggers Play */}
          <div className="flex-1 min-w-[8px] flex">
            <div
              className="flex-1"
              onPointerEnter={() => handleNavHoverEnter("be")}
              onPointerLeave={handleNavHoverLeave}
              onPointerUp={(e) => {
                e.stopPropagation();
                if (e.pointerType === "touch") handleNavPointerUp("be", "touch");
              }}
            />
            <div
              className="flex-1"
              onPointerEnter={handleGapPointerEnter}
              onPointerLeave={handleGapPointerLeave}
              onPointerUp={handleGapPointerUp}
            />
          </div>
          <div className="flex shrink-0 items-stretch justify-center gap-0">
            {NAV_ITEMS.slice(1, 4).map(item => (
              <NavButton key={item.id} item={item} isCenter activeQAMode={isActiveMode ? activeMode : undefined} onPointerTap={handleNavPointerUp} onAction={handleMenuAction} onHoverEnter={handleNavHoverEnter} onHoverLeave={handleNavHoverLeave} />
            ))}
          </div>
          {/* Right gap: inner half triggers Play, outer half extends Share activation */}
          <div className="flex-1 min-w-[8px] flex">
            <div
              className="flex-[3]"
              onPointerEnter={handleGapPointerEnter}
              onPointerLeave={handleGapPointerLeave}
              onPointerUp={handleGapPointerUp}
            />
            <div
              className="flex-[1]"
              onPointerEnter={() => handleNavHoverEnter("share")}
              onPointerLeave={handleNavHoverLeave}
              onPointerUp={(e) => {
                e.stopPropagation();
                if (e.pointerType === "touch") handleNavPointerUp("share", "touch");
              }}
            />
          </div>
          <div className="flex items-stretch">
            <NavButton item={NAV_ITEMS[4]} activeQAMode={isActiveMode ? activeMode : undefined} onPointerTap={handleNavPointerUp} onAction={handleMenuAction} onHoverEnter={handleNavHoverEnter} onHoverLeave={handleNavHoverLeave} />
          </div>
        </nav>
      </div>
    </TooltipProvider>
  );
}

function NavButton({
  item,
  isCenter = false,
  activeQAMode,
  accentOverride,
  labelOverride,
  onPointerTap,
  onAction,
  onHoverEnter,
  onHoverLeave,
  
}: {
  item: { id: SmartMenuMode; label: string; icon: string };
  isCenter?: boolean;
  activeQAMode?: SmartMenuMode | null;
  accentOverride?: string;
  labelOverride?: string;
  onPointerTap: (mode: SmartMenuMode, pointerType: string) => void;
  onAction: (id: string) => Promise<void>;
  onHoverEnter: (mode: SmartMenuMode) => void;
  onHoverLeave: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const Icon = resolveIcon(item.icon, item.id);
  const accent = accentOverride ?? MODE_ACCENT[item.id];
  const isEdge = item.id === "be" || item.id === "share";
  const isActiveQA = activeQAMode === item.id;

  const isDark = document.documentElement.classList.contains('dark');
  const isBe = item.id === "be";
  const iconColor = isBe
    ? (accentOverride ?? "var(--mm-ink-muted)")
    : isActiveQA
      ? accent
      : isEdge
        ? (accentOverride ?? (hovered ? accent : "var(--mm-ink-muted)"))
        : accent;
  const iconFilter = isDark
    ? (isBe
        ? (accentOverride ? "drop-shadow(0 0 5px currentColor)" : "none")
        : !isEdge && hovered && !isActiveQA
          ? "brightness(1.2) drop-shadow(0 0 6px currentColor)"
          : isActiveQA
            ? "drop-shadow(0 0 5px currentColor)"
            : "none")
    : "none";

  const handlePointerUp = (e: React.PointerEvent) => {
    e.stopPropagation();
    // Top-level nav buttons only open their submenu / prompt bar.
    // They never dispatch an AA-API menu-action or LLM prompt — that
    // would disrupt state mid-navigation. Submenu items keep dual dispatch.
    onPointerTap(item.id, e.pointerType === "touch" ? "touch" : e.pointerType);
  };


  return (
    <div className="relative flex flex-col items-center">
      <button
        onPointerUp={handlePointerUp}
        onPointerEnter={() => { setHovered(true); onHoverEnter(item.id); }}
        onPointerLeave={() => { setHovered(false); onHoverLeave(); }}
        className={`flex flex-col items-center justify-center gap-0.5 py-0.5 text-[11px] transition-all duration-200
          ${isCenter ? "min-w-[3.5rem] px-1" : "w-14 shrink-0"}
          active:scale-110
        `}
        style={{ borderRadius: 'var(--mm-radius-xs)' }}
      >
        <span
          className="flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200"
          style={{
            color: iconColor,
            filter: iconFilter,
          }}
        >
          {Icon ? (
            <Icon
              className={item.id === "play" ? "h-6 w-6" : "h-5 w-5"}
            />
          ) : <span className="h-5 w-5" />}
        </span>
        <span
          className="truncate max-w-[4rem]"
          style={{ color: 'var(--mm-ink-muted)' }}
          title={labelOverride ?? item.label}
        >{labelOverride ?? item.label}</span>
      </button>
    </div>
  );
}
