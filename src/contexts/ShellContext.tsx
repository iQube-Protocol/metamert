import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import {
  type ShellConfig,
  type MenuActionResult,
  type SelectorResult,
  fetchShellConfig,
  updateSelector,
  menuAction,
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
  return config.iframe.origin || new URL(config.iframe.url).origin;
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

  const applyConfigUpdate = useCallback((newConfig?: ShellConfig) => {
    if (newConfig) setConfig(newConfig);
  }, []);

  const selectAigent = useCallback(async (id: string) => {
    try {
      const result: SelectorResult = await updateSelector("aigent", id);
      setConfig((prev) =>
        prev
          ? { ...prev, selectors: { ...prev.selectors, aigent: { ...prev.selectors.aigent, current: id } } }
          : prev
      );
      applyConfigUpdate(result.shell_config);
      if (iframeRef.current && config) {
        postToIframe(iframeRef.current, { type: "SELECTOR_CHANGE", selector_type: "aigent", id }, getIframeOrigin(config));
      }
    } catch {
      toast.error("Failed to update Aigent selector");
    }
  }, [config, applyConfigUpdate]);

  const selectLLM = useCallback(async (id: string) => {
    try {
      const result: SelectorResult = await updateSelector("llm", id);
      setConfig((prev) =>
        prev
          ? { ...prev, selectors: { ...prev.selectors, llm: { ...prev.selectors.llm, current: id } } }
          : prev
      );
      applyConfigUpdate(result.shell_config);
      if (iframeRef.current && config) {
        postToIframe(iframeRef.current, { type: "SELECTOR_CHANGE", selector_type: "llm", id }, getIframeOrigin(config));
      }
    } catch {
      toast.error("Failed to update LLM selector");
    }
  }, [config, applyConfigUpdate]);

  const handleMenuAction = useCallback(async (itemId: string) => {
    // Handle refresh → reset to welcome
    if (itemId === "refresh") {
      setShellState("welcome");
      setActiveMenuItem(null);
      if (iframeRef.current && config) {
        postToIframe(iframeRef.current, { type: "RESET_WELCOME" }, getIframeOrigin(config));
      }
      toast.success("Reset to welcome");
      return;
    }

    try {
      const result: MenuActionResult = await menuAction(itemId);
      applyConfigUpdate(result.shell_config);
      setShellState("post-welcome");
      setActiveMenuItem(itemId);

      if (iframeRef.current && config) {
        postToIframe(
          iframeRef.current,
          { type: "MENU_ACTION", item_id: itemId, menu_event: result.menu_event },
          getIframeOrigin(config),
        );
      }
      toast.success(`Action: ${itemId}`);
    } catch {
      toast.error(`Menu action failed: ${itemId}`);
    }
  }, [config, applyConfigUpdate]);

  const submitPrompt = useCallback((text: string) => {
    if (!text.trim()) return;
    if (iframeRef.current && config) {
      postToIframe(iframeRef.current, { type: "PROMPT_SUBMIT", text }, getIframeOrigin(config));
    }
    toast.success("Prompt sent");
  }, [config]);

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

  return (
    <ShellCtx.Provider
      value={{
        config, loading, authenticated, shellState,
        activeMenuItem, quickLinksExpanded, toggleQuickLinks,
        hydrate, selectAigent, selectLLM, handleMenuAction,
        submitPrompt, resetToWelcome, iframeRef,
      }}
    >
      {children}
    </ShellCtx.Provider>
  );
}
