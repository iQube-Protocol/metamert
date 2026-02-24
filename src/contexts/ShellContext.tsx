import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import {
  type ShellConfig,
  type MenuActionResult,
  type SelectorResult,
  type PromptActionResult,
  fetchShellConfig,
  updateSelector,
  menuAction,
  promptAction,
  authenticate,
  getToken,
} from "@/lib/aa-client";
import { postToIframe, postRawToIframe } from "@/lib/shell-messages";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Context shape
// ---------------------------------------------------------------------------

export type ShellState = "welcome" | "post-welcome";

interface ShellContextValue {
  config: ShellConfig | null;
  loading: boolean;
  authenticated: boolean;
  shellState: ShellState;
  activeMenuItem: string | null;
  quickLinksExpanded: boolean;
  inferring: boolean;
  toggleQuickLinks: () => void;
  hydrate: () => Promise<void>;
  selectAigent: (id: string) => Promise<void>;
  selectLLM: (id: string) => Promise<void>;
  handleMenuAction: (itemId: string) => Promise<void>;
  submitPrompt: (text: string) => void;
  resetToWelcome: () => void;
  updateTrust: (trust: { level: string; signals: string[]; scores?: Record<string, number> }) => void;
  iframeRef: React.RefObject<HTMLIFrameElement>;
}

const ShellCtx = createContext<ShellContextValue | null>(null);

export function useShell(): ShellContextValue {
  const ctx = useContext(ShellCtx);
  if (!ctx) throw new Error("useShell must be used inside ShellProvider");
  return ctx;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getIframeOrigin(config: ShellConfig): string {
  const pmo = (config.iframe as any).postMessageOrigin;
  if (pmo && !pmo.startsWith("http://localhost")) return pmo;
  if (config.iframe.origin && !config.iframe.origin.startsWith("http://localhost"))
    return config.iframe.origin;
  return new URL(config.iframe.url).origin;
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function ShellProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<ShellConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [shellState, setShellState] = useState<ShellState>("welcome");
  const [activeMenuItem, setActiveMenuItem] = useState<string | null>(null);
  const [quickLinksExpanded, setQuickLinksExpanded] = useState(true);
  const [inferring, setInferring] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null!);
  const inferTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Listen for iframe signals that inference rendering is complete
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      const t = e.data?.type;
      if (t === "INFERENCE_COMPLETE" || t === "RUNTIME_READY" || t === "RENDER_COMPLETE") {
        setInferring(false);
        if (inferTimeoutRef.current) {
          clearTimeout(inferTimeoutRef.current);
          inferTimeoutRef.current = null;
        }
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  const hydrate = useCallback(async () => {
    setLoading(true);
    try {
      if (!getToken()) {
        try {
          await authenticate("did:metame:dev-shell", async () => "dev-sig");
          setAuthenticated(true);
        } catch {
          console.warn("[Shell] Auth failed via proxy");
        }
      }
      const cfg = await fetchShellConfig();
      setConfig(cfg);
    } catch (err) {
      console.error("[Shell] Hydration failed:", err);
      toast.error("Shell hydration failed");
    } finally {
      setLoading(false);
    }
  }, []);

  /** Only apply a shell_config update if it came from live upstream (not hardcoded fallback) */
  const isLiveConfig = useCallback((cfg?: ShellConfig): boolean => {
    if (!cfg) return false;
    // The fallback config has trust.level "unverified" with signal "Phase-1 dev mode"
    if (cfg.trust?.level === "unverified" && cfg.trust?.signals?.[0] === "Phase-1 dev mode") return false;
    return true;
  }, []);

  const applyConfigUpdate = useCallback((newConfig?: ShellConfig) => {
    if (isLiveConfig(newConfig)) setConfig(newConfig);
  }, [isLiveConfig]);

  const selectAigent = useCallback(async (id: string) => {
    try {
      const result: SelectorResult = await updateSelector("aigent", id);
      setConfig((prev) => {
        if (!prev) return prev;
        const updated = { ...prev, selectors: { ...prev.selectors, aigent: { ...prev.selectors.aigent, current: id } } };
        // Apply trust scores from selector response if present
        if (result.shell_config?.trust?.scores) {
          updated.trust = { ...updated.trust, ...result.shell_config.trust };
        }
        return updated;
      });
      if (iframeRef.current && config) {
        postToIframe(iframeRef.current, { type: "SELECTOR_CHANGE", selector_type: "aigent", id }, getIframeOrigin(config));
      }
    } catch {
      toast.error("Failed to update Aigent selector");
    }
  }, [config]);

  const selectLLM = useCallback(async (id: string) => {
    try {
      const result: SelectorResult = await updateSelector("llm", id);
      setConfig((prev) => {
        if (!prev) return prev;
        const updated = { ...prev, selectors: { ...prev.selectors, llm: { ...prev.selectors.llm, current: id } } };
        // Apply trust scores from selector response if present
        if (result.shell_config?.trust?.scores) {
          updated.trust = { ...updated.trust, ...result.shell_config.trust };
        }
        return updated;
      });
      if (iframeRef.current && config) {
        postToIframe(iframeRef.current, { type: "SELECTOR_CHANGE", selector_type: "llm", id }, getIframeOrigin(config));
      }
    } catch {
      toast.error("Failed to update LLM selector");
    }
  }, [config]);

  const handleMenuAction = useCallback(async (itemId: string) => {
    // Handle runtime commands locally
    if (itemId === "refresh" || itemId === "__runtime_refresh__") {
      setShellState("welcome");
      setActiveMenuItem(null);
      if (iframeRef.current && config) {
        postToIframe(iframeRef.current, { type: "RESET_WELCOME" }, getIframeOrigin(config));
      }
      toast.success("Reset to welcome");
      return;
    }
    if (itemId === "reset" || itemId === "__runtime_reset__") {
      setShellState("welcome");
      setActiveMenuItem(null);
      setQuickLinksExpanded(true);
      if (iframeRef.current && config) {
        postToIframe(iframeRef.current, { type: "RESET_WELCOME" }, getIframeOrigin(config));
      }
      toast.success("Reset to welcome");
      return;
    }

    setShellState("post-welcome");
    setActiveMenuItem(itemId);

    try {
      const result: MenuActionResult = await menuAction(itemId);
      applyConfigUpdate(result.shell_config);
      // Forward the API-returned iframe_event directly to the iframe
      if (result.iframe_event && iframeRef.current && config) {
        postRawToIframe(iframeRef.current, result.iframe_event, getIframeOrigin(config));
      } else if (result.menu_event && iframeRef.current && config) {
        // Fallback: forward menu_event as MENU_ACTION
        postToIframe(
          iframeRef.current,
          { type: "MENU_ACTION", action_id: itemId, prompt: result.menu_event?.prompt, menu_event: result.menu_event },
          getIframeOrigin(config),
        );
      }
    } catch {
      // API unavailable — send a basic MENU_ACTION from local trigger data
      const menuItem = config?.menu?.items?.find((i: any) => i.id === itemId);
      const trigger = (menuItem as any)?.trigger;
      if (iframeRef.current && config) {
        const menuEvent = trigger
          ? { action_id: itemId, prompt: trigger.prompt, intent: trigger.intent }
          : { action_id: itemId, intent: itemId };
        postToIframe(
          iframeRef.current,
          { type: "MENU_ACTION", action_id: itemId, prompt: menuEvent.prompt, menu_event: menuEvent },
          getIframeOrigin(config),
        );
      }
    }
    toast.success(`Action: ${itemId}`);
  }, [config, applyConfigUpdate]);

  const submitPrompt = useCallback(async (text: string) => {
    if (!text.trim()) return;
    setShellState("post-welcome");
    setInferring(true);
    try {
      const result: PromptActionResult = await promptAction(text);
      applyConfigUpdate(result.shell_config);

      if (iframeRef.current && config) {
        // Forward the API-returned iframe_event directly
        if (result.iframe_event) {
          postRawToIframe(iframeRef.current, result.iframe_event, getIframeOrigin(config));
        } else {
          // Fallback: send PROMPT_SUBMIT
          postToIframe(iframeRef.current, { type: "PROMPT_SUBMIT", text }, getIframeOrigin(config));
        }
      }
    } catch {
      // Fallback: send directly to iframe
      if (iframeRef.current && config) {
        postToIframe(iframeRef.current, { type: "PROMPT_SUBMIT", text }, getIframeOrigin(config));
      }
    } finally {
      // Don't clear inferring here — wait for iframe INFERENCE_COMPLETE/RENDER_COMPLETE message.
      // Set a safety timeout so animation doesn't run forever if iframe never responds.
      if (inferTimeoutRef.current) clearTimeout(inferTimeoutRef.current);
      inferTimeoutRef.current = setTimeout(() => {
        setInferring(false);
        inferTimeoutRef.current = null;
      }, 30000); // 30s max
    }
  }, [config, applyConfigUpdate]);

  const resetToWelcome = useCallback(() => {
    setShellState("welcome");
    setActiveMenuItem(null);
    setQuickLinksExpanded(true);
    if (iframeRef.current && config) {
      postToIframe(iframeRef.current, { type: "RESET_WELCOME" }, getIframeOrigin(config));
    }
  }, [config]);

  const toggleQuickLinks = useCallback(() => {
    setQuickLinksExpanded((prev) => !prev);
  }, []);

  const updateTrust = useCallback((trust: { level: string; signals: string[]; scores?: Record<string, number> }) => {
    setConfig((prev) =>
      prev
        ? {
            ...prev,
            trust: {
              level: trust.level as ShellConfig["trust"]["level"],
              signals: trust.signals,
              scores: trust.scores,
            },
          }
        : prev
    );
  }, []);

  return (
    <ShellCtx.Provider
      value={{
        config, loading, authenticated, shellState,
        activeMenuItem, quickLinksExpanded, inferring, toggleQuickLinks,
        hydrate, selectAigent, selectLLM, handleMenuAction,
        submitPrompt, resetToWelcome, updateTrust, iframeRef,
      }}
    >
      {children}
    </ShellCtx.Provider>
  );
}
