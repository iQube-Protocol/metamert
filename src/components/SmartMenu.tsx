/**
 * SmartMenu — Liquid UI bottom navigation with nav-to-prompt transformation.
 * 
 * Default: Be | Earn | Play | Make | Share
 * Prompt mode: transforms into prompt bar with floating submenu above.
 * Quick-action-only mode: floating submenu without prompt bar (mobile touch).
 * Spec animations: mode pop, color wash, calm collapse.
 */
import { useState, useRef, useCallback } from "react";
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

/** Mode accent colors using HSL values from config */
const MODE_ACCENT: Record<SmartMenuMode, string> = {
  be: "#4DA3FF",
  earn: "#22C55E",
  play: "#00D5FF",
  make: "#D946EF",
  share: "#F59E0B",
};

const NAV_ITEMS: { id: SmartMenuMode; label: string; icon: string }[] = [
  { id: "be", label: "Be", icon: "users" },
  { id: "earn", label: "Earn", icon: "coins" },
  { id: "play", label: "Play", icon: "play" },
  { id: "make", label: "Make", icon: "pencil" },
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
    submenuVisibility,
    pauseIdleTimer,
    resumeIdleTimer,
  } = useShell();

  // Hover preview: show quick actions on rollover without entering prompt mode
  const [hoverPreviewMode, setHoverPreviewMode] = useState<SmartMenuMode | null>(null);
  const hoverTimeout = useRef<ReturnType<typeof setTimeout>>();
  // Shared double-tap tracker — survives view-state re-renders
  const sharedLastTouchTap = useRef<number>(0);

  // No longer needed — using PointerEvent.pointerType directly

  // Guard: block phantom hover events after nav restoration or mode activation
  const navRestoredAt = useRef<number>(0);
  const modeActivatedAt = useRef<number>(0);
  const prevViewState = useRef(viewState);

  // Clear stale hover state on any view-state transition
  if (viewState !== prevViewState.current) {
    if (viewState === "promptMode" || viewState === "quickActionOnly") {
      if (hoverPreviewMode !== null) setHoverPreviewMode(null);
      modeActivatedAt.current = Date.now();
    }
    if (viewState === "defaultNav" && prevViewState.current !== "defaultNav") {
      if (hoverPreviewMode !== null) setHoverPreviewMode(null);
      navRestoredAt.current = Date.now();
    }
    prevViewState.current = viewState;
  }

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
      activateQuickActions(mode);
    } else {
      activateMode(mode);
    }
  }, [activateMode, activateQuickActions]);

  // Empty nav area tap: show Play quick actions (touch only)
  const handleNavAreaPointerUp = useCallback((e: React.PointerEvent) => {
    if (e.target !== e.currentTarget) return;
    if (e.pointerType === "touch") {
      activateQuickActions("play");
    }
  }, [activateQuickActions]);

  // Swipe-up on nav bar to enter prompt mode from quickActionOnly
  const touchStartY = useRef<number | null>(null);
  const handleNavTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  }, []);
  const handleNavSwipeEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const dy = touchStartY.current - e.changedTouches[0].clientY;
    if (dy > 40 && activeMode) {
      activateMode(activeMode); // swipe up → enter prompt mode
    }
    touchStartY.current = null;
  }, [activeMode, activateMode]);

  if (!config) return null;

  // Prompt mode: show prompt bar + floating submenu with animations
  if (viewState === "promptMode" && activeMode) {
    return (
      <div
        className="flex flex-col animate-in fade-in duration-200"
        onPointerEnter={handlePointerEnter}
        onPointerLeave={resumeIdleTimer}
      >
        {submenuVisibility === "visibleAuto" && (
          <div className="px-2 pb-1.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <SmartMenuSubmenu />
          </div>
        )}
        <SmartMenuPromptBar />
      </div>
    );
  }

  // Quick-action-only mode: floating submenu + nav bar (no prompt, no keyboard)
  if (viewState === "quickActionOnly" && activeMode) {
    return (
      <div
        className="flex flex-col animate-in fade-in duration-200"
        onPointerEnter={handlePointerEnter}
        onPointerLeave={resumeIdleTimer}
        onTouchStart={handleNavTouchStart}
        onTouchEnd={handleNavSwipeEnd}
      >
        {submenuVisibility === "visibleAuto" && (
          <div className="px-2 pb-1.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <SmartMenuSubmenu />
          </div>
        )}
        <nav
          className="flex items-stretch border-t px-2 pt-1.5 animate-in fade-in duration-200"
          style={{
            height: '3.5625rem',
            borderTopColor: MODE_ACCENT[activeMode],
          }}
          onPointerUp={handleNavAreaPointerUp}
        >
          <div className="flex items-stretch">
            <NavButton item={NAV_ITEMS[0]} activeQAMode={activeMode} onPointerTap={handleNavPointerUp} onAction={handleMenuAction} onHoverEnter={handleNavHoverEnter} onHoverLeave={handleNavHoverLeave} />
          </div>
          <div className="flex flex-1 items-stretch justify-center gap-0">
            {NAV_ITEMS.slice(1, 4).map(item => (
              <NavButton key={item.id} item={item} isCenter activeQAMode={activeMode} onPointerTap={handleNavPointerUp} onAction={handleMenuAction} onHoverEnter={handleNavHoverEnter} onHoverLeave={handleNavHoverLeave} />
            ))}
          </div>
          <div className="flex items-stretch">
            <NavButton item={NAV_ITEMS[4]} activeQAMode={activeMode} onPointerTap={handleNavPointerUp} onAction={handleMenuAction} onHoverEnter={handleNavHoverEnter} onHoverLeave={handleNavHoverLeave} />
          </div>
        </nav>
      </div>
    );
  }

  // Default nav
  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex flex-col">
        {hoverPreviewMode && (
          <div
            className="px-2 pb-1.5 animate-in fade-in slide-in-from-bottom-2 duration-150"
            onPointerEnter={() => handleNavHoverEnter(hoverPreviewMode)}
            onPointerLeave={handleNavHoverLeave}
          >
            <SmartMenuSubmenu previewMode={hoverPreviewMode} />
          </div>
        )}
        <nav
          className="flex items-stretch border-t border-border bg-card px-2 pt-1.5 animate-in fade-in duration-200"
          style={{ height: '3.5625rem' }}
          onPointerUp={handleNavAreaPointerUp}
        >
          <div className="flex items-stretch">
            <NavButton item={NAV_ITEMS[0]} onPointerTap={handleNavPointerUp} onAction={handleMenuAction} onHoverEnter={handleNavHoverEnter} onHoverLeave={handleNavHoverLeave} />
          </div>
          <div className="flex flex-1 items-stretch justify-center gap-0">
            {NAV_ITEMS.slice(1, 4).map(item => (
              <NavButton key={item.id} item={item} isCenter onPointerTap={handleNavPointerUp} onAction={handleMenuAction} onHoverEnter={handleNavHoverEnter} onHoverLeave={handleNavHoverLeave} />
            ))}
          </div>
          <div className="flex items-stretch">
            <NavButton item={NAV_ITEMS[4]} onPointerTap={handleNavPointerUp} onAction={handleMenuAction} onHoverEnter={handleNavHoverEnter} onHoverLeave={handleNavHoverLeave} />
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
  onPointerTap,
  onAction,
  onHoverEnter,
  onHoverLeave,
}: {
  item: { id: SmartMenuMode; label: string; icon: string };
  isCenter?: boolean;
  activeQAMode?: SmartMenuMode | null;
  onPointerTap: (mode: SmartMenuMode, pointerType: string) => void;
  onAction: (id: string) => Promise<void>;
  onHoverEnter: (mode: SmartMenuMode) => void;
  onHoverLeave: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const lastTouchTapRef = useRef<number>(0);
  const Icon = resolveIcon(item.icon, item.id);
  const accent = MODE_ACCENT[item.id];
  const isEdge = item.id === "be" || item.id === "share";
  const isActiveQA = activeQAMode === item.id;

  // In quickActionOnly mode, highlight the active mode
  const iconColor = isActiveQA
    ? accent
    : isEdge
      ? (hovered ? accent : "hsl(var(--muted-foreground))")
      : accent;
  const iconFilter = !isEdge && hovered && !isActiveQA ? "brightness(1.4) drop-shadow(0 0 4px currentColor)" : "none";

  const handlePointerUp = (e: React.PointerEvent) => {
    e.stopPropagation(); // prevent nav area handler

    if (e.pointerType === "touch") {
      const now = Date.now();
      const delta = now - lastTouchTapRef.current;
      lastTouchTapRef.current = now;

      if (delta < 350) {
        // Double-tap on touch: enter prompt mode + trigger action (like desktop click)
        lastTouchTapRef.current = 0;
        onAction(item.id);
        onPointerTap(item.id, "mouse"); // force prompt mode path
      } else {
        // Single tap on touch: quick actions only, NO inference
        onPointerTap(item.id, "touch");
      }
    } else {
      // Desktop click: original behavior — action + prompt mode
      onAction(item.id);
      onPointerTap(item.id, e.pointerType);
    }
  };

  return (
    <button
      onPointerUp={handlePointerUp}
      onPointerEnter={() => { setHovered(true); onHoverEnter(item.id); }}
      onPointerLeave={() => { setHovered(false); onHoverLeave(); }}
      className={`flex flex-col items-center justify-center gap-0.5 rounded-md py-1.5 text-[11px] transition-all duration-200
        ${isCenter ? "min-w-[3.5rem] px-1" : "w-14 shrink-0"}
        active:scale-110
      `}
    >
      <span
        className="flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200"
        style={{ color: iconColor, filter: iconFilter }}
      >
        {Icon ? <Icon className={item.id === "play" ? "h-6 w-6" : "h-5 w-5"} /> : <span className="h-5 w-5" />}
      </span>
      <span className="text-muted-foreground">{item.label}</span>
    </button>
  );
}