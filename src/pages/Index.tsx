import { useEffect, useState, useCallback, useRef } from "react";
import { ShellProvider, useShell } from "@/contexts/ShellContext";
import RuntimeHeader from "@/components/RuntimeHeader";
import SmartMenu from "@/components/SmartMenu";
import RuntimeFrame from "@/components/RuntimeFrame";
import { Loader2 } from "lucide-react";

function ShellLayout() {
  const { config, loading, hydrate, resetKey, viewState, deactivateMode } = useShell();

  // Reset scroll when mobile keyboard closes
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    let prevHeight = vv.height;
    const onResize = () => {
      if (vv.height > prevHeight) window.scrollTo(0, 0);
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
    if (viewState === "promptMode") deactivateMode();
  }, [viewState, deactivateMode]);

  if (loading || !config) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-3 text-muted-foreground">Hydrating shell…</span>
      </div>
    );
  }

  return (
    <div className="flex h-dvh flex-col bg-background">
      <RuntimeHeader />
      <div className="relative flex-1 overflow-hidden" onClick={handleRuntimeClick}>
        <RuntimeFrame key={resetKey} />
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
