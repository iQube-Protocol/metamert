import { useShell } from "@/contexts/ShellContext";
import { resolveIcon } from "@/lib/icon-utils";

/**
 * Floating quick-links bar: Watch, Listen, Read, Find, Refresh, Reset.
 * Full-width on tablet/desktop; horizontally scrollable on mobile.
 */
export default function QuickLinksBar() {
  const { config, handleMenuAction, quickLinksExpanded } = useShell();

  const quickLinks = config?.menu?.policy?.quick_links ?? [];
  if (quickLinks.length === 0 || !quickLinksExpanded) return null;

  return (
    <div className="glass-float flex w-full items-center justify-evenly gap-1 overflow-x-auto rounded-xl border border-border px-3 py-1.5 shadow-lg scrollbar-hide animate-in fade-in slide-in-from-bottom-2 duration-200">
      {quickLinks.map((ql: any) => {
        const Icon = resolveIcon(ql.icon, ql.id);
        return (
          <button
            key={ql.id}
            onClick={() => handleMenuAction(ql.action ?? ql.id)}
            className="flex shrink-0 flex-col items-center justify-center gap-0.5 rounded-lg px-3 py-1 text-muted-foreground transition-all duration-150 hover:bg-accent hover:text-accent-foreground active:scale-95"
            title={ql.label}
          >
            {Icon ? <Icon className="h-4 w-4" /> : <span className="text-xs font-medium">{ql.label.charAt(0)}</span>}
            <span className="text-[9px] leading-tight">{ql.label}</span>
          </button>
        );
      })}
    </div>
  );
}
