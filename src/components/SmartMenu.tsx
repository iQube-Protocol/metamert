import { useState } from "react";
import { useShell } from "@/contexts/ShellContext";
import { resolveIcon } from "@/lib/icon-utils";
import { Menu } from "lucide-react";

/**
 * Fully payload-driven bottom navigation bar.
 * Supports expanded mode: Be | Earn · Play · Make | Share
 * And collapsed mode: Be | metaMe button (opens triad) | Share
 * Renders quick links above menu during welcome state.
 */
export default function SmartMenu() {
  const { config, shellState, handleMenuAction } = useShell();
  const [triadOpen, setTriadOpen] = useState(false);

  if (!config) return null;

  const { items, edge_items, mode, policy } = config.menu;
  const collapsed = mode === "collapsed";

  // Find edge items
  const beItem = edge_items.find((e) => e.id === "be");
  const shareItem = edge_items.find((e) => e.id === "share");

  // Quick links from policy
  const showQuickLinks =
    shellState === "welcome"
      ? policy?.state_behavior?.welcome?.show_quick_links ?? false
      : false;
  const quickLinks = policy?.quick_links ?? [];

  const renderButton = (
    id: string,
    label: string,
    iconName?: string,
    isEdge = false,
  ) => {
    const Icon = resolveIcon(iconName, id);
    return (
      <button
        key={id}
        onClick={() => handleMenuAction(id)}
        className={`flex flex-1 flex-col items-center justify-center gap-0.5 rounded-md py-1.5 text-[11px] transition-colors hover:bg-accent hover:text-accent-foreground ${
          isEdge ? "text-muted-foreground" : "text-foreground"
        }`}
      >
        {Icon ? <Icon className="h-5 w-5" /> : <span className="h-5 w-5" />}
        <span>{label}</span>
      </button>
    );
  };

  return (
    <div className="border-t border-border bg-card">
      {/* Quick links row (welcome state only) */}
      {showQuickLinks && quickLinks.length > 0 && (
        <div className="flex items-center justify-center gap-2 border-b border-border px-3 py-1.5">
          {quickLinks.map((ql) => (
            <button
              key={ql.id}
              onClick={() => handleMenuAction(ql.action ?? ql.id)}
              className="rounded-full bg-accent px-3 py-1 text-[11px] text-accent-foreground transition-colors hover:bg-accent/80"
            >
              {ql.label}
            </button>
          ))}
        </div>
      )}

      {/* Main nav bar */}
      <nav className="flex items-stretch justify-between px-2 py-1.5">
        {/* Be (left edge) */}
        {beItem?.visible !== false && renderButton(beItem?.id ?? "be", beItem?.label ?? "Be", beItem?.icon, true)}

        {collapsed ? (
          /* Collapsed: single metaMe button that reveals the triad */
          <div className="relative flex flex-1 items-center justify-center">
            <button
              onClick={() => setTriadOpen(!triadOpen)}
              className="flex flex-col items-center justify-center gap-0.5 rounded-md px-4 py-1.5 text-[11px] text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <Menu className="h-5 w-5" />
              <span>metaMe</span>
            </button>

            {/* Triad flyout */}
            {triadOpen && (
              <div className="absolute bottom-full mb-1 flex gap-1 rounded-lg border border-border bg-card p-1 shadow-lg">
                {items.filter((i) => i.enabled).map((item) =>
                  renderButton(item.id, item.label, item.icon)
                )}
              </div>
            )}
          </div>
        ) : (
          /* Expanded: center triad items */
          items.filter((i) => i.enabled).map((item) =>
            renderButton(item.id, item.label, item.icon)
          )
        )}

        {/* Share (right edge) */}
        {shareItem?.visible !== false && renderButton(shareItem?.id ?? "share", shareItem?.label ?? "Share", shareItem?.icon, true)}
      </nav>
    </div>
  );
}
