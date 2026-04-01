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
import { Loader2 } from "lucide-react";

function ShellLayout() {
  const shell = useShell();
  const { config, loading, hydrate, resetKey, viewState, deactivateMode, iframeRef, runtimeHints } = shell;

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
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-3 text-muted-foreground">Hydrating shell…</span>
      </div>
    );
  }

  const menuActive = viewState === "promptMode" || viewState === "quickActionOnly";

  // LOV-502: focusMode reduces chrome — hide header when runtime requests it
  const showHeader = !runtimeHints.focusMode;

  return (
    <BrowserProvider iframeRef={iframeRef} config={config}>
      <div className="flex h-dvh flex-col bg-background">
        {showHeader && <RuntimeHeader />}
        <div className="relative flex-1 overflow-hidden">
          {menuActive && (
            <div
              className="absolute inset-0 z-40"
              onClick={deactivateMode}
            />
          )}
          <RuntimeFrame key={resetKey} />
          <BrowserSurfaceHost />
        </div>
        <BrowserSessionPanel />
        <BrowserHistoryDrawer />
        <BrowserMinimizedPill />
        <SmartMenu />
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
