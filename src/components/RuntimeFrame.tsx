import { useEffect, useCallback } from "react";
import { useShell } from "@/contexts/ShellContext";
import EmbedFrame from "@/components/EmbedFrame";
import { postToIframe, normalizeInbound, type DeviceType } from "@/lib/shell-messages";
import { resolveIframeOrigin } from "@/lib/iframe-origin";

function getDeviceType(): DeviceType {
  const w = window.innerWidth;
  if (w < 768) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}

export default function RuntimeFrame() {
  const { config, iframeRef, updateTrust } = useShell();

  const handleReady = useCallback(() => {
    if (!config || !iframeRef.current) return;
    const origin = resolveIframeOrigin(config);

    // Step 1: SHELL_READY
    postToIframe(iframeRef.current, { type: "SHELL_READY", hide_chrome: true }, origin);

    // Step 2: HANDOFF with token
    if (config.iframe.handoff_token) {
      postToIframe(
        iframeRef.current,
        { type: "HANDOFF", handoff_token: config.iframe.handoff_token },
        origin
      );
    }

    // Step 3: Send initial device context
    postToIframe(iframeRef.current, {
      type: "DEVICE_CONTEXT_UPDATE",
      context: {
        device: getDeviceType(),
        viewport: { width: window.innerWidth, height: window.innerHeight },
      },
    }, origin);
  }, [config, iframeRef]);

  // Forward viewport/device changes to iframe
  useEffect(() => {
    if (!config || !iframeRef.current) return;
    const origin = config.iframe.origin || new URL(config.iframe.url).origin;

    const handleResize = () => {
      if (!iframeRef.current) return;
      postToIframe(iframeRef.current, {
        type: "DEVICE_CONTEXT_UPDATE",
        context: {
          device: getDeviceType(),
          viewport: { width: window.innerWidth, height: window.innerHeight },
        },
      }, origin);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [config, iframeRef]);

  // Listen for iframe → shell messages
  useEffect(() => {
    if (!config) return;
    const origin = config.iframe.origin || new URL(config.iframe.url).origin;

    function handler(ev: MessageEvent) {
      if (ev.origin !== origin) return;
      const msg = normalizeInbound(ev.data);
      if (!msg) return;
      const t = msg.type as string;

      switch (t) {
        case "NAVIGATE":
          console.log("[Shell] NAVIGATE →", msg.path);
          break;
        case "TOAST":
          console.log("[Shell] TOAST (suppressed):", msg.message);
          break;
        case "OPEN_CAPSULE":
          console.log("[Shell] OPEN_CAPSULE →", msg.capsule_id);
          break;
        case "REQUEST_TRUST_REFRESH":
          console.log("[Shell] Trust refresh requested");
          break;
        case "WELCOME_COMPLETE":
          console.log("[Shell] Welcome completed by iframe");
          break;
        case "STATE_SYNC":
          console.log("[Shell] STATE_SYNC received:", msg.state);
          break;
        case "TRUST_UPDATE":
          console.log("[Shell] TRUST_UPDATE received:", msg.trust);
          if (msg.trust && typeof msg.trust === "object") {
            const trust = msg.trust as { level: string; signals: string[]; scores?: Record<string, number> };
            updateTrust(trust);
          }
          break;
      }
    }

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [config, updateTrust]);

  if (!config) return null;

  return (
    <EmbedFrame
      ref={iframeRef}
      url={config.iframe.url}
      origin={config.iframe.origin}
      className="absolute inset-0 h-full w-full"
      onReady={handleReady}
    />
  );
}
