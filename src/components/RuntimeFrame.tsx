import { useEffect, useCallback } from "react";
import { useShell } from "@/contexts/ShellContext";
import EmbedFrame from "@/components/EmbedFrame";
import { postToIframe, type IframeInbound } from "@/lib/shell-messages";
import { toast } from "sonner";

export default function RuntimeFrame() {
  const { config, iframeRef } = useShell();

  const handleReady = useCallback(() => {
    if (!config || !iframeRef.current) return;
    const origin = config.iframe.origin || new URL(config.iframe.url).origin;

    // Step 1: SHELL_READY
    postToIframe(iframeRef.current, { type: "SHELL_READY" }, origin);

    // Step 2: HANDOFF with token
    if (config.iframe.handoff_token) {
      postToIframe(
        iframeRef.current,
        { type: "HANDOFF", handoff_token: config.iframe.handoff_token },
        origin
      );
    }
  }, [config, iframeRef]);

  // Listen for iframe → shell messages
  useEffect(() => {
    if (!config) return;
    const origin = config.iframe.origin || new URL(config.iframe.url).origin;

    function handler(ev: MessageEvent) {
      if (ev.origin !== origin) return;
      const msg = ev.data as IframeInbound;
      if (!msg?.type) return;

      switch (msg.type) {
        case "NAVIGATE":
          console.log("[Shell] NAVIGATE →", msg.path);
          break;
        case "TOAST":
          toast(msg.message, { description: msg.variant === "destructive" ? "Error" : undefined });
          break;
        case "OPEN_CAPSULE":
          console.log("[Shell] OPEN_CAPSULE →", msg.capsule_id);
          break;
        case "REQUEST_TRUST_REFRESH":
          console.log("[Shell] Trust refresh requested");
          break;
      }
    }

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [config]);

  if (!config) return null;

  return (
    <EmbedFrame
      ref={iframeRef}
      url={config.iframe.url}
      origin={config.iframe.origin}
      className="flex-1"
      onReady={handleReady}
    />
  );
}
