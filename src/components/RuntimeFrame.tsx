import { useEffect, useCallback, useState, useRef } from "react";
import { useShell, type IframeReadiness } from "@/contexts/ShellContext";
import { useBrowserOptional } from "@/contexts/BrowserContext";
import EmbedFrame from "@/components/EmbedFrame";
import { postToIframe, normalizeInbound, type DeviceType } from "@/lib/shell-messages";
import { resolveIframeOrigin } from "@/lib/iframe-origin";
import { getToken } from "@/lib/aa-client";
import type { BrowserMountPayload, BrowserStepState, BrowserBadgeState, BrowserDrawerData, BrowserActionStatus } from "@/lib/browser-types";

function getDeviceType(): DeviceType {
  const w = window.innerWidth;
  if (w < 768) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}

export default function RuntimeFrame() {
  const { config, iframeRef, updateTrust, reportIframeReadiness } = useShell();
  const browser = useBrowserOptional();

  // LOV-302: Transition class for smooth cartridge/codex switches
  const [transitioning] = useState(false);

  // Guard so bootstrap is sent at most twice: once on iframe load,
  // and once again on first true RUNTIME_READY (handshake replay).
  const bootstrapSentRef = useRef({ onLoad: false, onReady: false });

  // LOV-303: Report iframe readiness to shell
  const handleStatusChange = useCallback((status: IframeReadiness) => {
    console.log("[Shell] iframe readiness:", status);
    reportIframeReadiness(status);
  }, [reportIframeReadiness]);

  /**
   * Idempotent bootstrap: SHELL_READY → HANDOFF → SET_THEME → DEVICE_CONTEXT_UPDATE.
   * Safe to call multiple times. Used for both the initial iframe-load send
   * and the post-handshake replay (so runtimes that mount their message
   * client late still get a guaranteed bootstrap).
   */
  const sendBootstrap = useCallback((reason: "onLoad" | "onReady") => {
    if (!config || !iframeRef.current) return;
    if (bootstrapSentRef.current[reason]) return;
    bootstrapSentRef.current[reason] = true;

    const origin = resolveIframeOrigin(config);
    const theme = document.documentElement.classList.contains("dark") ? "dark" : "light";

    console.log(`[Shell] sendBootstrap (${reason}) → ${origin}`);

    postToIframe(iframeRef.current, { type: "SHELL_READY", hide_chrome: true }, origin);

    if (config.iframe.handoff_token) {
      const aaBaseUrl = import.meta.env.VITE_AIGENT_Z_AA_BASE || "https://aa.dev-beta.aigentz.me/aa/v1";
      const aaToken = getToken();
      postToIframe(
        iframeRef.current,
        {
          type: "HANDOFF",
          handoff_token: config.iframe.handoff_token,
          aa_api_base_url: aaBaseUrl,
          aa_api_token: aaToken ?? undefined,
          context: config.iframe.bootstrap?.context ?? {},
        },
        origin
      );
    }

    postToIframe(iframeRef.current, { type: "SET_THEME", theme }, origin);

    postToIframe(iframeRef.current, {
      type: "DEVICE_CONTEXT_UPDATE",
      context: {
        device: getDeviceType(),
        viewport: { width: window.innerWidth, height: window.innerHeight },
      },
    }, origin);
  }, [config, iframeRef]);

  const handleFrameLoad = useCallback(() => {
    sendBootstrap("onLoad");
  }, [sendBootstrap]);

  // Reset bootstrap guards when config changes (e.g., refresh / reset)
  useEffect(() => {
    bootstrapSentRef.current = { onLoad: false, onReady: false };
  }, [config?.iframe?.url]);

  // Forward viewport/device changes to iframe
  useEffect(() => {
    if (!config || !iframeRef.current) return;
    const origin = resolveIframeOrigin(config);

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

  // Listen for iframe → shell messages (single source of truth for RUNTIME_READY)
  useEffect(() => {
    if (!config) return;
    const origin = resolveIframeOrigin(config);

    function handler(ev: MessageEvent) {
      if (origin !== "*" && ev.origin !== origin) return;
      const msg = normalizeInbound(ev.data);
      if (!msg) return;
      const t = msg.type as string;

      // Authoritative RUNTIME_READY detection — accepts enveloped/stringified shapes
      if (t === "RUNTIME_READY") {
        console.log("[Shell] RUNTIME_READY received → promoting to ready + replaying bootstrap");
        reportIframeReadiness("ready");
        sendBootstrap("onReady");
        return;
      }

      // Browser bridge events (runtime → shell)
      if (t.startsWith("browser.") && browser) {
        const payload = (msg.payload ?? msg) as Record<string, unknown>;
        switch (t) {
          case "browser.mount":
            console.log("[Shell] browser.mount received");
            browser.handleMount(payload as unknown as BrowserMountPayload);
            return;
          case "browser.unmount":
            console.log("[Shell] browser.unmount received");
            browser.handleUnmount(payload.sessionId as string);
            return;
          case "browser.step.update":
            browser.handleStepUpdate(payload as unknown as BrowserStepState);
            return;
          case "browser.takeover.state":
            browser.handleTakeoverState(payload.sessionId as string, payload.active as boolean);
            return;
          case "browser.badges.update":
            browser.handleBadgesUpdate(payload as unknown as BrowserBadgeState);
            return;
          case "browser.error":
            browser.handleError(payload.message as string, payload.sessionId as string | undefined);
            return;
          case "browser.surface.state":
            browser.handleSurfaceState(payload);
            return;
          case "browser.drawer.data":
            console.log("[Shell] browser.drawer.data received");
            browser.handleDrawerData(payload as unknown as BrowserDrawerData);
            return;
          case "browser.action.status":
            console.log("[Shell] browser.action.status received", payload);
            browser.handleActionStatus(payload as unknown as BrowserActionStatus);
            return;
        }
      }

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
          if ((msg as any).close_codex_handled || ((msg as any).payload && (msg as any).payload.close_codex_handled)) {
            console.log("[Shell:close_codex] ✅ Runtime acknowledged close_codex dismissal");
          }
          break;
        case "TRUST_UPDATE":
          if (msg.trust && typeof msg.trust === "object") {
            const trust = msg.trust as { level: string; signals: string[]; scores?: Record<string, number> };
            updateTrust(trust);
          }
          break;
      }
    }

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [config, updateTrust, browser, reportIframeReadiness, sendBootstrap]);

  if (!config) return null;

  return (
    <div className={`absolute inset-0 transition-opacity duration-300 ${transitioning ? "opacity-80" : "opacity-100"}`} style={{ backgroundColor: 'var(--mm-canvas-base)' }}>
      <EmbedFrame
        ref={iframeRef}
        url={config.iframe.url}
        origin={config.iframe.origin}
        className="absolute inset-0 h-full w-full"
        onFrameLoad={handleFrameLoad}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
