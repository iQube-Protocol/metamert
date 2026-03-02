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
      const excluded = ["refresh", "close_codex", "close"];
      return !excluded.some(ex => id.includes(ex) || label.includes(ex) || action.includes(ex));
    }
  );
  if (quickLinks.length === 0 || !quickLinksExpanded) return null;

  // Order: Watch (left), [others], Read (center), [others], Reset (right)
  const findByKey = (keyword: string) =>
    quickLinks.find((ql: any) => (ql.id ?? ql.label ?? "").toLowerCase().includes(keyword));
  const watch = findByKey("watch");
  const read = findByKey("read");
  const reset = findByKey("reset");
  const others = quickLinks.filter((ql: any) => ql !== watch && ql !== read && ql !== reset);
  const ordered = [watch, others[0], read, others[1], reset].filter(Boolean);

  const renderButton = (ql: any) => {
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
        className="flex flex-col items-center justify-center gap-0.5 rounded-lg px-2 py-1 text-muted-foreground transition-all duration-150 hover:bg-accent hover:text-accent-foreground active:scale-95"
        title={ql.label}
      >
        {Icon ? <Icon className="h-4 w-4" /> : <span className="text-xs font-medium">{ql.label.charAt(0)}</span>}
        <span className="text-[9px] leading-tight">{ql.label}</span>
      </button>
    );
  };

  return (
    <div className="glass-float flex w-full items-center justify-between rounded-xl px-2 py-1.5 shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-200">
      {ordered.map(renderButton)}
    </div>
  );
}
