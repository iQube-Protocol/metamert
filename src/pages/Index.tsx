import { useEffect, useState, useCallback, useRef } from "react";
import { ShellProvider, useShell } from "@/contexts/ShellContext";
import RuntimeHeader from "@/components/RuntimeHeader";
import SmartMenu from "@/components/SmartMenu";
import RuntimeFrame from "@/components/RuntimeFrame";
import QuickLinksBar from "@/components/QuickLinksBar";
import PromptBox from "@/components/PromptBox";
import { Loader2 } from "lucide-react";

/**
 * Floating overlay: QuickLinksBar + PromptBox float above the SmartMenu.
 * Auto-hides after 3s of no interaction; re-appears on pointer enter.
 */
function FloatingOverlay() {
  const { shellState, config } = useShell();
  const [visible, setVisible] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stateBehavior = config?.menu?.policy?.state_behavior;
  const isWelcome = shellState === "welcome";
  const showPrompt = isWelcome
    ? (stateBehavior?.welcome?.show_prompt ?? false)
    : (stateBehavior?.post_welcome?.show_prompt ?? true);
  const showQuickLinks = isWelcome
    ? (stateBehavior?.welcome?.show_quick_links ?? true)
    : true;

  const scheduleHide = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setVisible(false), 4000);
  }, []);

  const handlePointerEnter = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setVisible(true);
  }, []);

  const handlePointerLeave = useCallback(() => {
    scheduleHide();
  }, [scheduleHide]);

  useEffect(() => {
    scheduleHide();
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [scheduleHide]);

  return (
    <>
      {/* Invisible hover trigger zone — always receives pointer events */}
      <div
        onPointerEnter={handlePointerEnter}
        className="absolute inset-x-0 bottom-0 z-20 h-16"
      />
      {/* Actual floating content */}
      <div
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        className={`absolute inset-x-0 bottom-0 z-20 flex flex-col items-center gap-1.5 px-2 pb-2 transition-opacity duration-300 ${
          visible ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="w-full">
          <QuickLinksBar />
        </div>
        <div className="w-full">
          <PromptBox />
        </div>
      </div>
    </>
  );
}

function ShellLayout() {
  const { config, loading, hydrate } = useShell();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

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
      {/* Iframe area with floating overlay */}
      <div className="relative flex-1 overflow-hidden">
        <RuntimeFrame />
        <FloatingOverlay />
      </div>
      <SmartMenu />
    </div>
  );
}

export default function Index() {
  return (
    <ShellProvider>
      <ShellLayout />
    </ShellProvider>
  );
}
