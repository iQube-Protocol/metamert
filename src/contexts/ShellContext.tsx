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
import {
  type SmartMenuMode,
  type ViewState,
  type SubmenuType,
  type QuickActionVisibility,
  type InteractionState,
  type CartridgeState,
  MODE_CONFIGS,
  DEFAULT_CARTRIDGES,
  IDLE_TIMEOUT_MS,
} from "@/lib/smart-menu-config";

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
  resetKey: number;

  // Smart Menu state
  viewState: ViewState;
  activeMode: SmartMenuMode | null;
  submenuType: SubmenuType | null;
  submenuVisibility: QuickActionVisibility;
  interactionState: InteractionState;
  cartridgeState: CartridgeState;

  // Actions
  toggleQuickLinks: () => void;
  hydrate: () => Promise<void>;
  selectAigent: (id: string) => Promise<void>;
  selectLLM: (id: string) => Promise<void>;
  handleMenuAction: (itemId: string) => Promise<void>;
  submitPrompt: (text: string) => void;
  resetToWelcome: () => void;
  updateTrust: (trust: { level: string; signals: string[]; scores?: Record<string, number> }) => void;
  iframeRef: React.RefObject<HTMLIFrameElement>;

  // Smart Menu actions
  activateMode: (mode: SmartMenuMode) => void;
  deactivateMode: () => void;
  setSubmenuType: (type: SubmenuType | null) => void;
  toggleSubmenu: () => void;
  selectCartridge: (cartridgeId: string) => void;
  selectCodex: (codexId: string) => void;
  resetIdleTimer: (reason?: string) => void;
  setInteractionState: (state: InteractionState) => void;
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
  return resolveIframeOrigin(config);
}

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
  const [resetKey, setResetKey] = useState(0);
  const bumpOverlay = useCallback(() => setOverlayTrigger((n) => n + 1), []);
  const iframeRef = useRef<HTMLIFrameElement>(null!);
  const inferCtrl = useRef<ReturnType<typeof createInferenceController> | null>(null);

  // Smart Menu state
  const [viewState, setViewState] = useState<ViewState>("defaultNav");
  const [activeMode, setActiveMode] = useState<SmartMenuMode | null>(null);
  const [submenuType, setSubmenuTypeState] = useState<SubmenuType | null>(null);
  const [submenuVisibility, setSubmenuVisibility] = useState<QuickActionVisibility>("visibleAuto");
  const [interactionState, setInteractionStateRaw] = useState<InteractionState>("idle");
  const [cartridgeState, setCartridgeState] = useState<CartridgeState>({
    activeCartridgeId: "qriptopian",
    activeCodexId: "qriptopian-codex",
    available: DEFAULT_CARTRIDGES,
  });

  // Idle timer ref
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Lazily create inference controller
  if (!inferCtrl.current) {
    inferCtrl.current = createInferenceController(setInferring);
  }

  useEffect(() => () => inferCtrl.current?.cleanup(), []);

  // Idle auto-hide logic
  const clearIdleTimer = useCallback(() => {
    if (idleTimerRef.current) { clearTimeout(idleTimerRef.current); idleTimerRef.current = null; }
  }, []);

  const startIdleTimer = useCallback(() => {
    clearIdleTimer();
    idleTimerRef.current = setTimeout(() => {
      // Return to default nav after idle timeout
      setViewState("defaultNav");
      setActiveMode(null);
      setSubmenuTypeState(null);
      setSubmenuVisibility("visibleAuto");
    }, 4000);
  }, [clearIdleTimer]);

  const resetIdleTimer = useCallback((reason?: string) => {
    // Carousel swipe does NOT reset idle
    if (reason === "carouselSwipe" || reason === "carouselDrag") return;
    if (submenuVisibility === "hiddenUserToggle") return; // respect manual toggle
    setSubmenuVisibility("visibleAuto");
    startIdleTimer();
  }, [startIdleTimer, submenuVisibility]);

  // Clean up idle timer on unmount
  useEffect(() => () => clearIdleTimer(), [clearIdleTimer]);

  // Smart Menu actions
  const activateMode = useCallback((mode: SmartMenuMode) => {
    // If tapping active mode, deactivate (collapse)
    if (activeMode === mode && viewState === "promptMode") {
      setViewState("defaultNav");
      setActiveMode(null);
      setSubmenuTypeState(null);
      setSubmenuVisibility("visibleAuto");
      clearIdleTimer();
      return;
    }
    setViewState("promptMode");
    setActiveMode(mode);
    setSubmenuTypeState("quickActions");
    setSubmenuVisibility("visibleAuto");
    startIdleTimer();
  }, [activeMode, viewState, clearIdleTimer, startIdleTimer]);

  const deactivateMode = useCallback(() => {
    setViewState("defaultNav");
    setActiveMode(null);
    setSubmenuTypeState(null);
    setSubmenuVisibility("visibleAuto");
    clearIdleTimer();
  }, [clearIdleTimer]);

  const setSubmenuType = useCallback((type: SubmenuType | null) => {
    setSubmenuTypeState(type);
    if (type) {
      setSubmenuVisibility("visibleAuto");
      startIdleTimer();
    }
  }, [startIdleTimer]);

  const toggleSubmenu = useCallback(() => {
    setSubmenuVisibility(prev => {
      if (prev === "hiddenUserToggle" || prev === "hiddenAutoIdle") {
        startIdleTimer();
        return "visibleAuto";
      }
      clearIdleTimer();
      return "hiddenUserToggle";
    });
  }, [startIdleTimer, clearIdleTimer]);

  const selectCartridge = useCallback((cartridgeId: string) => {
    setCartridgeState(prev => {
      const cart = prev.available.find(c => c.id === cartridgeId);
      if (!cart) return prev;
      // If current codex is not in the new cartridge, use default
      const codexValid = cart.codexes.some(c => c.id === prev.activeCodexId);
      return {
        ...prev,
        activeCartridgeId: cartridgeId,
        activeCodexId: codexValid ? prev.activeCodexId : cart.default_codex_id,
      };
    });
    // Return to quick actions after selecting
    setSubmenuTypeState("quickActions");
    startIdleTimer();

    // Notify iframe
    if (iframeRef.current && config) {
      postToIframe(iframeRef.current, { type: "SELECTOR_CHANGE", selector_type: "cartridge" as any, id: cartridgeId }, getIframeOrigin(config));
    }
  }, [config, startIdleTimer]);

  const selectCodex = useCallback((codexId: string) => {
    setCartridgeState(prev => ({
      ...prev,
      activeCodexId: codexId,
    }));
    setSubmenuTypeState("quickActions");
    startIdleTimer();

    if (iframeRef.current && config) {
      postToIframe(iframeRef.current, { type: "SELECTOR_CHANGE", selector_type: "codex" as any, id: codexId }, getIframeOrigin(config));
    }
  }, [config, startIdleTimer]);

  const setInteractionState = useCallback((state: InteractionState) => {
    setInteractionStateRaw(state);
    if (state !== "idle") {
      resetIdleTimer(state);
    }
  }, [resetIdleTimer]);

  // Listen for iframe inference lifecycle signals
  useEffect(() => {
    if (!config) return;
    const runtimeOrigin = getIframeOrigin(config);

    const handler = (e: MessageEvent) => {
      if (runtimeOrigin !== "*" && e.origin !== runtimeOrigin) return;
      const msg = normalizeInbound(e.data);
      if (!msg) return;
      const t = msg.type as string;

      if (import.meta.env.DEV) {
        console.log("[Shell:lifecycle]", t, "origin:", e.origin, "state:", msg.state ?? "-");
      }

      if (isInferenceStart(msg)) {
        console.log("[Shell] Inference START signal:", t);
        setShellState("post-welcome");
        inferCtrl.current?.start();
        bumpOverlay();
        return;
      }

      const payload = (msg as any).payload ?? msg;
      const welcomeInferenceCompleted =
        payload.welcome_inference_completed === true ||
        payload.welcome_prompt_executed === true;

      if (isInferenceComplete(msg)) {
        console.log("[Shell] Inference COMPLETE signal:", t, welcomeInferenceCompleted ? "(welcome_inference_completed)" : "");
        setShellState("post-welcome");
        inferCtrl.current?.complete();
        bumpOverlay();
        return;
      }

      if (t === "WELCOME_COMPLETE") {
        setShellState("post-welcome");
        inferCtrl.current?.complete();
        bumpOverlay();
        return;
      }

      if (t === "STATE_SYNC" && welcomeInferenceCompleted) {
        setShellState("post-welcome");
        inferCtrl.current?.complete();
        bumpOverlay();
        return;
      }

      if (
        t === "PROMPT_SUBMIT" || t === "PROMPT_RESPONSE" ||
        t === "RESPONSE" || t === "CHAT_RESPONSE" ||
        t === "RESULT" || t === "OUTPUT"
      ) {
        setShellState("post-welcome");
        inferCtrl.current?.complete();
        bumpOverlay();
        return;
      }

      if (t === "NAVIGATE" && (msg as any).action === "close_codex") {
        if (iframeRef.current && config) {
          postToIframe(iframeRef.current, { type: "MENU_ACTION", action_id: "close_codex" }, getIframeOrigin(config));
        }
        return;
      }
    };

    const codexCloseHandler = (e: MessageEvent) => {
      const raw = e.data;
      const isString = typeof raw === "string";
      const isObj = raw && typeof raw === "object";
      const typeMatch =
        (isString && raw === "METAME_CODEX_CLOSE_LAYER") ||
        (isObj && (raw.type === "METAME_CODEX_CLOSE_LAYER" ||
                   (raw.payload && typeof raw.payload === "object" && (raw.payload as any).type === "METAME_CODEX_CLOSE_LAYER")));
      if (!typeMatch) return;
      console.log("[Shell:CODEX_CLOSE_DIAG] METAME_CODEX_CLOSE_LAYER received", { origin: e.origin });
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
    } finally {
      setLoading(false);
    }
  }, []);

  const isLiveConfig = useCallback((cfg?: ShellConfig): boolean => {
    if (!cfg) return false;
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
    if (itemId === "refresh" || itemId === "__runtime_refresh__") {
      setShellState("welcome");
      setActiveMenuItem(null);
      deactivateMode();
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
      deactivateMode();
      setResetKey((k) => k + 1);
      toast.success("Reset — iframe remounted");
      return;
    }

    if (itemId === "close_codex") {
      const origin = config ? getIframeOrigin(config) : "(no config)";
      if (iframeRef.current && config) {
        postToIframe(iframeRef.current, { type: "MENU_ACTION", action_id: "close_codex" }, origin);
      }
      return;
    }

    setShellState("post-welcome");
    setActiveMenuItem(itemId);
    inferCtrl.current?.start();

    try {
      const result: MenuActionResult = await menuAction(itemId);
      applyConfigUpdate(result.shell_config);
      if (result.iframe_event && iframeRef.current && config) {
        postRawToIframe(iframeRef.current, result.iframe_event, getIframeOrigin(config));
      } else if (result.menu_event && iframeRef.current && config) {
        postToIframe(
          iframeRef.current,
          { type: "MENU_ACTION", action_id: itemId, prompt: result.menu_event?.prompt, menu_event: result.menu_event },
          getIframeOrigin(config),
        );
      }
    } catch {
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
  }, [config, applyConfigUpdate, deactivateMode]);

  const submitPrompt = useCallback(async (text: string) => {
    if (!text.trim()) return;
    setShellState("post-welcome");
    inferCtrl.current?.start();
    try {
      const result: PromptActionResult = await promptAction(text);
      applyConfigUpdate(result.shell_config);
      if (iframeRef.current && config) {
        if (result.iframe_event) {
          postRawToIframe(iframeRef.current, result.iframe_event, getIframeOrigin(config));
        } else {
          postToIframe(iframeRef.current, { type: "PROMPT_SUBMIT", text }, getIframeOrigin(config));
        }
      }
    } catch {
      if (iframeRef.current && config) {
        postToIframe(iframeRef.current, { type: "PROMPT_SUBMIT", text }, getIframeOrigin(config));
      }
    } finally {
      inferCtrl.current?.start();
    }
  }, [config, applyConfigUpdate]);

  const resetToWelcome = useCallback(() => {
    setShellState("welcome");
    setActiveMenuItem(null);
    setQuickLinksExpanded(true);
    deactivateMode();
    if (iframeRef.current && config) {
      postToIframe(iframeRef.current, { type: "RESET_WELCOME" }, getIframeOrigin(config));
    }
  }, [config, deactivateMode]);

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
        activeMenuItem, quickLinksExpanded, inferring, overlayTrigger, resetKey,
        // Smart Menu state
        viewState, activeMode, submenuType, submenuVisibility, interactionState, cartridgeState,
        // Actions
        toggleQuickLinks,
        hydrate, selectAigent, selectLLM, handleMenuAction,
        submitPrompt, resetToWelcome, updateTrust, iframeRef,
        // Smart Menu actions
        activateMode, deactivateMode, setSubmenuType, toggleSubmenu,
        selectCartridge, selectCodex, resetIdleTimer, setInteractionState,
      }}
    >
      {children}
    </ShellCtx.Provider>
  );
}
