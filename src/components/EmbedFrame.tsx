import { useEffect, useState, forwardRef } from "react";
import { probeEmbedUrl, withCacheBust } from "@/lib/embed-utils";
import { Button } from "@/components/ui/button";
import { ExternalLink, Loader2, AlertTriangle } from "lucide-react";

interface EmbedFrameProps {
  url: string;
  origin?: string;
  className?: string;
  /** Fires when the iframe element has loaded and can receive shell bootstrap messages. */
  onFrameLoad?: () => void;
  onStatusChange?: (status: FrameStatus) => void;
  /** Max probe retries before showing error (default 2) */
  maxRetries?: number;
}

/**
 * Iframe element lifecycle status only. RUNTIME_READY (true handshake) is
 * owned by RuntimeFrame/ShellContext via the normalized message path —
 * this component never promotes itself to "ready".
 */
type FrameStatus = "probing" | "loading" | "loaded-unconfirmed" | "error" | "blocked";
export type { FrameStatus };

const EmbedFrame = forwardRef<HTMLIFrameElement, EmbedFrameProps>(
  ({ url, origin: _origin, className = "", onFrameLoad, onStatusChange, maxRetries = 2 }, ref) => {
    const [status, setStatus] = useState<FrameStatus>("probing");
    const [retryCount, setRetryCount] = useState(0);
    // Notify parent of status changes via effect so we never call a parent
    // setState during a child render (avoids "Cannot update a component while
    // rendering a different component" warnings).
    useEffect(() => {
      onStatusChange?.(status);
    }, [status, onStatusChange]);
    const [src, setSrc] = useState<string>("");

    // Probe then load — with retry support
    useEffect(() => {
      let cancelled = false;
      setStatus("probing");

      (async () => {
        const reachable = await probeEmbedUrl(url);
        if (cancelled) return;

        if (reachable) {
          setSrc(withCacheBust(url));
          setStatus("loading");
        } else if (retryCount < maxRetries) {
          // Auto-retry after delay
          setTimeout(() => {
            if (!cancelled) setRetryCount(c => c + 1);
          }, 2000 * (retryCount + 1));
        } else {
          setStatus("error");
        }
      })();

      return () => { cancelled = true; };
    }, [url, retryCount, maxRetries]);

    // NOTE: RUNTIME_READY is intentionally NOT handled here. The single
    // source of truth for true runtime readiness is the normalized message
    // path in RuntimeFrame/ShellContext, which accepts enveloped and
    // stringified message shapes. EmbedFrame only reports iframe element
    // lifecycle: probing → loading → loaded-unconfirmed (or error/blocked).

    // Detect iframe load error (X-Frame-Options / CSP block)
    const handleIframeLoad = () => {
      try {
        // If blocked by X-Frame-Options/CSP, accessing contentDocument throws
        const iframe = typeof ref === "function" ? null : ref?.current;
        if (iframe) {
          // Try to access contentWindow — blocked iframes throw or return null
          const win = iframe.contentWindow;
          if (win) {
            try {
              // Accessing win.location.href on a cross-origin blocked frame throws
              void win.location.href;
            } catch {
              // Cross-origin is expected — not blocked, just cross-origin
            }
          }
        }
      } catch {
        setStatus("blocked");
        return;
      }

      // The iframe element is loaded at this point, so the shell can safely
      // send bootstrap messages such as SHELL_READY and HANDOFF.
      // Mark as loaded-unconfirmed immediately — this enables Phase A
      // (optimistic) dispatch of runtime commands while we wait for the
      // true RUNTIME_READY handshake (Phase B replay handled by ShellContext).
      setStatus("loaded-unconfirmed");
      onFrameLoad?.();
    };

    if (status === "probing") {
      return (
        <div className={`flex items-center justify-center bg-background ${className}`}>
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-3 text-muted-foreground">Probing runtime…</span>
        </div>
      );
    }

    if (status === "error" || status === "blocked") {
      return (
        <div className={`flex flex-col items-center justify-center gap-4 bg-background ${className}`}>
          <AlertTriangle className="h-10 w-10 text-destructive" />
          <p className="text-muted-foreground text-sm">
            {status === "blocked"
              ? "The runtime is blocked by content security policy."
              : "Unable to reach the runtime endpoint."}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => { setRetryCount(0); }}>
              Retry
            </Button>
            <Button variant="outline" asChild>
              <a href={url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Open in New Tab
              </a>
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className={`relative ${className}`}>
        {status === "loading" && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}
        <iframe
          ref={ref}
          src={src}
          className="absolute inset-0 h-full w-full border-0"
          allow="clipboard-write; clipboard-read"
          onLoad={handleIframeLoad}
          title="metaMe Runtime"
        />
      </div>
    );
  }
);

EmbedFrame.displayName = "EmbedFrame";
export default EmbedFrame;
