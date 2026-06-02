import { X } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useShell } from "@/contexts/ShellContext";
import { SMART_MENU_ICON_DEFAULTS } from "@/lib/smart-menu-icons";
import { DEFAULT_CARTRIDGES } from "@/lib/smart-menu-config";
import { useIsMobile } from "@/hooks/use-mobile";

/**
 * Renders one chip per open cartridge from the canonical
 * CartridgePresenceRegistry (`metame:cartridge-opened/-tab-changed/-closed`).
 * Each chip shows the cartridge accent-coloured icon, label, and an X
 * that posts the canonical close-intent envelope back into the runtime.
 */
export default function CartridgeIndicator() {
  const { openCartridges, closeCartridge, cartridgeState } = useShell();
  const isMobile = useIsMobile();

  if (!openCartridges.length) return null;

  const lookup = (cartridgeId: string) => {
    // Prefer live shell-config cartridges, fall back to defaults so the chip
    // still picks up the right colour/icon for canonical IDs.
    const slug = cartridgeId.replace(/-codex$/, "");
    return (
      cartridgeState.available.find(
        c => c.id === cartridgeId || c.id.replace(/-codex$/, "") === slug,
      ) ??
      DEFAULT_CARTRIDGES.find(
        c => c.id === cartridgeId || c.id.replace(/-codex$/, "") === slug,
      )
    );
  };

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex items-center gap-1" data-tour="cartridge-indicator">
        {openCartridges.map(c => {
          const def = lookup(c.cartridgeId);
          const Icon =
            SMART_MENU_ICON_DEFAULTS[def?.icon ?? "cartridge"] ??
            SMART_MENU_ICON_DEFAULTS.cartridge;
          const accent = def?.accentHex ?? "var(--mm-ink-secondary)";
          const label = c.displayLabel || def?.label || c.cartridgeId;
          const tipParts = [label];
          if (c.tab) tipParts.push(c.tab);
          if (c.subTab) tipParts.push(c.subTab);
          return (
            <Tooltip key={c.cartridgeId}>
              <TooltipTrigger asChild>
                <div
                  className="flex items-center gap-1 px-1.5 py-1"
                  style={{
                    borderRadius: "var(--mm-radius-xs)",
                    backgroundColor: "var(--mm-canvas-variant)",
                    border: "var(--mm-border-hairline)",
                  }}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: accent }} />
                  {!isMobile && (
                    <span
                      className="max-w-[120px] truncate text-[11px]"
                      style={{ color: "var(--mm-ink-primary)" }}
                    >
                      {label}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => closeCartridge(c.cartridgeId)}
                    aria-label={`Close ${label}`}
                    className="inline-flex h-4 w-4 items-center justify-center rounded-mm-xs text-mm-ink-muted transition-colors hover:bg-mm-line-subtle hover:text-mm-ink-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="text-xs">{tipParts.join(" · ")}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
