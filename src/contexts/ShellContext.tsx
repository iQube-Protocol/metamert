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
import {
  postToIframe,
  postRawToIframe,
  normalizeInbound,
  isInferenceStart,
  isInferenceComplete,
} from "@/lib/shell-messages";
import { resolveIframeOrigin } from "@/lib/iframe-origin";
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
  overlayTrigger: number;
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

/** Use shared origin resolver */
function getIframeOrigin(config: ShellConfig): string {
  return resolveIframeOrigin(config);
}

/** Centralized inference lifecycle helpers used by the provider */
function createInferenceController(
  setInferring: React.Dispatch<React.SetStateAction<boolean>>,
) {
  let safetyTimer: ReturnType<typeof setTimeout> | null = null;
  let graceTimer: ReturnType<typeof setTimeout> | null = null;

  function clearTimers() {
    if (safetyTimer) { clearTimeout(safetyTimer); safetyTimer = null; }
    if (graceTimer) { clearTimeout(graceTimer); graceTimer = null; }
  }

  function start() {
    clearTimers();
    setInferring(true);
    safetyTimer = setTimeout(() => { setInferring(false); safetyTimer = null; }, 30_000);
  }

  function complete() {
    if (safetyTimer) { clearTimeout(safetyTimer); safetyTimer = null; }
    if (graceTimer) { clearTimeout(graceTimer); graceTimer = null; }
    graceTimer = setTimeout(() => { setInferring(false); graceTimer = null; }, 2_000);
  }

  function cleanup() { clearTimers(); }

  return { start, complete, cleanup };
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
  const [overlayTrigger, setOverlayTrigger] = useState(0);
  const bumpOverlay = useCallback(() => setOverlayTrigger((n) => n + 1), []);
  const iframeRef = useRef<HTMLIFrameElement>(null!);
  const inferCtrl = useRef<ReturnType<typeof createInferenceController> | null>(null);

  // Lazily create inference controller
  if (!inferCtrl.current) {
    inferCtrl.current = createInferenceController(setInferring);
  }

  // Clean up timers on unmount
  useEffect(() => () => inferCtrl.current?.cleanup(), []);

  // Listen for iframe inference lifecycle signals
  useEffect(() => {
    if (!config) return;
    const runtimeOrigin = getIframeOrigin(config);

    const handler = (e: MessageEvent) => {
      // Accept messages from runtime origin OR wildcard if origin is "*"
      if (runtimeOrigin !== "*" && e.origin !== runtimeOrigin) return;

      const msg = normalizeInbound(e.data);
      if (!msg) return;

      const t = msg.type as string;

      if (import.meta.env.DEV) {
        console.log("[Shell:lifecycle]", t, "origin:", e.origin, "state:", msg.state ?? "-");
      }

      // Inference start signals
      if (isInferenceStart(msg)) {
        console.log("[Shell] Inference START signal:", t);
        setShellState("post-welcome");
        inferCtrl.current?.start();
        bumpOverlay();
        return;
      }

      // Inference completion signals
      if (isInferenceComplete(msg)) {
        console.log("[Shell] Inference COMPLETE signal:", t);
        setShellState("post-welcome");
        inferCtrl.current?.complete();
        bumpOverlay();
        return;
      }

      // WELCOME_COMPLETE — iframe's welcome flow is done; activate prompt box
      if (t === "WELCOME_COMPLETE") {
        console.log("[Shell] WELCOME_COMPLETE → transitioning to post-welcome");
        setShellState("post-welcome");
        inferCtrl.current?.complete();
        bumpOverlay();
        return;
      }

      // Catch-all: any PROMPT_SUBMIT echo or RESPONSE from runtime means
      // the first prompt was handled inside iframe — transition shell
      if (
        t === "PROMPT_SUBMIT" || t === "PROMPT_RESPONSE" ||
        t === "RESPONSE" || t === "CHAT_RESPONSE" ||
        t === "RESULT" || t === "OUTPUT"
      ) {
        console.log("[Shell] Prompt lifecycle signal:", t, "→ post-welcome");
        setShellState("post-welcome");
        inferCtrl.current?.complete();
        bumpOverlay();
        return;
      }

      // RUNTIME_READY is a lifecycle signal — no state change needed.
    };

    // Diagnostic listener: catch METAME_CODEX_CLOSE_LAYER from ANY origin
    // so WS can confirm the message path through the thin client.
    const codexCloseHandler = (e: MessageEvent) => {
      const raw = e.data;
      const isString = typeof raw === "string";
      const isObj = raw && typeof raw === "object";
      const typeMatch =
        (isString && raw === "METAME_CODEX_CLOSE_LAYER") ||
        (isObj && (raw.type === "METAME_CODEX_CLOSE_LAYER" ||
                   (raw.payload && typeof raw.payload === "object" && (raw.payload as any).type === "METAME_CODEX_CLOSE_LAYER")));
      if (!typeMatch) return;
      console.log(
        "[Shell:CODEX_CLOSE_DIAG] METAME_CODEX_CLOSE_LAYER received at thin-client host",
        { origin: e.origin, dataType: typeof raw, data: raw },
      );
      // Thin client does NOT act on this — it is between codex iframe and runtime iframe.
      // Logged for WS diagnostic confirmation only.
    };

    window.addEventListener("message", handler);
    window.addEventListener("message", codexCloseHandler);
    return () => {
      window.removeEventListener("message", handler);
      window.removeEventListener("message", codexCloseHandler);
    };
  }, [config]);

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
      console.error("[Shell] Hydration failed:", err);
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
      console.error("[Shell] Failed to update Aigent selector");
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
      console.error("[Shell] Failed to update LLM selector");
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
    inferCtrl.current?.start();

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
    // No toast for regular menu actions
  }, [config, applyConfigUpdate]);

  const submitPrompt = useCallback(async (text: string) => {
    if (!text.trim()) return;
    console.log("[Shell] submitPrompt: transitioning to post-welcome, inferring=true");
    setShellState("post-welcome");
    inferCtrl.current?.start();
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
      // Safety timeout via inferCtrl — wait for iframe completion signals
      inferCtrl.current?.start();
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
        activeMenuItem, quickLinksExpanded, inferring, overlayTrigger, toggleQuickLinks,
        hydrate, selectAigent, selectLLM, handleMenuAction,
        submitPrompt, resetToWelcome, updateTrust, iframeRef,
      }}
    >
      {children}
    </ShellCtx.Provider>
  );
}
