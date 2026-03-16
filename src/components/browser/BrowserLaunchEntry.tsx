import { useBrowserOptional } from "@/contexts/BrowserContext";
import { Globe } from "lucide-react";

interface BrowserLaunchEntryProps {
  className?: string;
}

export default function BrowserLaunchEntry({ className }: BrowserLaunchEntryProps) {
  const browser = useBrowserOptional();

  if (!browser) return null;

  const isActive = browser.surfaceState !== "collapsed";

  return (
    <button
      onClick={() => {
        if (isActive) {
          browser.requestExpand();
        } else {
          browser.requestOpen();
        }
      }}
      className={`flex items-center gap-1.5 text-xs ${className ?? ""}`}
      aria-label={isActive ? "Show browser" : "Open browser"}
    >
      <Globe className="h-4 w-4" />
      <span>Browser</span>
    </button>
  );
}
