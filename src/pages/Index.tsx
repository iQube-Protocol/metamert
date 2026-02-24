import { useEffect } from "react";
import { ShellProvider, useShell } from "@/contexts/ShellContext";
import RuntimeHeader from "@/components/RuntimeHeader";
import SmartMenu from "@/components/SmartMenu";
import RuntimeFrame from "@/components/RuntimeFrame";
import { Loader2 } from "lucide-react";

function PromptBox() {
  const { config, shellState } = useShell();
  if (!config) return null;

  const policy = config.menu.policy;
  const showPrompt =
    shellState === "welcome"
      ? policy?.state_behavior?.welcome?.show_prompt ?? false
      : policy?.state_behavior?.post_welcome?.show_prompt ?? false;

  if (!showPrompt || !policy?.prompt_box?.visible) return null;

  return (
    <div className="flex items-center justify-center px-4 py-3">
      <div className="w-full max-w-md rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-muted-foreground">
        {policy.prompt_box.placeholder}
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
      <PromptBox />
      <RuntimeFrame />
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
