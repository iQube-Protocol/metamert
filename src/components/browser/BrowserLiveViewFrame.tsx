import { useEffect, useRef, useCallback } from "react";
import { useBrowser } from "@/contexts/BrowserContext";

interface BrowserLiveViewFrameProps {
  url: string;
}

export default function BrowserLiveViewFrame({ url }: BrowserLiveViewFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { reportFocus, handleError } = useBrowser();

  // Listen for Browserbase disconnect signal
  useEffect(() => {
    const handler = (ev: MessageEvent) => {
      if (typeof ev.data === "string" && ev.data === "browserbase-disconnected") {
        handleError("Browser session disconnected.");
      }
      if (ev.data && typeof ev.data === "object" && (ev.data as any).type === "browserbase-disconnected") {
        handleError("Browser session disconnected.");
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [handleError]);

  // Focus tracking
  const onFocus = useCallback(() => reportFocus(true), [reportFocus]);
  const onBlur = useCallback(() => reportFocus(false), [reportFocus]);

  useEffect(() => {
    const el = iframeRef.current;
    if (!el) return;
    el.addEventListener("focus", onFocus);
    el.addEventListener("blur", onBlur);
    return () => {
      el.removeEventListener("focus", onFocus);
      el.removeEventListener("blur", onBlur);
    };
  }, [onFocus, onBlur]);

  return (
    <iframe
      ref={iframeRef}
      src={url}
      className="absolute inset-0 h-full w-full border-0"
      allow="clipboard-read; clipboard-write"
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
      title="Browser Live View"
    />
  );
}
