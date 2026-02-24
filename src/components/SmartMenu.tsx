import { useState } from "react";
import { useShell } from "@/contexts/ShellContext";
import { resolveIcon } from "@/lib/icon-utils";
import { Menu } from "lucide-react";

/** Per-item accent color CSS vars keyed by menu item ID */
const ITEM_COLORS: Record<string, string> = {
  be: "var(--menu-be)",
  earn: "var(--menu-earn)",
  play: "var(--menu-play)",
  make: "var(--menu-make)",
  share: "var(--menu-share)",
};

/**
 * Bottom navigation bar: Be | Earn · Play · Make | Share
 * Mobile: 5-in-row. Desktop: Be left, tight triad center, Share right.
 * Active item uses per-item accent color ring.
 */
export default function SmartMenu() {
  const { config, activeMenuItem, handleMenuAction } = useShell();
  const [triadOpen, setTriadOpen] = useState(false);

  if (!config) return null;

  const items = config.menu?.items ?? [];
  const edge_items = config.menu?.edge_items ?? [];
  const mode = config.menu?.mode ?? "expanded";
  const collapsed = mode === "collapsed";

  const beItem = edge_items.find((e: any) => e.id === "be");
  const shareItem = edge_items.find((e: any) => e.id === "share");

  const renderButton = (
    id: string,
    label: string,
    iconName?: string,
    isEdge = false,
  ) => {
    const Icon = resolveIcon(iconName, id);
    const isActive = activeMenuItem === id;
    const accentColor = ITEM_COLORS[id];

    return (
      <button
        key={id}
        onClick={() => handleMenuAction(id)}
        aria-pressed={isActive}
        className={`flex flex-col items-center justify-center gap-0.5 rounded-md py-1.5 text-[11px] transition-all duration-200
          ${isEdge ? "flex-none w-14" : "flex-1"}
          ${isActive ? "scale-105" : "hover:bg-accent hover:text-accent-foreground"}
          ${isActive ? "text-foreground" : isEdge ? "text-muted-foreground" : "text-foreground"}
        `}
      >
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200 ${
            isActive ? "shadow-[0_0_10px_0.5px]" : ""
          }`}
          style={
            isActive && accentColor
              ? { backgroundColor: `hsl(${accentColor.replace("var(", "").replace(")", "")})`, color: "hsl(var(--foreground))", boxShadow: `0 0 10px hsl(${accentColor.replace("var(", "").replace(")", "")} / 0.5)` }
              : undefined
          }
        >
          {Icon ? <Icon className="h-5 w-5" /> : <span className="h-5 w-5" />}
        </span>
        <span className={`transition-colors ${isActive ? "font-semibold" : ""}`}>
          {label}
        </span>
      </button>
    );
  };

  return (
    <nav className="flex items-stretch justify-between border-t border-border bg-card px-2 py-1.5">
      {/* Be — left edge */}
      {beItem?.visible !== false && renderButton(beItem?.id ?? "be", beItem?.label ?? "Be", beItem?.icon, true)}

      {collapsed ? (
        <div className="relative flex flex-1 items-center justify-center">
          <button
            onClick={() => setTriadOpen(!triadOpen)}
            className="flex flex-col items-center justify-center gap-0.5 rounded-md px-4 py-1.5 text-[11px] text-foreground transition-colors duration-200 hover:bg-accent hover:text-accent-foreground"
          >
            <Menu className="h-5 w-5" />
            <span>metaMe</span>
          </button>
          {triadOpen && (
            <div className="absolute bottom-full mb-1 flex gap-1 rounded-lg border border-border bg-card p-1 shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-200">
              {items.filter((i: any) => i.enabled).map((item: any) =>
                renderButton(item.id, item.label, item.icon)
              )}
            </div>
          )}
        </div>
      ) : (
        /* Triad center — tight group on desktop */
        <div className="flex flex-1 items-stretch justify-center gap-0 md:gap-0.5">
          {items.filter((i: any) => i.enabled).map((item: any) =>
            renderButton(item.id, item.label, item.icon)
          )}
        </div>
      )}

      {/* Share — right edge */}
      {shareItem?.visible !== false && renderButton(shareItem?.id ?? "share", shareItem?.label ?? "Share", shareItem?.icon, true)}
    </nav>
  );
}
