import React, { createContext, useContext, useState, useCallback, useRef } from "react";
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
import { postToIframe } from "@/lib/shell-messages";
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
  // Prefer postMessageOrigin from proxy, then origin, then derive from URL
  return (config.iframe as any).postMessageOrigin || config.iframe.origin || new URL(config.iframe.url).origin;
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
  const iframeRef = useRef<HTMLIFrameElement>(null!);

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
      setConfig((prev) =>
        prev
          ? { ...prev, selectors: { ...prev.selectors, aigent: { ...prev.selectors.aigent, current: id } } }
          : prev
      );
      // Don't apply shell_config from selector response — it overwrites the whole config
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
      setConfig((prev) =>
        prev
          ? { ...prev, selectors: { ...prev.selectors, llm: { ...prev.selectors.llm, current: id } } }
          : prev
      );
      // Don't apply shell_config from selector response — it overwrites the whole config
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

    // Find the menu item in the current config to get its trigger data
    const menuItem = config?.menu?.items?.find((i: any) => i.id === itemId);
    const trigger = (menuItem as any)?.trigger;

    setShellState("post-welcome");
    setActiveMenuItem(itemId);

    // Build the menu_event from trigger data (already in config) or construct a basic one
    const menuEvent = trigger
      ? {
          action_id: itemId,
          prompt: trigger.prompt,
          intent: trigger.intent,
          surface_plan_instruction: trigger.surface_plan_instruction,
          copilot_instruction: trigger.copilot_instruction,
        }
      : { action_id: itemId, intent: itemId };

    // Try the API call in the background for any server-side effects,
    // but don't depend on it for iframe communication
    try {
      const result: MenuActionResult = await menuAction(itemId);
      // Only apply config if it came from upstream (not the hardcoded fallback)
      // We detect fallback by checking if trust.level is "unverified" + signals match default
      applyConfigUpdate(result.shell_config);
      // If API returned an iframe_event, forward it too
      if (result.iframe_event && iframeRef.current && config) {
        iframeRef.current.contentWindow?.postMessage(result.iframe_event, getIframeOrigin(config));
      }
    } catch {
      // API unavailable — that's fine, we use local trigger data
    }

    // Always send MENU_ACTION with trigger data to iframe
    if (iframeRef.current && config) {
      postToIframe(
        iframeRef.current,
        { type: "MENU_ACTION", item_id: itemId, menu_event: menuEvent },
        getIframeOrigin(config),
      );
    }
    toast.success(`Action: ${itemId}`);
  }, [config, applyConfigUpdate]);

  const submitPrompt = useCallback(async (text: string) => {
    if (!text.trim()) return;
    try {
      const result: PromptActionResult = await promptAction(text);
      setShellState("post-welcome");
      applyConfigUpdate(result.shell_config);

      if (iframeRef.current && config) {
        // Forward the API-returned iframe_event if present, otherwise fall back to PROMPT_SUBMIT
        if (result.iframe_event) {
          iframeRef.current.contentWindow?.postMessage(result.iframe_event, getIframeOrigin(config));
        } else {
          postToIframe(iframeRef.current, { type: "PROMPT_SUBMIT", text }, getIframeOrigin(config));
        }
      }
    } catch {
      // Fallback: send directly to iframe
      if (iframeRef.current && config) {
        postToIframe(iframeRef.current, { type: "PROMPT_SUBMIT", text }, getIframeOrigin(config));
      }
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
        activeMenuItem, quickLinksExpanded, toggleQuickLinks,
        hydrate, selectAigent, selectLLM, handleMenuAction,
        submitPrompt, resetToWelcome, updateTrust, iframeRef,
      }}
    >
      {children}
    </ShellCtx.Provider>
  );
}
