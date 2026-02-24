import { useEffect } from "react";
import { ShellProvider, useShell } from "@/contexts/ShellContext";
import RuntimeHeader from "@/components/RuntimeHeader";
import SmartMenu from "@/components/SmartMenu";
import RuntimeFrame from "@/components/RuntimeFrame";
import QuickLinksBar from "@/components/QuickLinksBar";
import PromptBox from "@/components/PromptBox";
import { Loader2 } from "lucide-react";

function BottomPanel() {
  const { shellState, quickLinksExpanded } = useShell();

  if (shellState === "welcome") {
    // Welcome: icon-only quick links row, no prompt (iframe has it)
    return (
      <div className="border-t border-border bg-background">
        <QuickLinksBar />
      </div>
    );
  }

  // Post-welcome: prompt box + collapsible quick links above it
  return (
    <div className="border-t border-border bg-background">
      <div
        className={`overflow-hidden transition-all duration-200 ${
          quickLinksExpanded ? "max-h-16 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <QuickLinksBar />
      </div>
      <PromptBox />
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
      <RuntimeFrame />
      <BottomPanel />
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
