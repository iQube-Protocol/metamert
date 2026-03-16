import { useBrowser } from "@/contexts/BrowserContext";
import { Loader2, Eye, Download, Navigation, Pause, Hand } from "lucide-react";
import { Button } from "@/components/ui/button";

const STATUS_ICONS: Record<string, typeof Loader2> = {
  reading: Eye,
  extracting: Download,
  navigating: Navigation,
  waiting: Loader2,
  paused: Pause,
  acting: Hand,
  observing: Eye,
};

export default function BrowserStatusRail() {
  const { stepState, requestTakeover, mountPayload } = useBrowser();

  if (!stepState) return null;

  const Icon = STATUS_ICONS[stepState.status] || Loader2;
  const isAnimating = stepState.status === "waiting" || stepState.status === "navigating";

  return (
    <div className="absolute bottom-0 inset-x-0 z-10 flex items-center gap-2 border-t border-border bg-card/90 backdrop-blur-sm px-3 py-2">
      <Icon className={`h-3.5 w-3.5 text-muted-foreground ${isAnimating ? "animate-spin" : ""}`} />
      <div className="flex-1 min-w-0">
        <span className="block truncate text-xs text-foreground">
          {stepState.stepLabel}
        </span>
        <span className="block truncate text-[10px] text-muted-foreground">
          {stepState.actorLabel} · {stepState.status}
        </span>
      </div>
      {mountPayload?.capabilities.canTakeover && (
        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={requestTakeover}>
          Take Over
        </Button>
      )}
    </div>
  );
}
