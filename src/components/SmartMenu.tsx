import { useShell } from "@/contexts/ShellContext";
import { resolveIcon } from "@/lib/icon-utils";

/** IDs that form the tight center cluster */
const CENTER_IDS = new Set(["earn", "play", "make"]);

/**
 * Bottom navigation: Be | Earn·Play·Make | Share
 * All 5 items from config.menu.items. Center triad is clustered tightly.
 */
export default function SmartMenu() {
  const { config, activeMenuItem, handleMenuAction } = useShell();
  if (!config) return null;

  const allItems = config.menu?.items ?? [];
  const edgeItems = config.menu?.edge_items ?? [];

  // Build unified list: edge_items (be/share) + items, deduped
  const itemMap = new Map<string, any>();
  for (const e of edgeItems) itemMap.set(e.id, { ...e, enabled: e.visible !== false });
  for (const i of allItems) itemMap.set(i.id, i);

  // Ordered: be first, center group, share last
  const be = itemMap.get("be");
  const share = itemMap.get("share");
  const center = ["earn", "play", "make"]
    .map((id) => itemMap.get(id))
    .filter(Boolean);

  const renderBtn = (item: any, isCenter = false) => {
    const Icon = resolveIcon(item.icon, item.id);
    const isActive = activeMenuItem === item.id;

    return (
      <button
        key={item.id}
        onClick={() => handleMenuAction(item.id)}
        aria-pressed={isActive}
        className={`flex flex-col items-center justify-center gap-0.5 rounded-md py-1.5 text-[11px] transition-all duration-200
          ${isCenter ? "flex-1" : "w-14 shrink-0"}
          ${isActive ? "scale-105" : "hover:bg-accent hover:text-accent-foreground"}
        `}
      >
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200 ${
            isActive ? "shadow-md" : ""
          }`}
          style={
            isActive
              ? {
                  backgroundColor: `hsl(var(--menu-${item.id}))`,
                  color: "hsl(var(--foreground))",
                  boxShadow: `0 0 10px hsl(var(--menu-${item.id}) / 0.5)`,
                }
              : undefined
          }
        >
          {Icon ? <Icon className="h-5 w-5" /> : <span className="h-5 w-5" />}
        </span>
        <span className={`transition-colors ${isActive ? "font-semibold" : "text-muted-foreground"}`}>
          {item.label}
        </span>
      </button>
    );
  };

  return (
    <nav className="flex items-stretch justify-between border-t border-border bg-card px-2 py-1.5">
      {/* Be — left */}
      {be && renderBtn(be)}

      {/* Earn · Play · Make — tight center cluster */}
      <div className="flex flex-1 items-stretch justify-center gap-0">
        {center.map((item: any) => renderBtn(item, true))}
      </div>

      {/* Share — right */}
      {share && renderBtn(share)}
    </nav>
  );
}
