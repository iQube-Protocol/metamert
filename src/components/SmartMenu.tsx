import { useShell } from "@/contexts/ShellContext";
import { resolveIcon } from "@/lib/icon-utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/** Color map for menu item accents — uses CSS custom properties */
const ITEM_COLORS: Record<string, string> = {
  be: "var(--menu-be)",
  earn: "var(--menu-earn)",
  play: "var(--menu-play)",
  make: "var(--menu-make)",
  share: "var(--menu-share)",
};

/**
 * Bottom navigation: Be | Earn·Play·Make | Share
 * 5 items total. Center triad clustered tightly on tablet/desktop.
 */
export default function SmartMenu({ onPointerEnter, onPointerLeave }: { onPointerEnter?: () => void; onPointerLeave?: () => void }) {
  const { config, activeMenuItem, handleMenuAction } = useShell();
  if (!config) return null;

  const allItems = config.menu?.items ?? [];
  const centerIds = new Set(config.menu?.policy?.center_group_ids ?? ["earn", "play", "make"]);

  // Split into left edge, center cluster, right edge
  const left = allItems.filter((i: any) => i.id === "be");
  const center = allItems.filter((i: any) => centerIds.has(i.id));
  const right = allItems.filter((i: any) => i.id === "share");

  const renderBtn = (item: any, isCenter = false) => {
    const Icon = resolveIcon(item.icon, item.id);
    const isActive = activeMenuItem === item.id;
    const hsl = ITEM_COLORS[item.id];

    const btn = (
      <button
        key={item.id}
        onClick={() => handleMenuAction(item.id)}
        aria-pressed={isActive}
        className={`flex flex-col items-center justify-center gap-0.5 rounded-md py-1.5 text-[11px] transition-all duration-200
          ${isCenter ? "min-w-[3.5rem] px-1" : "w-14 shrink-0"}
          ${isActive ? "scale-105" : "hover:bg-accent hover:text-accent-foreground"}
        `}
      >
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200 ${
            isActive ? "shadow-md backdrop-blur-md" : ""
          }`}
          style={
            isActive && hsl
              ? {
                  backgroundColor: `hsl(${hsl} / 0.25)`,
                  color: `hsl(${hsl})`,
                  boxShadow: `0 0 12px hsl(${hsl} / 0.4)`,
                  border: `1px solid hsl(${hsl} / 0.35)`,
                }
              : { color: hsl ? `hsl(${hsl})` : undefined }
          }
        >
          {Icon ? <Icon className="h-5 w-5" /> : <span className="h-5 w-5" />}
        </span>
        <span
          className={`transition-colors ${isActive ? "font-semibold" : "text-muted-foreground"}`}
          style={isActive && hsl ? { color: `hsl(${hsl})` } : undefined}
        >
          {item.label}
        </span>
      </button>
    );

    if (item.tooltip) {
      return (
        <Tooltip key={item.id}>
          <TooltipTrigger asChild>{btn}</TooltipTrigger>
          <TooltipContent side="top"><p className="text-xs">{item.tooltip}</p></TooltipContent>
        </Tooltip>
      );
    }
    return btn;
  };

  return (
    <TooltipProvider delayDuration={300}>
      <nav className="flex items-stretch border-t border-border bg-card px-2 py-1.5" onPointerEnter={onPointerEnter} onPointerLeave={onPointerLeave}>
        <div className="flex items-stretch">
          {left.map((item: any) => renderBtn(item))}
        </div>
        <div className="flex flex-1 items-stretch justify-center gap-0">
          {center.map((item: any) => renderBtn(item, true))}
        </div>
        <div className="flex items-stretch">
          {right.map((item: any) => renderBtn(item))}
        </div>
      </nav>
    </TooltipProvider>
  );
}
