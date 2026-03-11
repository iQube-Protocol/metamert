/* HMR boundary — ShellProvider */
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
  type PersonaState,
  MODE_CONFIGS,
  DEFAULT_CARTRIDGES,
  DEFAULT_PERSONAS,
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
  personaState: PersonaState;

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
  activateQuickActions: (mode: SmartMenuMode) => void;
  deactivateMode: () => void;
  setSubmenuType: (type: SubmenuType | null) => void;
  toggleSubmenu: () => void;
  selectCartridge: (cartridgeId: string) => void;
  selectCodex: (codexId: string) => void;
  selectPersona: (personaId: string) => void;
  resetIdleTimer: (reason?: string) => void;
  pauseIdleTimer: () => void;
  resumeIdleTimer: () => void;
  setInteractionState: (state: InteractionState) => void;
  setPromptHasText: (hasText: boolean) => void;
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
  const [personaState, setPersonaState] = useState<PersonaState>({
    activePersonaId: "metame-persona",
    available: DEFAULT_PERSONAS,
  });

  // Idle timer refs — split: 3s for quick action layer, 4s for full collapse
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const submenuTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Track whether prompt has text (prevents collapse)
  const promptHasTextRef = useRef(false);

  // Lazily create inference controller
  if (!inferCtrl.current) {
    inferCtrl.current = createInferenceController(setInferring);
  }

  useEffect(() => () => inferCtrl.current?.cleanup(), []);

  // Idle auto-hide logic — split timers per spec
  const clearIdleTimer = useCallback(() => {
    if (idleTimerRef.current) { clearTimeout(idleTimerRef.current); idleTimerRef.current = null; }
    if (submenuTimerRef.current) { clearTimeout(submenuTimerRef.current); submenuTimerRef.current = null; }
  }, []);

  const startIdleTimer = useCallback(() => {
    clearIdleTimer();
    // 4s: auto-hide quick action floating layer
    submenuTimerRef.current = setTimeout(() => {
      setSubmenuVisibility("hiddenAutoIdle");
      submenuTimerRef.current = null;
    }, 4000);
    // 5s: full prompt collapse (only if prompt is empty)
    idleTimerRef.current = setTimeout(() => {
      if (promptHasTextRef.current) return; // spec: don't collapse with text
      setViewState("defaultNav");
      setActiveMode(null);
      setSubmenuTypeState(null);
      setSubmenuVisibility("visibleAuto");
    }, 5000);
  }, [clearIdleTimer]);

  const resetIdleTimer = useCallback((reason?: string) => {
    // Carousel swipe does NOT reset idle
    if (reason === "carouselSwipe" || reason === "carouselDrag") return;
    if (submenuVisibility === "hiddenUserToggle") return; // respect manual toggle
    setSubmenuVisibility("visibleAuto");
    startIdleTimer();
  }, [startIdleTimer, submenuVisibility]);

  // Pause idle timer (pointer hovering over interactive area)
  const pauseIdleTimer = useCallback(() => {
    clearIdleTimer();
  }, [clearIdleTimer]);

  // Resume idle timer (pointer left interactive area)
  const resumeIdleTimer = useCallback(() => {
    if (submenuVisibility === "hiddenUserToggle") {
      // User manually hid quick actions — still start the 4s full-collapse timer
      // so prompt bar returns to main nav when pointer leaves
      clearIdleTimer();
      idleTimerRef.current = setTimeout(() => {
        if (promptHasTextRef.current) return;
        setViewState("defaultNav");
        setActiveMode(null);
        setSubmenuTypeState(null);
        setSubmenuVisibility("visibleAuto");
      }, 4000);
      return;
    }
    startIdleTimer();
  }, [startIdleTimer, submenuVisibility, clearIdleTimer]);

  // Expose prompt text tracking for idle logic
  const setPromptHasText = useCallback((hasText: boolean) => {
    promptHasTextRef.current = hasText;
  }, []);

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

  // Quick-action-only mode: show submenu without prompt bar (no keyboard on mobile)
  const activateQuickActions = useCallback((mode: SmartMenuMode) => {
    // If tapping same mode in quickActionOnly, collapse
    if (activeMode === mode && viewState === "quickActionOnly") {
      setViewState("defaultNav");
      setActiveMode(null);
      setSubmenuTypeState(null);
      setSubmenuVisibility("visibleAuto");
      clearIdleTimer();
      return;
    }
    setViewState("quickActionOnly");
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

  const selectPersona = useCallback((personaId: string) => {
    const persona = personaState.available.find(p => p.id === personaId);
    if (!persona) return;
    setPersonaState(prev => ({ ...prev, activePersonaId: personaId }));
    setSubmenuTypeState("quickActions");
    startIdleTimer();

    // Notify iframe to load the persona's iQube
    if (iframeRef.current && config) {
      postToIframe(iframeRef.current, {
        type: "SELECTOR_CHANGE",
        selector_type: "persona" as any,
        id: personaId,
        iqube_id: persona.iqubeId,
      }, getIframeOrigin(config));
    }
  }, [config, startIdleTimer, personaState.available]);

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

    // Helper: resolve rich trigger metadata from shell-config for quicklink actions
    const resolveEnrichedEvent = (itemId: string) => {
      // 1. Check quick_links for a per-action prompt
      const qlPrefix = `quick-${itemId}`;
      const quickLink = (config?.menu as any)?.policy?.quick_links?.find(
        (ql: any) => ql.id === qlPrefix || ql.id === itemId
      );
      // 2. Check parent mode's menu item for surface_plan + copilot instructions
      const parentItem = activeMode
        ? config?.menu?.items?.find((i: any) => i.id === activeMode)
        : null;
      const parentTrigger = (parentItem as any)?.trigger;
      // 3. Check direct menu item match
      const directItem = config?.menu?.items?.find((i: any) => i.id === itemId);
      const directTrigger = (directItem as any)?.trigger;

      const prompt = quickLink?.prompt ?? directTrigger?.prompt ?? parentTrigger?.prompt ?? `Launching ${itemId}…`;
      const intent = directTrigger?.intent ?? parentTrigger?.intent ?? itemId;
      const surface_plan_instruction = directTrigger?.surface_plan_instruction ?? parentTrigger?.surface_plan_instruction;
      const copilot_instruction = directTrigger?.copilot_instruction ?? parentTrigger?.copilot_instruction;

      return { prompt, intent, surface_plan_instruction, copilot_instruction };
    };

    try {
      const result: MenuActionResult = await menuAction(itemId);
      applyConfigUpdate(result.shell_config);
      if (iframeRef.current && config) {
        // Check if the API result has rich metadata or needs enrichment
        const hasRichMetadata = result.iframe_event?.surface_plan_instruction ||
          result.menu_event?.surface_plan_instruction;

        if (hasRichMetadata && result.iframe_event) {
          postRawToIframe(iframeRef.current, result.iframe_event, getIframeOrigin(config));
        } else {
          // Enrich with shell-config trigger data
          const enriched = resolveEnrichedEvent(itemId);
          const menuEvent = {
            action_id: itemId,
            prompt: enriched.prompt,
            intent: enriched.intent,
            surface_plan_instruction: enriched.surface_plan_instruction,
            copilot_instruction: enriched.copilot_instruction,
          };
          postToIframe(
            iframeRef.current,
            { type: "MENU_ACTION", action_id: itemId, prompt: enriched.prompt, menu_event: menuEvent },
            getIframeOrigin(config),
          );
        }
      }
    } catch {
      if (iframeRef.current && config) {
        const enriched = resolveEnrichedEvent(itemId);
        const menuEvent = {
          action_id: itemId,
          prompt: enriched.prompt,
          intent: enriched.intent,
          surface_plan_instruction: enriched.surface_plan_instruction,
          copilot_instruction: enriched.copilot_instruction,
        };
        postToIframe(
          iframeRef.current,
          { type: "MENU_ACTION", action_id: itemId, prompt: enriched.prompt, menu_event: menuEvent },
          getIframeOrigin(config),
        );
      }
    }
  }, [config, applyConfigUpdate, deactivateMode, activeMode]);

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
        viewState, activeMode, submenuType, submenuVisibility, interactionState, cartridgeState, personaState,
        // Actions
        toggleQuickLinks,
        hydrate, selectAigent, selectLLM, handleMenuAction,
        submitPrompt, resetToWelcome, updateTrust, iframeRef,
        // Smart Menu actions
        activateMode, activateQuickActions, deactivateMode, setSubmenuType, toggleSubmenu,
        selectCartridge, selectCodex, selectPersona, resetIdleTimer, pauseIdleTimer, resumeIdleTimer, setInteractionState, setPromptHasText,
      }}
    >
      {children}
    </ShellCtx.Provider>
  );
}
