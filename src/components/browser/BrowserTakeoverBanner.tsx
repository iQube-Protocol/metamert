import { useBrowser } from "@/contexts/BrowserContext";
import { Button } from "@/components/ui/button";
import { Hand, Play } from "lucide-react";

export default function BrowserTakeoverBanner() {
  const { requestResume } = useBrowser();

  return (
    <div className="absolute top-0 inset-x-0 z-10 flex items-center justify-between border-b border-border bg-accent/80 backdrop-blur-sm px-3 py-2">
      <div className="flex items-center gap-2">
        <Hand className="h-4 w-4 text-accent-foreground" />
        <span className="text-xs font-medium text-accent-foreground">
          You are driving
        </span>
      </div>
      <Button variant="outline" size="sm" className="h-7 text-xs" onClick={requestResume}>
        <Play className="mr-1 h-3 w-3" />
        Resume Agent
      </Button>
    </div>
  );
}
