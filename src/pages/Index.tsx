import { useEffect } from "react";
import { ShellProvider, useShell } from "@/contexts/ShellContext";
import RuntimeHeader from "@/components/RuntimeHeader";
import SmartMenu from "@/components/SmartMenu";
import RuntimeFrame from "@/components/RuntimeFrame";
import QuickLinksBar from "@/components/QuickLinksBar";
import PromptBox from "@/components/PromptBox";
import { Loader2 } from "lucide-react";

/**
 * Floating overlay: QuickLinksBar + PromptBox float above the SmartMenu.
 */
function FloatingOverlay() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex flex-col items-center gap-1.5 px-3 pb-2">
      <div className="pointer-events-auto w-full max-w-lg">
        <QuickLinksBar />
      </div>
      <div className="pointer-events-auto w-full max-w-lg">
        <PromptBox />
      </div>
    </div>
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
