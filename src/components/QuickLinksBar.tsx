import { useShell } from "@/contexts/ShellContext";
import { resolveIcon } from "@/lib/icon-utils";

/**
 * Horizontally scrollable icon-only quick link buttons.
 * Visible in both welcome and post-welcome states.
 */
export default function QuickLinksBar() {
  const { config, handleMenuAction } = useShell();
  if (!config) return null;

  const quickLinks = config.menu.policy?.quick_links ?? [];
  if (quickLinks.length === 0) return null;

  return (
    <div className="flex gap-2 overflow-x-auto px-3 py-2 scrollbar-hide">
      {quickLinks.map((ql) => {
        const Icon = resolveIcon(ql.icon, ql.id);
        return (
          <button
            key={ql.id}
            onClick={() => handleMenuAction(ql.action ?? ql.id)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            title={ql.label}
          >
            {Icon ? <Icon className="h-5 w-5" /> : <span className="text-xs">{ql.label.charAt(0)}</span>}
          </button>
        );
      })}
    </div>
  );
}
