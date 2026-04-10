import { useBrowserOptional } from "@/contexts/BrowserContext";
import BrowserSurfaceChrome from "./BrowserSurfaceChrome";
import BrowserLiveViewFrame from "./BrowserLiveViewFrame";
import BrowserStatusRail from "./BrowserStatusRail";
import BrowserTakeoverBanner from "./BrowserTakeoverBanner";
import { Loader2, AlertTriangle, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BrowserSurfaceHost() {
  const ctx = useBrowserOptional();
  if (!ctx) return null;
  const { surfaceState, mountPayload, error, dismissError, requestOpen, requestClose } = ctx;

  if (surfaceState === "collapsed") return null;

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-sm">
      {/* Mounting state */}
      {surfaceState === "mounting" && (
        <div className="flex flex-1 items-center justify-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Opening browser…</span>
        </div>
      )}

      {/* Error state */}
      {surfaceState === "error" && (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6">
          <AlertTriangle className="h-10 w-10 text-destructive" />
          <p className="text-center text-sm text-muted-foreground">
            {error || "Browser surface failed to mount."}
          </p>
          <div className="flex gap-3">
            <Button variant="outline" size="sm" onClick={() => requestOpen()}>
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
              Retry
            </Button>
            <Button variant="ghost" size="sm" onClick={dismissError}>
              <X className="mr-1.5 h-3.5 w-3.5" />
              Dismiss
            </Button>
          </div>
        </div>
      )}

      {/* Active states: mounted, agent_active, human_takeover */}
      {mountPayload && (surfaceState === "mounted" || surfaceState === "agent_active" || surfaceState === "human_takeover") && (
        <>
          <BrowserSurfaceChrome />
          <div className="relative flex-1 overflow-hidden">
            <BrowserLiveViewFrame url={mountPayload.liveView.url} />
            {surfaceState === "agent_active" && <BrowserStatusRail />}
            {surfaceState === "human_takeover" && <BrowserTakeoverBanner />}
          </div>
        </>
      )}
    </div>
  );
}
