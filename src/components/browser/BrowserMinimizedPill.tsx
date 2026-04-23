import { useBrowserOptional } from "@/contexts/BrowserContext";
import { Globe, ChevronUp } from "lucide-react";

export default function BrowserMinimizedPill() {
  const ctx = useBrowserOptional();
  if (!ctx) return null;
  const { surfaceState, mountPayload, requestExpand, stepState } = ctx;

  if (surfaceState !== "minimized" || !mountPayload) return null;

  return (
    <button
      onClick={requestExpand}
      className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 shadow-lg transition-transform hover:scale-105 active:scale-95"
      aria-label="Expand browser"
    >
      <Globe className="h-4 w-4 text-primary" />
      <span className="max-w-[160px] truncate text-xs font-medium text-foreground">
        {mountPayload.chrome.domain || mountPayload.chrome.title}
      </span>
      {stepState && (
        <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
      )}
      <ChevronUp className="h-3 w-3 text-muted-foreground" />
    </button>
  );
}
