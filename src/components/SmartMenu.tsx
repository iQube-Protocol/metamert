import { useState } from "react";
import { useShell } from "@/contexts/ShellContext";
import { resolveIcon } from "@/lib/icon-utils";
import { Menu } from "lucide-react";

/**
 * Bottom navigation bar: Be | Earn · Play · Make | Share
 * With active item highlight ring and collapsed triad flyout.
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
    return (
      <button
        key={id}
        onClick={() => handleMenuAction(id)}
        className={`flex flex-1 flex-col items-center justify-center gap-0.5 rounded-md py-1.5 text-[11px] transition-all duration-200 ${
          isEdge ? "text-muted-foreground" : "text-foreground"
        } ${isActive ? "scale-105" : "hover:bg-accent hover:text-accent-foreground"}`}
      >
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200 ${
            isActive
              ? "bg-primary text-primary-foreground shadow-[0_0_8px_hsl(var(--primary)/0.4)]"
              : ""
          }`}
        >
          {Icon ? <Icon className="h-5 w-5" /> : <span className="h-5 w-5" />}
        </span>
        <span className={`transition-colors ${isActive ? "font-semibold text-primary" : ""}`}>
          {label}
        </span>
      </button>
    );
  };

  return (
    <nav className="flex items-stretch justify-between border-t border-border bg-card px-2 py-1.5">
      {beItem?.visible !== false && renderButton(beItem?.id ?? "be", beItem?.label ?? "Be", beItem?.icon, true)}

      {collapsed ? (
        <div className="relative flex flex-1 items-center justify-center">
          <button
            onClick={() => setTriadOpen(!triadOpen)}
            className="flex flex-col items-center justify-center gap-0.5 rounded-md px-4 py-1.5 text-[11px] text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
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
        items.filter((i: any) => i.enabled).map((item: any) =>
          renderButton(item.id, item.label, item.icon)
        )
      )}

      {shareItem?.visible !== false && renderButton(shareItem?.id ?? "share", shareItem?.label ?? "Share", shareItem?.icon, true)}
    </nav>
  );
}
