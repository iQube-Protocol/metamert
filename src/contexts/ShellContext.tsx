/* HMR boundary — ShellProvider */
import React, { createContext, useContext, useState, useCallback, useRef, useEffect, useMemo } from "react";
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

/** Active runtime context — drives the header lightning bolt color and copilot framing. */
export type RuntimeContext = "metame" | "knyt";

// Runtime-driven hints the shell can reflect without rendering content (LOV-301)
export interface RuntimeHints {
  activeGuide: boolean;      // runtime has an active guide session
  focusMode: boolean;        // runtime requests minimal shell chrome
  deepLink: string | null;   // runtime signalled a deep-link path
  handoff: boolean;          // runtime is in a handoff state
}

const INITIAL_HINTS: RuntimeHints = {
  activeGuide: false,
  focusMode: false,
  deepLink: null,
  handoff: false,
};

// Iframe readiness state (LOV-303)
export type IframeReadiness = "probing" | "loading" | "ready" | "error" | "blocked";

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

  // Runtime-driven state awareness (LOV-301)
  runtimeHints: RuntimeHints;

  // Iframe readiness (LOV-303)
  iframeReadiness: IframeReadiness;

  // LOV-401: KNYT onboarding active flag
  knytOnboarding: boolean;

  // Cartridge overlay (driven by runtime CARTRIDGE_OVERLAY_ACTIVE messages)
  cartridgeOverlay: { slug: string; title: string } | null;
  closeCartridgeOverlay: () => void;

  // Smart Menu state
  viewState: ViewState;
  activeMode: SmartMenuMode | null;
  submenuType: SubmenuType | null;
  submenuVisibility: QuickActionVisibility;
  interactionState: InteractionState;
  cartridgeState: CartridgeState;
  personaState: PersonaState;

  // Runtime context (metaMe ↔ KNYT) — drives the header lightning color
  // and the play menu's central context-toggle quick action.
  runtimeContext: RuntimeContext;
  setRuntimeContext: (next: RuntimeContext) => void;

  // Actions
  toggleQuickLinks: () => void;
  hydrate: () => Promise<void>;
  selectAigent: (id: string) => Promise<void>;
  selectLLM: (id: string) => Promise<void>;
  handleMenuAction: (itemId: string) => Promise<void>;
  sendIframeAction: (actionId: string) => void;
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
  /** Launch a cartridge inside the runtime iframe (does NOT change header color). */
  launchCartridge: (cartridgeId: string) => void;
  selectCartridge: (cartridgeId: string) => void;
  selectCodex: (codexId: string) => void;
  selectPersona: (personaId: string) => void;
  resetIdleTimer: (reason?: string) => void;
  pauseIdleTimer: () => void;
  resumeIdleTimer: () => void;
  setInteractionState: (state: InteractionState) => void;
  setPromptHasText: (hasText: boolean) => void;
  /** Briefly animate the trust/reliability score dots to indicate processing. */
  pulseInference: () => void;
}

const ShellCtx = createContext<ShellContextValue | null>(null);

// Stable module-level ref survives HMR — context value is written here by the provider
let __shellSingleton: ShellContextValue | null = null;

export function useShell(): ShellContextValue {
  // Prefer React context; fall back to module singleton during HMR transitions
  const ctx = useContext(ShellCtx);
  const value = ctx ?? __shellSingleton;
  if (!value) throw new Error("useShell must be used inside ShellProvider");
  return value;
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

  function complete(graceMs: number = 2_000) {
    if (safetyTimer) { clearTimeout(safetyTimer); safetyTimer = null; }
    if (graceTimer) { clearTimeout(graceTimer); graceTimer = null; }
    graceTimer = setTimeout(() => { setInferring(false); graceTimer = null; }, graceMs);
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
  const [runtimeHints, setRuntimeHints] = useState<RuntimeHints>(INITIAL_HINTS);
  const [iframeReadiness, setIframeReadiness] = useState<IframeReadiness>("probing");
  const [knytOnboarding, setKnytOnboarding] = useState(false);
  const [cartridgeOverlay, setCartridgeOverlay] = useState<{ slug: string; title: string } | null>(null);
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
    activeCartridgeId: "qripto-codex",
    activeCodexId: "qripto-codex",
    available: DEFAULT_CARTRIDGES,
  });
  const [personaState, setPersonaState] = useState<PersonaState>({
    activePersonaId: "metame-persona",
    available: DEFAULT_PERSONAS,
  });

  // Runtime context (metaMe ↔ KNYT) — drives header lightning color and copilot framing
  const [runtimeContext, setRuntimeContextState] = useState<RuntimeContext>("metame");

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

  // Notify iframe of mode change
  const notifyModeChanged = useCallback((mode: SmartMenuMode | null, vs: ViewState) => {
    if (!iframeRef.current || !config) return;
    postToIframe(iframeRef.current, {
      type: "MODE_CHANGED",
      mode,
      view_state: vs,
      cartridge_id: cartridgeState.activeCartridgeId,
      codex_id: cartridgeState.activeCodexId,
    }, getIframeOrigin(config));
  }, [config, cartridgeState.activeCartridgeId, cartridgeState.activeCodexId]);

  // Smart Menu actions
  const activateMode = useCallback((mode: SmartMenuMode) => {
    // If tapping active mode, deactivate (collapse)
    if (activeMode === mode && viewState === "promptMode") {
      setViewState("defaultNav");
      setActiveMode(null);
      setSubmenuTypeState(null);
      setSubmenuVisibility("visibleAuto");
      clearIdleTimer();
      notifyModeChanged(null, "defaultNav");
      return;
    }
    setViewState("promptMode");
    setActiveMode(mode);
    setSubmenuTypeState("quickActions");
    setSubmenuVisibility("visibleAuto");
    startIdleTimer();
    notifyModeChanged(mode, "promptMode");
  }, [activeMode, viewState, clearIdleTimer, startIdleTimer, notifyModeChanged]);

  // Quick-action-only mode: show submenu without prompt bar (no keyboard on mobile)
  const activateQuickActions = useCallback((mode: SmartMenuMode) => {
    // If tapping same mode in quickActionOnly, collapse
    if (activeMode === mode && viewState === "quickActionOnly") {
      setViewState("defaultNav");
      setActiveMode(null);
      setSubmenuTypeState(null);
      setSubmenuVisibility("visibleAuto");
      clearIdleTimer();
      notifyModeChanged(null, "defaultNav");
      return;
    }
    setViewState("quickActionOnly");
    setActiveMode(mode);
    setSubmenuTypeState("quickActions");
    setSubmenuVisibility("visibleAuto");
    startIdleTimer();
    notifyModeChanged(mode, "quickActionOnly");
  }, [activeMode, viewState, clearIdleTimer, startIdleTimer, notifyModeChanged]);

  const deactivateMode = useCallback(() => {
    setViewState("defaultNav");
    setActiveMode(null);
    setSubmenuTypeState(null);
    setSubmenuVisibility("visibleAuto");
    clearIdleTimer();
    notifyModeChanged(null, "defaultNav");
  }, [clearIdleTimer, notifyModeChanged]);

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

  /**
   * Launch a cartridge inside the runtime iframe.
   * Sends a LAUNCH_CARTRIDGE message — does NOT mutate cartridgeState
   * (so the header lightning bolt color is unaffected; that color is now
   * driven exclusively by `runtimeContext`).
   */
  const launchCartridge = useCallback((cartridgeId: string) => {
    const cart = cartridgeState.available.find(c => c.id === cartridgeId);
    const codexId = cart?.default_codex_id;

    if (iframeRef.current && config) {
      const origin = getIframeOrigin(config);

      // Canonical mount message — runtime opens the cartridge overlay
      // (z-axis) and replies with CARTRIDGE_OVERLAY_ACTIVE.
      // Runtime's MetaMeRuntimeClient handler reads msg.payload.cartridge_id,
      // so the envelope MUST be nested under `payload`.
      postToIframe(iframeRef.current, {
        type: "LAUNCH_CARTRIDGE",
        payload: { cartridge_id: cartridgeId },
      }, origin);

      // Seed an initialisation prompt so the cartridge opens with a
      // meaningful first turn instead of an empty surface.
      const seedPrompts: Record<string, string> = {
        "metame-codex": "Open the metaMe cartridge and orient me.",
        "qripto-codex": "Open the Qriptopian cartridge and show me what's available.",
        "knyt-codex":   "Open the KNYT cartridge and walk me through it.",
      };
      const seedPrompt =
        seedPrompts[cartridgeId] ??
        `Open the ${cart?.label ?? cartridgeId} cartridge.`;

      postToIframe(iframeRef.current, {
        type: "PROMPT_SUBMIT",
        text: seedPrompt,
        cartridge_id: cartridgeId,
        codex_id: codexId,
      }, origin);
    }

    // Restore local cartridge state so the active checkmark moves, the codex
    // selector follows the new cartridge default, and outbound context
    // enrichment carries the correct cartridge_id + codex_id. Header lightning
    // color is NOT affected (RuntimeHeader reads `runtimeContext`).
    setCartridgeState(prev => ({
      ...prev,
      activeCartridgeId: cartridgeId,
      activeCodexId: codexId ?? prev.activeCodexId,
    }));

    // Optimistically show the cartridge overlay indicator (floppy-disk + X)
    // in the header so the user gets immediate feedback.
    if (cart) {
      setCartridgeOverlay({ slug: cart.id, title: cart.label ?? cart.id });
    }

    // Pulse trust/reliability dots while the cartridge mounts.
    inferCtrl.current?.start();
    inferCtrl.current?.complete(4_000);

    // Return to quick actions after selecting
    setSubmenuTypeState("quickActions");
    startIdleTimer();
  }, [config, cartridgeState.available, startIdleTimer]);

  /**
   * Legacy `selectCartridge` — kept for backward compat (e.g. cartridge selector
   * pill click). Now routes through `launchCartridge` so it dispatches to the
   * iframe instead of mutating header state.
   */
  const selectCartridge = useCallback((cartridgeId: string) => {
    launchCartridge(cartridgeId);
  }, [launchCartridge]);

  /**
   * Set the active runtime context (metaMe ↔ KNYT).
   * Sends RUNTIME_CONTEXT_CHANGE to the iframe + AA-API so the copilot
   * reframes itself, and updates local state so the header lightning bolt
   * color updates immediately.
   */
  const setRuntimeContext = useCallback((next: RuntimeContext) => {
    setRuntimeContextState(next);
    if (iframeRef.current && config) {
      const origin = getIframeOrigin(config);
      postToIframe(iframeRef.current, {
        type: "RUNTIME_CONTEXT_CHANGE",
        context: next,
      } as any, origin);
    }
    // Best-effort AA-API notification (non-blocking)
    void menuAction("runtime-context", { runtime_context: next } as any).catch(() => {
      /* swallow — runtime context is local-first */
    });
  }, [config]);

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

      // LOV-301: Extract runtime hints from STATE_SYNC
      if (t === "STATE_SYNC") {
        const state = (msg as any).state ?? msg;
        setRuntimeHints(prev => ({
          activeGuide: typeof state.active_guide === "boolean" ? state.active_guide : prev.activeGuide,
          focusMode: typeof state.focus_mode === "boolean" ? state.focus_mode : prev.focusMode,
          deepLink: typeof state.deep_link === "string" ? state.deep_link : prev.deepLink,
          handoff: typeof state.handoff === "boolean" ? state.handoff : prev.handoff,
        }));
        // LOV-401: Track KNYT onboarding state from runtime
        if (typeof state.knyt_onboarding === "boolean") {
          setKnytOnboarding(state.knyt_onboarding);
        }
      }

      // LOV-301: Handle dedicated RUNTIME_HINT signals
      if (t === "RUNTIME_HINT") {
        const hint = (msg as any).hint as string;
        const value = (msg as any).value;
        setRuntimeHints(prev => {
          if (hint === "active_guide" && typeof value === "boolean") return { ...prev, activeGuide: value };
          if (hint === "focus_mode" && typeof value === "boolean") return { ...prev, focusMode: value };
          if (hint === "deep_link") return { ...prev, deepLink: value as string | null };
          if (hint === "handoff" && typeof value === "boolean") return { ...prev, handoff: value };
          return prev;
        });
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

      // TRUST_UPDATE from runtime — update shell trust state
      if (t === "TRUST_UPDATE") {
        const trustPayload = (msg as any).trust ?? msg;
        if (trustPayload.level) {
          updateTrust(trustPayload);
          console.log("[Shell] Trust updated from runtime:", trustPayload);
        }
        return;
      }

      if (t === "NAVIGATE" && (msg as any).action === "close_codex") {
        if (iframeRef.current && config) {
          postToIframe(iframeRef.current, { type: "MENU_ACTION", action_id: "close_codex" }, getIframeOrigin(config));
        }
        return;
      }

      // Cartridge overlay state from runtime
      if (t === "CARTRIDGE_OVERLAY_ACTIVE") {
        const p = (msg as any) as { active?: boolean; slug?: string; title?: string };
        if (p.active && p.slug) {
          setCartridgeOverlay({ slug: p.slug, title: p.title ?? p.slug });
        } else {
          setCartridgeOverlay(null);
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

  // Send DEVICE_CONTEXT_UPDATE to iframe on viewport resize
  useEffect(() => {
    if (!config) return;
    const origin = getIframeOrigin(config);

    function getDeviceType(w: number): "mobile" | "tablet" | "desktop" {
      if (w < 768) return "mobile";
      if (w < 1024) return "tablet";
      return "desktop";
    }

    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    const sendUpdate = () => {
      if (!iframeRef.current) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      postToIframe(iframeRef.current, {
        type: "DEVICE_CONTEXT_UPDATE",
        context: { device: getDeviceType(w), viewport: { width: w, height: h } },
      }, origin);
    };

    const onResize = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(sendUpdate, 250);
    };

    // Send initial context after iframe loads
    const initialTimer = setTimeout(sendUpdate, 1000);
    window.addEventListener("resize", onResize);
    return () => {
      clearTimeout(initialTimer);
      if (debounceTimer) clearTimeout(debounceTimer);
      window.removeEventListener("resize", onResize);
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

    const ctx = {
      cartridge_id: cartridgeState.activeCartridgeId,
      codex_id: cartridgeState.activeCodexId,
      mode: activeMode ?? undefined,
    };

    try {
      const result: MenuActionResult = await menuAction(itemId, ctx);
      applyConfigUpdate(result.shell_config);
      if (result.iframe_event && iframeRef.current && config) {
        postRawToIframe(iframeRef.current, result.iframe_event, getIframeOrigin(config));
      } else if (result.menu_event && iframeRef.current && config) {
        postToIframe(
          iframeRef.current,
          { type: "MENU_ACTION", action_id: itemId, prompt: result.menu_event?.prompt, menu_event: result.menu_event, ...ctx },
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
          { type: "MENU_ACTION", action_id: itemId, prompt: menuEvent.prompt, menu_event: menuEvent, ...ctx },
          getIframeOrigin(config),
        );
      }
    }
  }, [config, applyConfigUpdate, deactivateMode, cartridgeState.activeCartridgeId, cartridgeState.activeCodexId]);

  /** Send a MENU_ACTION directly to the iframe without API round-trip */
  const sendIframeAction = useCallback((actionId: string) => {
    if (!iframeRef.current || !config) return;
    const origin = getIframeOrigin(config);
    postToIframe(iframeRef.current, {
      type: "MENU_ACTION",
      action_id: actionId,
      cartridge_id: cartridgeState.activeCartridgeId,
      codex_id: cartridgeState.activeCodexId,
    }, origin);
  }, [config, cartridgeState.activeCartridgeId, cartridgeState.activeCodexId]);

  const submitPrompt = useCallback(async (text: string) => {
    if (!text.trim()) return;
    setShellState("post-welcome");
    inferCtrl.current?.start();
    const ctx = {
      cartridge_id: cartridgeState.activeCartridgeId,
      codex_id: cartridgeState.activeCodexId,
      mode: activeMode ?? undefined,
    };
    try {
      const result: PromptActionResult = await promptAction(text, ctx);
      applyConfigUpdate(result.shell_config);
      if (iframeRef.current && config) {
        if (result.iframe_event) {
          postRawToIframe(iframeRef.current, result.iframe_event, getIframeOrigin(config));
        } else {
          postToIframe(iframeRef.current, { type: "PROMPT_SUBMIT", text, ...ctx }, getIframeOrigin(config));
        }
      }
    } catch {
      if (iframeRef.current && config) {
        postToIframe(iframeRef.current, { type: "PROMPT_SUBMIT", text, ...ctx }, getIframeOrigin(config));
      }
    } finally {
      inferCtrl.current?.start();
    }
  }, [config, applyConfigUpdate, cartridgeState.activeCartridgeId, cartridgeState.activeCodexId]);

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

  const closeCartridgeOverlay = useCallback(() => {
    if (iframeRef.current && config) {
      postToIframe(iframeRef.current, { type: "CARTRIDGE_OVERLAY_CLOSE" } as any, getIframeOrigin(config));
    }
    setCartridgeOverlay(null);
  }, [config]);

  const pulseInference = useCallback(() => {
    inferCtrl.current?.start();
    // Extended grace (4s) so the trust/reliability dot pulse stays visible
    // long enough to clearly signal that a quick action triggered processing.
    inferCtrl.current?.complete(4_000);
  }, []);


  const ctxValue: ShellContextValue = useMemo(() => ({
    config, loading, authenticated, shellState,
    activeMenuItem, quickLinksExpanded, inferring, overlayTrigger, resetKey,
    runtimeHints, iframeReadiness, knytOnboarding,
    cartridgeOverlay, closeCartridgeOverlay,
    // Smart Menu state
    viewState, activeMode, submenuType, submenuVisibility, interactionState, cartridgeState, personaState,
    // Runtime context
    runtimeContext, setRuntimeContext,
    // Actions
    toggleQuickLinks,
    hydrate, selectAigent, selectLLM, handleMenuAction, sendIframeAction,
    submitPrompt, resetToWelcome, updateTrust, iframeRef,
    // Smart Menu actions
    activateMode, activateQuickActions, deactivateMode, setSubmenuType, toggleSubmenu,
    launchCartridge, selectCartridge, selectCodex, selectPersona, resetIdleTimer, pauseIdleTimer, resumeIdleTimer, setInteractionState, setPromptHasText,
    pulseInference,
  }), [
    config, loading, authenticated, shellState,
    activeMenuItem, quickLinksExpanded, inferring, overlayTrigger, resetKey,
    runtimeHints, iframeReadiness, knytOnboarding,
    cartridgeOverlay, closeCartridgeOverlay,
    viewState, activeMode, submenuType, submenuVisibility, interactionState, cartridgeState, personaState,
    runtimeContext, setRuntimeContext,
    toggleQuickLinks, hydrate, selectAigent, selectLLM, handleMenuAction, sendIframeAction,
    submitPrompt, resetToWelcome, updateTrust, iframeRef,
    activateMode, activateQuickActions, deactivateMode, setSubmenuType, toggleSubmenu,
    launchCartridge, selectCartridge, selectCodex, selectPersona, resetIdleTimer, pauseIdleTimer, resumeIdleTimer, setInteractionState, setPromptHasText,
    pulseInference,
  ]);

  // Publish to module singleton so HMR-stale consumers can still read it
  __shellSingleton = ctxValue;

  return (
    <ShellCtx.Provider value={ctxValue}>
      {children}
    </ShellCtx.Provider>
  );
}
