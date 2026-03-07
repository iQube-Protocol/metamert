/**
 * SmartMenu — Liquid UI bottom navigation with nav-to-prompt transformation.
 * 
 * Default: Be | Earn | Play | Make | Share
 * Prompt mode: transforms into prompt bar with floating submenu above.
 * Spec animations: mode pop, color wash, calm collapse.
 */
import { useRef, useCallback } from "react";
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
    handleMenuAction,
    submenuVisibility,
    pauseIdleTimer,
    resumeIdleTimer,
  } = useShell();

  // Track when prompt mode activated to skip initial pointerenter
  const modeActivatedAt = useRef<number>(0);
  const prevViewState = useRef(viewState);
  if (viewState === "promptMode" && prevViewState.current !== "promptMode") {
    modeActivatedAt.current = Date.now();
  }
  prevViewState.current = viewState;

  const handlePointerEnter = useCallback(() => {
    // Skip the pointerenter that fires when the wrapper first renders under the cursor
    if (Date.now() - modeActivatedAt.current < 400) return;
    pauseIdleTimer();
  }, [pauseIdleTimer]);

  if (!config) return null;

  // Prompt mode: show prompt bar + floating submenu with animations
  if (viewState === "promptMode" && activeMode) {
    return (
      <div
        className="flex flex-col animate-in fade-in duration-200"
        onPointerEnter={handlePointerEnter}
        onPointerLeave={resumeIdleTimer}
      >
        {/* Floating submenu above prompt bar */}
        {submenuVisibility === "visibleAuto" && (
          <div className="px-2 pb-1.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <SmartMenuSubmenu />
          </div>
        )}
        <SmartMenuPromptBar />
      </div>
    );
  }

  // Default nav
  return (
    <TooltipProvider delayDuration={300}>
      <nav className="flex items-stretch border-t border-border bg-card px-2 pt-1.5 animate-in fade-in duration-200" style={{ height: '3.5625rem' }}>
        {/* Left edge: Be */}
        <div className="flex items-stretch">
          <NavButton item={NAV_ITEMS[0]} onTap={activateMode} onAction={handleMenuAction} />
        </div>

        {/* Center triad: Earn · Play · Make */}
        <div className="flex flex-1 items-stretch justify-center gap-0">
          {NAV_ITEMS.slice(1, 4).map(item => (
            <NavButton key={item.id} item={item} isCenter onTap={activateMode} onAction={handleMenuAction} />
          ))}
        </div>

        {/* Right edge: Share */}
        <div className="flex items-stretch">
          <NavButton item={NAV_ITEMS[4]} onTap={activateMode} onAction={handleMenuAction} />
        </div>
      </nav>
    </TooltipProvider>
  );
}

function NavButton({
  item,
  isCenter = false,
  onTap,
  onAction,
}: {
  item: { id: SmartMenuMode; label: string; icon: string };
  isCenter?: boolean;
  onTap: (mode: SmartMenuMode) => void;
  onAction: (id: string) => Promise<void>;
}) {
  const Icon = resolveIcon(item.icon, item.id);
  const accent = MODE_ACCENT[item.id];

  const handleClick = () => {
    // Dual event: fire existing menu action + activate mode
    onAction(item.id);
    onTap(item.id);
  };

  return (
    <button
      onClick={handleClick}
      className={`flex flex-col items-center justify-center gap-0.5 rounded-md py-1.5 text-[11px] transition-all duration-200
        ${isCenter ? "min-w-[3.5rem] px-1" : "w-14 shrink-0"}
        hover:bg-accent hover:text-accent-foreground
        active:scale-110
      `}
    >
      <span
        className="flex h-8 w-8 items-center justify-center rounded-full transition-colors"
        style={{ color: accent }}
      >
        {Icon ? <Icon className="h-5 w-5" /> : <span className="h-5 w-5" />}
      </span>
      <span className="text-muted-foreground">{item.label}</span>
    </button>
  );
}
