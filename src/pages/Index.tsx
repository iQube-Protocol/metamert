import { useEffect, useState, useCallback, useRef } from "react";
import { ShellProvider, useShell } from "@/contexts/ShellContext";
import { BrowserProvider } from "@/contexts/BrowserContext";
import RuntimeHeader from "@/components/RuntimeHeader";
import SmartMenu from "@/components/SmartMenu";
import RuntimeFrame from "@/components/RuntimeFrame";
import BrowserSurfaceHost from "@/components/browser/BrowserSurfaceHost";
import BrowserMinimizedPill from "@/components/browser/BrowserMinimizedPill";
import BrowserSessionPanel from "@/components/browser/BrowserSessionPanel";
import BrowserHistoryDrawer from "@/components/browser/BrowserHistoryDrawer";
import WelcomeModal from "@/components/tour/WelcomeModal";
import VisitorTour from "@/components/tour/VisitorTour";
import { useTourState } from "@/hooks/use-tour-state";

import { Loader2 } from "lucide-react";

function ShellLayout() {
  const shell = useShell();
  const { config, loading, hydrate, resetKey, viewState, deactivateMode, iframeRef, runtimeHints } = shell;
  const tour = useTourState();

  // Listen for the "?" help-button restart event from the header.
  useEffect(() => {
    const handler = () => tour.restart();
    window.addEventListener("metame:tour:restart", handler);
    return () => window.removeEventListener("metame:tour:restart", handler);
  }, [tour]);
  

  // Reset scroll when mobile keyboard closes (viewport height increases)
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    let prevHeight = vv.height;
    const onResize = () => {
      // Only scroll to top when keyboard is CLOSING (height increasing)
      // Don't interfere when keyboard is opening
      if (vv.height > prevHeight + 50) {
        window.scrollTo(0, 0);
      }
      prevHeight = vv.height;
    };
    vv.addEventListener("resize", onResize);
    return () => vv.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Tap-outside-to-collapse: click on runtime area collapses prompt mode
  const handleRuntimeClick = useCallback(() => {
    if (viewState === "promptMode" || viewState === "quickActionOnly") deactivateMode();
  }, [viewState, deactivateMode]);

  if (loading || !config) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: 'var(--mm-canvas-base)' }}>
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--mm-ink-muted)' }} />
        <span className="ml-3" style={{ color: 'var(--mm-ink-muted)' }}>Hydrating shell…</span>
      </div>
    );
  }

  const menuActive = viewState === "promptMode" || viewState === "quickActionOnly";

  // LOV-502: focusMode reduces chrome — hide header when runtime requests it
  const showHeader = !runtimeHints.focusMode;

  return (
    <BrowserProvider iframeRef={iframeRef} config={config}>
      <div className="relative flex h-dvh flex-col" style={{ backgroundColor: 'var(--mm-canvas-base)' }}>
        {showHeader && <RuntimeHeader />}
        <div className="relative flex-1 overflow-hidden">
          {menuActive && (
            <div
              className="absolute inset-0 z-40"
              onClick={deactivateMode}
            />
          )}
          <div data-tour="runtime-area" className="relative h-[calc(100%-4.25rem)] overflow-hidden">
            <RuntimeFrame key={resetKey} />
            <BrowserSurfaceHost />
          </div>
          <div className="absolute inset-x-0 bottom-0 z-50 pointer-events-auto">
            <SmartMenu />
          </div>

        </div>
        <BrowserSessionPanel />
        <BrowserHistoryDrawer />
        <BrowserMinimizedPill />
        <WelcomeModal open={tour.showWelcome} onStart={tour.start} onSkip={tour.skip} />
        <VisitorTour key={tour.runKey} run={tour.running} onFinish={tour.complete} />
      </div>
    </BrowserProvider>
  );
}

export default function Index() {
  return (
    <ShellProvider>
      <ShellLayout />
    </ShellProvider>
  );
}
