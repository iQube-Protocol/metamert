import { useEffect, useState, forwardRef } from "react";
import { probeEmbedUrl, withCacheBust } from "@/lib/embed-utils";
import { Button } from "@/components/ui/button";
import { ExternalLink, Loader2, AlertTriangle } from "lucide-react";

interface EmbedFrameProps {
  url: string;
  origin?: string;
  className?: string;
  onReady?: () => void;
}

type FrameStatus = "probing" | "loading" | "ready" | "error" | "blocked";

const EmbedFrame = forwardRef<HTMLIFrameElement, EmbedFrameProps>(
  ({ url, origin, className = "", onReady }, ref) => {
    const [status, setStatus] = useState<FrameStatus>("probing");
    const [src, setSrc] = useState<string>("");

    // Probe then load
    useEffect(() => {
      let cancelled = false;
      setStatus("probing");

      (async () => {
        const reachable = await probeEmbedUrl(url);
        if (cancelled) return;

        if (reachable) {
          setSrc(withCacheBust(url));
          setStatus("loading");
        } else {
          setStatus("error");
        }
      })();

      return () => { cancelled = true; };
    }, [url]);

    // Listen for RUNTIME_READY from iframe
    useEffect(() => {
      function handler(ev: MessageEvent) {
        if (origin && ev.origin !== origin) return;
        if (ev.data?.type === "RUNTIME_READY") {
          setStatus("ready");
          onReady?.();
        }
      }
      window.addEventListener("message", handler);
      return () => window.removeEventListener("message", handler);
    }, [origin, onReady]);

    // Detect iframe load error (X-Frame-Options / CSP block)
    const handleIframeLoad = () => {
      // If we haven't received RUNTIME_READY within 5s, mark as loaded but not handshaked
      setTimeout(() => {
        setStatus((s) => (s === "loading" ? "ready" : s));
      }, 5000);
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
          <Button variant="outline" asChild>
            <a href={url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              Open in New Tab
            </a>
          </Button>
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
