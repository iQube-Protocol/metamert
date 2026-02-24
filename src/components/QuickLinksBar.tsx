import { useEffect, useRef, useCallback } from "react";
import { useShell } from "@/contexts/ShellContext";
import { resolveIcon } from "@/lib/icon-utils";

/**
 * Floating quick-links bar: Watch, Listen, Read, Find, Refresh, Reset.
 * Auto-hides after 3s of no interaction. Equally spaced horizontal row.
 */
export default function QuickLinksBar() {
  const { config, handleMenuAction, quickLinksExpanded } = useShell();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const barRef = useRef<HTMLDivElement>(null);

  const quickLinks = config?.menu?.policy?.quick_links ?? [];
  if (quickLinks.length === 0 || !quickLinksExpanded) return null;

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    // Auto-hide handled by parent via toggleQuickLinks if desired
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div
      ref={barRef}
      onPointerEnter={resetTimer}
      className="flex items-center justify-evenly gap-1 rounded-xl border border-border bg-card/95 px-2 py-1.5 shadow-lg backdrop-blur-sm animate-in fade-in slide-in-from-bottom-2 duration-200"
    >
      {quickLinks.map((ql: any) => {
        const Icon = resolveIcon(ql.icon, ql.id);
        return (
          <button
            key={ql.id}
            onClick={() => handleMenuAction(ql.action ?? ql.prompt ?? ql.id)}
            className="flex flex-col items-center justify-center gap-0.5 rounded-lg px-2 py-1 text-muted-foreground transition-all duration-150 hover:bg-accent hover:text-accent-foreground active:scale-95"
            title={ql.label}
          >
            {Icon ? <Icon className="h-4.5 w-4.5" /> : <span className="text-xs font-medium">{ql.label.charAt(0)}</span>}
            <span className="text-[9px] leading-tight">{ql.label}</span>
          </button>
        );
      })}
    </div>
  );
}
