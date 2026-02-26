import { useEffect, useState, useCallback, useRef } from "react";
import { ShellProvider, useShell } from "@/contexts/ShellContext";
import RuntimeHeader from "@/components/RuntimeHeader";
import SmartMenu from "@/components/SmartMenu";
import RuntimeFrame from "@/components/RuntimeFrame";
import QuickLinksBar from "@/components/QuickLinksBar";
import PromptBox from "@/components/PromptBox";
import { Loader2 } from "lucide-react";

function ShellLayout() {
  const { config, loading, hydrate, shellState } = useShell();
  const [overlayVisible, setOverlayVisible] = useState(true);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const scheduleHide = useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setOverlayVisible(false), 4000);
  }, []);

  const showOverlay = useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    setOverlayVisible(true);
    scheduleHide();
  }, [scheduleHide]);

  // Re-show on shell state change
  useEffect(() => {
    setOverlayVisible(true);
    scheduleHide();
    return () => { if (hideTimerRef.current) clearTimeout(hideTimerRef.current); };
  }, [scheduleHide, shellState]);

  if (loading || !config) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-3 text-muted-foreground">Hydrating shell…</span>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      <RuntimeHeader />
      <div className="relative flex-1 overflow-hidden">
        <RuntimeFrame />
        <FloatingOverlay config={config} shellState={shellState} visible={overlayVisible} onPointerEnter={showOverlay} onPointerLeave={scheduleHide} />
      </div>
      <SmartMenu onPointerEnter={showOverlay} onPointerLeave={scheduleHide} />
    </div>
  );
}

/**
 * Floating overlay: QuickLinksBar + PromptBox float above the SmartMenu.
 * Visibility controlled by parent; no independent trigger zone.
 */
function FloatingOverlay({ config, shellState, visible, onPointerEnter, onPointerLeave }: {
  config: NonNullable<ReturnType<typeof useShell>["config"]>;
  shellState: string;
  visible: boolean;
  onPointerEnter: () => void;
  onPointerLeave: () => void;
}) {
  const stateBehavior = config?.menu?.policy?.state_behavior;
  const isWelcome = shellState === "welcome";
  const showPrompt = isWelcome
    ? (stateBehavior?.welcome?.show_prompt ?? false)
    : (stateBehavior?.post_welcome?.show_prompt ?? true);
  const showQuickLinks = isWelcome
    ? (stateBehavior?.welcome?.show_quick_links ?? true)
    : true;

  return (
    <div
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      className={`absolute inset-x-0 bottom-0 z-20 flex flex-col items-center gap-1.5 px-2 pb-2 transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      {showQuickLinks && (
        <div className="w-full">
          <QuickLinksBar />
        </div>
      )}
      {showPrompt && (
        <div className="w-full">
          <PromptBox />
        </div>
      )}
    </div>
  );
}

// Separate default export ensures HMR boundary includes ShellProvider
export default function Index() {
  return (
    <ShellProvider>
      <ShellLayout />
    </ShellProvider>
  );
}
