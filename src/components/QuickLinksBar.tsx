import { useShell } from "@/contexts/ShellContext";
import { resolveIcon } from "@/lib/icon-utils";

/**
 * Floating quick-links bar — equally spaced action buttons.
 * Filters out "refresh" and "close_codex" items.
 */
export default function QuickLinksBar() {
  const { config, handleMenuAction, submitPrompt, quickLinksExpanded } = useShell();

  const quickLinks = (config?.menu?.policy?.quick_links ?? []).filter(
    (ql: any) => {
      const id = (ql.id ?? "").toLowerCase();
      const label = (ql.label ?? "").toLowerCase();
      const action = (ql.action ?? "").toLowerCase();
      const excluded = ["refresh", "close_codex", "reset", "close"];
      return !excluded.some(ex => id.includes(ex) || label.includes(ex) || action.includes(ex));
    }
  );
  if (quickLinks.length === 0 || !quickLinksExpanded) return null;

  return (
    <div className="glass-float flex w-full items-center justify-evenly rounded-xl px-2 py-1.5 shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-200">
      {quickLinks.map((ql: any) => {
        const Icon = resolveIcon(ql.icon, ql.id);
        return (
          <button
            key={ql.id}
            onClick={() => {
              if (ql.prompt) {
                submitPrompt(ql.prompt);
              } else {
                handleMenuAction(ql.action ?? ql.id);
              }
            }}
            className="flex flex-1 flex-col items-center justify-center gap-0.5 rounded-lg px-2 py-1 text-muted-foreground transition-all duration-150 hover:bg-accent hover:text-accent-foreground active:scale-95"
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
