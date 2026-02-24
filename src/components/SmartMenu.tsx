import { useState } from "react";
import { useShell } from "@/contexts/ShellContext";
import { resolveIcon } from "@/lib/icon-utils";
import { Menu } from "lucide-react";

/**
 * Bottom navigation bar: Be | Earn · Play · Make | Share
 * With active item highlight and collapsed triad flyout.
 */
export default function SmartMenu() {
  const { config, activeMenuItem, handleMenuAction } = useShell();
  const [triadOpen, setTriadOpen] = useState(false);

  if (!config) return null;

  const { items, edge_items, mode } = config.menu;
  const collapsed = mode === "collapsed";

  const beItem = edge_items.find((e) => e.id === "be");
  const shareItem = edge_items.find((e) => e.id === "share");

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
        className={`flex flex-1 flex-col items-center justify-center gap-0.5 rounded-md py-1.5 text-[11px] transition-colors hover:bg-accent hover:text-accent-foreground ${
          isEdge ? "text-muted-foreground" : "text-foreground"
        }`}
      >
        <span className={`flex h-7 w-7 items-center justify-center rounded-full ${isActive ? "bg-primary text-primary-foreground" : ""}`}>
          {Icon ? <Icon className="h-5 w-5" /> : <span className="h-5 w-5" />}
        </span>
        <span>{label}</span>
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
            <div className="absolute bottom-full mb-1 flex gap-1 rounded-lg border border-border bg-card p-1 shadow-lg">
              {items.filter((i) => i.enabled).map((item) =>
                renderButton(item.id, item.label, item.icon)
              )}
            </div>
          )}
        </div>
      ) : (
        items.filter((i) => i.enabled).map((item) =>
          renderButton(item.id, item.label, item.icon)
        )
      )}

      {shareItem?.visible !== false && renderButton(shareItem?.id ?? "share", shareItem?.label ?? "Share", shareItem?.icon, true)}
    </nav>
  );
}
